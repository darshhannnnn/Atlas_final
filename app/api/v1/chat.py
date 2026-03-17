from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import (
    ChatRequest, ChatResponse, ConversationCreate, 
    ConversationResponse, MessageResponse, ExecutionMode, AgentTrace
)
from app.orchestrator import AgentOrchestrator
from app.services.vector_service import VectorService
from app.core.config import settings
from app.core.llm_client import MistralLLMClient
import time
import logging

logger = logging.getLogger("atlas.api.chat")

router = APIRouter()

# Initialize Mistral with optimized settings for faster responses
if settings.MISTRAL_API_KEY:
    llm_client = MistralLLMClient(
        api_key=settings.MISTRAL_API_KEY,
        model=settings.LLM_MODEL  # Uses mistral-small-latest for faster responses
    )
else:
    llm_client = None
    logger.warning("⚠️ MISTRAL_API_KEY not set - agent responses will be limited")

# Initialize Vector DB
vector_service = VectorService("./chroma_db")

# Initialize Orchestrator
orchestrator = AgentOrchestrator(llm_client, vector_service)


@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    conv_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = Conversation(
        user_id=current_user.id,
        title=conv_data.title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=0
    )


@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()
    
    return [
        ConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=len(conv.messages)
        )
        for conv in conversations
    ]

@router.patch("/conversations/{conversation_id}/title")
def update_conversation_title(
    conversation_id: int,
    title: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conversation.title = title
    db.commit()
    db.refresh(conversation)

    return {"message": "Title updated", "title": conversation.title}



@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation.messages


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    # Get or create conversation
    if chat_request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == chat_request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(user_id=current_user.id, title=chat_request.message[:50])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=chat_request.message
    )
    db.add(user_message)
    db.commit()
    
    # Prepare context
    context = {
        "user_id": current_user.id,
        "conversation_id": conversation.id,
        "uploaded_files": []
    }
    
    # Execute agents
    input_data = {"query": chat_request.message}
    
    try:
        # If no LLM client, provide a simple response
        if not llm_client:
            response_content = f"I received your message: '{chat_request.message}'\n\nNote: To enable AI-powered responses, please set your MISTRAL_API_KEY in the backend/.env file.\n\nYou can get a free API key from: https://console.mistral.ai"
            
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=response_content,
                agent_traces=[]
            )
            db.add(assistant_message)
            db.commit()
            db.refresh(assistant_message)
            
            execution_time = time.time() - start_time
            
            return ChatResponse(
                conversation_id=conversation.id,
                message_id=assistant_message.id,
                content=response_content,
                agent_traces=[],
                execution_time=execution_time
            )
        
        if chat_request.mode == ExecutionMode.SOLO:
            if not chat_request.selected_agent:
                raise HTTPException(status_code=400, detail="Agent selection required for solo mode")
            result = await orchestrator.execute_solo(
                chat_request.selected_agent.value,
                input_data,
                context
            )
        else:
            result = await orchestrator.execute_pipeline(input_data, context)
        
        # Extract content with robust error handling
        response_content = None
        
        # Check for error in result
        if result.get("error"):
            response_content = f"An error occurred: {result['error']}"
        # Full pipeline mode returns content directly
        elif result.get("content"):
            response_content = result["content"]
        # Solo mode - extract from nested result
        elif result.get("result", {}).get("result"):
            agent_result = result["result"]["result"]
            agent_name = result.get("agent", "unknown")
            
            if isinstance(agent_result, dict):
                # Format based on agent type - check all possible fields
                if "answer" in agent_result:
                    response_content = agent_result["answer"]
                elif "verification_report" in agent_result:
                    response_content = agent_result["verification_report"]
                elif "summary" in agent_result:
                    response_content = agent_result["summary"]
                elif "refined_content" in agent_result:
                    response_content = agent_result["refined_content"]
                elif "content" in agent_result:
                    response_content = agent_result["content"]
                elif "outline" in agent_result:
                    response_content = agent_result["outline"]
                elif "error" in agent_result:
                    response_content = f"Agent error: {agent_result['error']}"
                else:
                    # Fallback - format as readable text
                    filtered_items = {k: v for k, v in agent_result.items() if k not in ["sources", "source_count", "sections", "word_count", "original_length", "summary_length", "compression_ratio", "confidence_score", "passed", "needs_revision", "improvements_made", "refined_length"]}
                    if filtered_items:
                        response_content = "\n".join([f"{k}: {v}" for k, v in filtered_items.items()])
                    else:
                        response_content = f"{agent_name} completed successfully."
            else:
                response_content = str(agent_result)
        # Check if result has status error
        elif result.get("result", {}).get("status") == "error":
            error_msg = result["result"].get("error", "Unknown error")
            response_content = f"Agent execution failed: {error_msg}"
        else:
            response_content = "Task completed. Check agent traces for details."
        
        # Final safety check
        if not response_content or len(response_content.strip()) == 0:
            response_content = "No response generated. Please try again or check logs."
        
        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_content,
            agent_traces=result.get("traces", [])
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)
        
        execution_time = time.time() - start_time
        
        # Format agent traces
        agent_traces = []
        for trace in result.get("traces", []):
            agent_traces.append(AgentTrace(
                agent_name=trace.get("agent", "Unknown"),
                status=trace.get("status", "unknown"),
                input_summary=str(trace.get("result", {}).get("query", ""))[:100],
                output_summary=str(trace.get("result", {}))[:200],
                duration=trace.get("duration", 0),
                timestamp=datetime.utcnow()
            ))
        
        return ChatResponse(
            conversation_id=conversation.id,
            message_id=assistant_message.id,
            content=response_content,
            agent_traces=agent_traces,
            execution_time=execution_time
        )
        
    except Exception as e:
        logger.error(f"❌ Chat execution failed: {e}")
        error_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=f"I encountered an error: {str(e)}"
        )
        db.add(error_message)
        db.commit()
        
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted"}

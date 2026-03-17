from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ExecutionMode(str, Enum):
    SOLO = "solo"
    FULL_RESEARCH = "full_research"
    REWRITE = "rewrite"
    SUMMARIZE_ONLY = "summarize_only"
    VERIFY_ONLY = "verify_only"


class AgentType(str, Enum):
    SEARCH = "search"
    OUTLINER = "outliner"
    WRITER = "writer"
    VERIFIER = "verifier"
    SUMMARIZER = "summarizer"
    UPDATE = "update"


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    mode: ExecutionMode = ExecutionMode.FULL_RESEARCH
    selected_agent: Optional[AgentType] = None
    file_ids: Optional[List[int]] = []


class AgentTrace(BaseModel):
    agent_name: str
    status: str
    input_summary: str
    output_summary: str
    duration: float
    timestamp: datetime


class ChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    content: str
    agent_traces: Optional[List[AgentTrace]] = []
    execution_time: float


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationResponse(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    agent_traces: Optional[List[Dict[str, Any]]] = []
    created_at: datetime

    class Config:
        from_attributes = True

from typing import Dict, Any, Optional, List
import logging
import time
from app.agents import (
    SearchAgent,
    OutlinerAgent,
    WriterAgent,
    VerifierAgent,
    SummarizerAgent,
    UpdateAgent
)

logger = logging.getLogger("atlas.orchestrator")


class AgentOrchestrator:
    def __init__(self, llm_client, vector_db):
        self.llm = llm_client
        self.vector_db = vector_db
        
        # Initialize all agents
        self.agents = {
            "search": SearchAgent(llm_client, vector_db),
            "outliner": OutlinerAgent(llm_client),
            "writer": WriterAgent(llm_client),
            "verifier": VerifierAgent(llm_client),
            "summarizer": SummarizerAgent(llm_client),
            "update": UpdateAgent(llm_client)
        }
        
        self.max_retries = 1  # Reduced from 2 for faster failure
        self.max_execution_time = 60  # Reduced from 180 (1 minute max)

    async def execute_solo(
        self, 
        agent_name: str, 
        input_data: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        logger.info(f"🎯 Solo mode: Executing {agent_name}")
        
        agent = self.agents.get(agent_name)
        if not agent:
            raise ValueError(f"Unknown agent: {agent_name}")
        
        result = await agent.run(input_data, context)
        
        return {
            "mode": "solo",
            "agent": agent_name,
            "result": result,
            "traces": [result]
        }

    async def execute_pipeline(
        self, 
        input_data: Dict[str, Any], 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        logger.info(f"🚀 Full Research mode: Starting pipeline")
        
        start_time = time.time()
        traces = []
        
        try:
            # Step 1: Search
            search_result = await self.agents["search"].run(input_data, context)
            traces.append(search_result)
            
            if search_result["status"] != "success":
                return self._handle_failure("search", search_result, traces)
            
            # Step 2: Outline
            outline_input = {
                "query": input_data.get("query"),
                "search_results": search_result["result"]
            }
            outline_result = await self.agents["outliner"].run(outline_input, context)
            traces.append(outline_result)
            
            if outline_result["status"] != "success":
                return self._handle_failure("outliner", outline_result, traces)
            
            # Step 3: Write
            writer_input = {
                "query": input_data.get("query"),
                "outline": outline_result["result"].get("outline", ""),
                "search_results": search_result["result"]
            }
            writer_result = await self.agents["writer"].run(writer_input, context)
            traces.append(writer_result)
            
            if writer_result["status"] != "success":
                return self._handle_failure("writer", writer_result, traces)
            
            # Get the written content
            written_content = writer_result["result"].get("content", "")
            
            if not written_content or len(written_content) < 50:
                logger.warning("⚠️ Writer produced insufficient content, using search answer instead")
                written_content = search_result["result"].get("answer", "No content generated")
            
            # Step 4: Verify
            verifier_input = {
                "content": written_content,
                "search_results": search_result["result"]
            }
            verifier_result = await self.agents["verifier"].run(verifier_input, context)
            traces.append(verifier_result)
            
            # Step 5: Update if needed
            if verifier_result["status"] == "success" and verifier_result["result"].get("needs_revision"):
                logger.info("⚠️ Verification flagged issues, running update agent")
                update_input = {
                    "content": written_content,
                    "verification_report": verifier_result["result"].get("verification_report", "")
                }
                update_result = await self.agents["update"].run(update_input, context)
                traces.append(update_result)
                
                if update_result["status"] == "success":
                    final_content = update_result["result"].get("refined_content", written_content)
                else:
                    final_content = written_content
            else:
                final_content = written_content
            
            # Step 6: Summarize
            summarizer_input = {"content": final_content}
            summarizer_result = await self.agents["summarizer"].run(summarizer_input, context)
            traces.append(summarizer_result)
            
            duration = time.time() - start_time
            logger.info(f"✅ Pipeline completed in {duration:.2f}s")
            
            return {
                "mode": "full_research",
                "content": final_content,
                "summary": summarizer_result["result"].get("summary") if summarizer_result["status"] == "success" else None,
                "verification": verifier_result["result"],
                "traces": traces,
                "duration": duration
            }
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed: {e}")
            
            # Try to extract partial content from successful traces
            partial_content = ""
            for trace in traces:
                if trace.get("status") == "success" and trace.get("result"):
                    agent_result = trace["result"]
                    if isinstance(agent_result, dict):
                        if "answer" in agent_result:
                            partial_content = agent_result["answer"]
                            break
                        elif "content" in agent_result:
                            partial_content = agent_result["content"]
                            break
            
            error_content = f"Pipeline execution failed: {str(e)}"
            if partial_content:
                error_content += f"\n\nPartial result:\n{partial_content[:500]}"
            
            return {
                "mode": "full_research",
                "content": error_content,
                "error": str(e),
                "traces": traces,
                "duration": time.time() - start_time
            }

    def _handle_failure(self, agent_name: str, result: Dict, traces: List) -> Dict:
        logger.error(f"❌ Agent {agent_name} failed, aborting pipeline")
        
        # Extract any partial content from previous successful agents
        partial_content = ""
        for trace in traces:
            if trace.get("status") == "success" and trace.get("result"):
                agent_result = trace["result"]
                if isinstance(agent_result, dict):
                    if "answer" in agent_result:
                        partial_content = agent_result["answer"]
                        break
                    elif "content" in agent_result:
                        partial_content = agent_result["content"]
                        break
        
        error_msg = result.get("error", "Unknown error")
        content = f"Pipeline failed at {agent_name}: {error_msg}"
        
        if partial_content:
            content += f"\n\nPartial result from previous agents:\n{partial_content[:500]}"
        
        return {
            "mode": "full_research",
            "content": content,
            "error": f"Pipeline failed at {agent_name}",
            "traces": traces,
            "partial_result": True
        }

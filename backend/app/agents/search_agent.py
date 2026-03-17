from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.search")


class SearchAgent(BaseAgent):
    def __init__(self, llm_client, vector_db):
        super().__init__("Search Agent", llm_client)
        self.vector_db = vector_db

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        query = input_data.get("query", "")
        uploaded_files = context.get("uploaded_files", [])
        
        logger.info(f"🔍 Searching for: {query}")
        
        # Search vector database
        vector_results = []
        if self.vector_db:
            try:
                vector_results = self.vector_db.query(
                    query_texts=[query],
                    n_results=5
                )
            except Exception as e:
                logger.warning(f"Vector search failed: {e}")
        
        # Compile sources
        sources = []
        
        # Add uploaded file content
        for file_content in uploaded_files:
            sources.append({
                "type": "uploaded_file",
                "content": file_content[:1000],
                "relevance": "high"
            })
        
        # Add vector DB results
        if vector_results and vector_results.get("documents"):
            for doc in vector_results["documents"][0][:3]:
                sources.append({
                    "type": "vector_db",
                    "content": doc[:500],
                    "relevance": "medium"
                })
        
        # Use LLM to generate a comprehensive answer
        if self.llm:
            try:
                # Build context from sources (limit to top 2 for speed)
                context_text = "\n\n".join([s["content"][:300] for s in sources[:2]]) if sources else "No additional context."
                
                # Optimized shorter prompt for faster response
                prompt = f"""Answer this question concisely and accurately:

Question: {query}

Context: {context_text}

Provide a clear, direct answer in 2-3 paragraphs maximum."""

                response = self.llm.generate_content(prompt, max_tokens=1500, temperature=0.7)
                answer = response.text
                
                return {
                    "answer": answer,
                    "sources": sources,
                    "query": query,
                    "source_count": len(sources)
                }
            except Exception as e:
                logger.error(f"LLM answer generation failed: {e}")
                return {
                    "answer": f"I encountered an error generating a response: {str(e)}",
                    "sources": sources,
                    "query": query,
                    "source_count": len(sources)
                }
        else:
            return {
                "answer": f"Question received: {query}\n\nNote: AI responses require GEMINI_API_KEY to be configured.",
                "sources": sources,
                "query": query,
                "source_count": len(sources)
            }

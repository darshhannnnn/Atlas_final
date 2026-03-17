from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.writer")


class WriterAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__("Writer Agent", llm_client)

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        outline = input_data.get("outline", "")
        search_results = input_data.get("search_results", {})
        user_query = input_data.get("query", "")
        
        logger.info(f"✍️ Writing content for: {user_query}")
        
        if not self.llm:
            return {
                "content": f"Content writing requires LLM configuration. Query: {user_query}",
                "word_count": 0,
                "query": user_query
            }
        
        # If no outline provided, create a simple structure
        if not outline or len(outline) < 20:
            outline = f"""1. Introduction to {user_query}
2. Main Information
3. Key Details
4. Conclusion"""
        
        # Prepare sources
        sources_text = ""
        search_answer = ""
        
        if search_results and isinstance(search_results, dict):
            if search_results.get("sources"):
                for idx, source in enumerate(search_results["sources"][:5], 1):
                    sources_text += f"\nSource {idx}: {source.get('content', '')[:500]}\n"
            search_answer = search_results.get("answer", "")
        
        # Build prompt based on available context
        if sources_text or search_answer:
            prompt = f"""You are an expert content writer. Write a comprehensive, well-structured article based on the outline provided.

Topic: {user_query}

Outline:
{outline}

Search Results:
{search_answer}

Available Sources:
{sources_text if sources_text else "No external sources available"}

Requirements:
1. Write clear, engaging content
2. Follow the outline structure
3. Use information from sources when relevant
4. Maintain professional tone
5. Keep content between 500-2000 words
6. Include introduction and conclusion
7. Use proper formatting (headings, paragraphs)

Write the complete article now:"""
        else:
            # Solo mode without search context
            prompt = f"""You are an expert content writer. Write a comprehensive, well-structured article on the following topic.

Topic: {user_query}

Outline:
{outline}

Requirements:
1. Write clear, engaging content
2. Follow the outline structure
3. Maintain professional tone
4. Keep content between 500-2000 words
5. Include introduction and conclusion
6. Use proper formatting (headings, paragraphs)

Write the complete article now:"""

        try:
            response = self.llm.generate_content(prompt)
            content = response.text
            
            word_count = len(content.split())
            logger.info(f"✅ Content written: {word_count} words")
            
            return {
                "content": content,
                "word_count": word_count,
                "query": user_query
            }
        except Exception as e:
            logger.error(f"Content writing failed: {e}")
            return {
                "content": f"Content writing failed: {str(e)}\n\nFallback: {search_answer if search_answer else 'No content available'}",
                "word_count": 0,
                "query": user_query,
                "error": str(e)
            }

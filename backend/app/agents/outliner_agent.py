from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.outliner")


class OutlinerAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__("Outliner Agent", llm_client)

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        search_results = input_data.get("search_results", {})
        user_query = input_data.get("query", "")
        
        logger.info(f"📋 Creating outline for: {user_query}")
        
        if not self.llm:
            return {
                "outline": f"Outline creation requires LLM configuration.\n\nTopic: {user_query}",
                "sections": [],
                "query": user_query
            }
        
        # Prepare context from search results
        sources_text = ""
        search_analysis = ""
        
        if search_results and isinstance(search_results, dict):
            if search_results.get("sources"):
                for idx, source in enumerate(search_results["sources"][:5], 1):
                    sources_text += f"\nSource {idx}: {source.get('content', '')[:300]}\n"
            search_analysis = search_results.get('answer', search_results.get('search_analysis', ''))
        
        # Build prompt with or without search context
        if sources_text or search_analysis:
            prompt = f"""You are an expert content outliner. Create a detailed, hierarchical outline for the following topic.

Topic: {user_query}

Available Information:
{sources_text}

Search Analysis:
{search_analysis}

Create a comprehensive outline with:
1. Clear hierarchical structure (use numbered sections)
2. Main sections and subsections
3. Logical flow from introduction to conclusion
4. Specific points to cover in each section

Format your outline clearly with numbers and indentation."""
        else:
            # Solo mode without search results
            prompt = f"""You are an expert content outliner. Create a detailed, hierarchical outline for the following topic.

Topic: {user_query}

Create a comprehensive outline with:
1. Clear hierarchical structure (use numbered sections)
2. Main sections and subsections
3. Logical flow from introduction to conclusion
4. Specific points to cover in each section

Format your outline clearly with numbers and indentation."""

        try:
            response = self.llm.generate_content(prompt)
            outline = response.text
            
            logger.info(f"✅ Outline created successfully")
            
            return {
                "outline": outline,
                "sections": self._extract_sections(outline),
                "query": user_query
            }
        except Exception as e:
            logger.error(f"Outline generation failed: {e}")
            return {
                "outline": f"Outline generation failed: {str(e)}",
                "sections": [],
                "query": user_query,
                "error": str(e)
            }

    def _extract_sections(self, outline: str) -> list:
        sections = []
        for line in outline.split('\n'):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith('-')):
                sections.append(line)
        return sections[:10]

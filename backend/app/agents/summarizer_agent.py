from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.summarizer")


class SummarizerAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__("Summarizer Agent", llm_client)

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        content = input_data.get("content", "")
        query = input_data.get("query", "")
        
        # If no content provided, generate it first
        if not content or len(content) < 50:
            if query:
                logger.info(f"📝 No content provided, generating content for summarization: {query}")
                if not self.llm:
                    return {
                        "summary": "Summarization requires LLM configuration.",
                        "original_length": 0,
                        "summary_length": 0,
                        "compression_ratio": 0
                    }
                
                # Generate content to summarize
                try:
                    gen_prompt = f"Provide a comprehensive answer to: {query}"
                    gen_response = self.llm.generate_content(gen_prompt)
                    content = gen_response.text
                except Exception as e:
                    logger.error(f"Content generation for summarization failed: {e}")
                    return {
                        "summary": f"Cannot summarize without content. Error: {str(e)}",
                        "original_length": 0,
                        "summary_length": 0,
                        "compression_ratio": 0
                    }
            else:
                logger.warning("No content or query provided for summarization")
                return {
                    "summary": "No content or query provided for summarization.",
                    "original_length": 0,
                    "summary_length": 0,
                    "compression_ratio": 0
                }
        
        logger.info(f"📝 Summarizing content ({len(content)} chars)")
        
        prompt = f"""You are an expert summarizer. Create a comprehensive summary of the following content.

Content:
{content}

Provide:
1. TL;DR (2-3 sentences)
2. Executive Summary (1 paragraph)
3. Key Points (bullet list, 5-7 points)
4. Main Takeaways (3-5 items)

Format your response clearly with these sections."""

        try:
            if not self.llm:
                return {
                    "summary": "Summarization requires LLM configuration.",
                    "original_length": len(content),
                    "summary_length": 0,
                    "compression_ratio": 0
                }
                
            response = self.llm.generate_content(prompt)
            summary = response.text
            
            logger.info(f"✅ Summary created successfully")
            
            compression_ratio = round(len(summary) / len(content) * 100, 2) if len(content) > 0 else 0
            
            return {
                "summary": summary,
                "original_length": len(content),
                "summary_length": len(summary),
                "compression_ratio": compression_ratio
            }
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return {
                "summary": f"Summarization failed: {str(e)}",
                "original_length": len(content),
                "summary_length": 0,
                "compression_ratio": 0,
                "error": str(e)
            }

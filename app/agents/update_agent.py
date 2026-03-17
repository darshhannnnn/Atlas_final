from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.update")


class UpdateAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__("Update/Refinement Agent", llm_client)

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        content = input_data.get("content", "")
        verification_report = input_data.get("verification_report", "")
        user_feedback = input_data.get("user_feedback", "")
        query = input_data.get("query", "")
        
        # If no content provided, generate it first
        if not content or len(content) < 50:
            if query:
                logger.info(f"🔧 No content provided, generating content for refinement: {query}")
                if not self.llm:
                    return {
                        "refined_content": "Update agent requires LLM configuration.",
                        "original_length": 0,
                        "refined_length": 0,
                        "improvements_made": False
                    }
                
                # Generate content to refine
                try:
                    gen_prompt = f"Provide a comprehensive answer to: {query}"
                    gen_response = self.llm.generate_content(gen_prompt)
                    content = gen_response.text
                except Exception as e:
                    logger.error(f"Content generation for update failed: {e}")
                    return {
                        "refined_content": f"Cannot refine without content. Error: {str(e)}",
                        "original_length": 0,
                        "refined_length": 0,
                        "improvements_made": False
                    }
            else:
                return {
                    "refined_content": "No content or query provided for refinement.",
                    "original_length": 0,
                    "refined_length": 0,
                    "improvements_made": False
                }
        
        logger.info(f"🔧 Refining content ({len(content)} chars)")
        
        if not self.llm:
            return {
                "refined_content": content,
                "original_length": len(content),
                "refined_length": len(content),
                "improvements_made": False
            }
        
        prompt = f"""You are a content refinement expert. Improve the following content based on the feedback provided.

Original Content:
{content}

Verification Report:
{verification_report if verification_report else "No verification report provided"}

User Feedback:
{user_feedback if user_feedback else "No specific feedback - general improvement needed"}

Your task:
1. Address any concerns from verification
2. Improve clarity and flow
3. Fix any factual issues
4. Enhance readability
5. Maintain the original structure and key points

Provide the refined version:"""

        try:
            response = self.llm.generate_content(prompt)
            refined_content = response.text
            
            logger.info(f"✅ Content refined successfully")
            
            return {
                "refined_content": refined_content,
                "original_length": len(content),
                "refined_length": len(refined_content),
                "improvements_made": True
            }
        except Exception as e:
            logger.error(f"Content refinement failed: {e}")
            return {
                "refined_content": content,
                "original_length": len(content),
                "refined_length": len(content),
                "improvements_made": False,
                "error": str(e)
            }

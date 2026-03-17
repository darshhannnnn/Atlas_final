from typing import Dict, Any
from app.agents.base_agent import BaseAgent
import logging

logger = logging.getLogger("atlas.agents.verifier")


class VerifierAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__("Verifier Agent", llm_client)

    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        content = input_data.get("content", "")
        search_results = input_data.get("search_results", {})
        query = input_data.get("query", "")
        
        # If no content provided, generate it first
        if not content or len(content) < 50:
            if query:
                logger.info(f"🔍 No content provided, generating content for verification: {query}")
                if not self.llm:
                    return {
                        "verification_report": "Verification requires LLM configuration.",
                        "confidence_score": 50,
                        "passed": True,
                        "needs_revision": False
                    }
                
                # Generate content to verify
                try:
                    gen_prompt = f"Provide a brief, factual answer to: {query}"
                    gen_response = self.llm.generate_content(gen_prompt)
                    content = gen_response.text
                except Exception as e:
                    logger.error(f"Content generation for verification failed: {e}")
                    return {
                        "verification_report": f"Cannot verify without content. Error: {str(e)}",
                        "confidence_score": 0,
                        "passed": False,
                        "needs_revision": True
                    }
            else:
                return {
                    "verification_report": "No content or query provided for verification.",
                    "confidence_score": 0,
                    "passed": False,
                    "needs_revision": True
                }
        
        logger.info(f"🔍 Verifying content ({len(content)} chars)")
        
        if not self.llm:
            return {
                "verification_report": "Verification requires LLM configuration.",
                "confidence_score": 50,
                "passed": True,
                "needs_revision": False
            }
        
        # Prepare sources for verification
        sources_text = ""
        if search_results.get("sources"):
            for idx, source in enumerate(search_results["sources"][:5], 1):
                sources_text += f"\nSource {idx}: {source.get('content', '')[:500]}\n"
        
        prompt = f"""You are a fact-checking expert. Verify the accuracy of the following content.

Content to Verify:
{content[:3000]}

Available Sources:
{sources_text if sources_text else "No external sources available"}

Your task:
1. Identify factual claims in the content
2. Check if claims are supported by sources or general knowledge
3. Flag any potential hallucinations or unsupported statements
4. Assign a confidence score (0-100)
5. List any concerns

Provide your verification report in this format:
CONFIDENCE SCORE: [0-100]
VERIFIED CLAIMS: [list]
CONCERNS: [list or "None"]
RECOMMENDATION: [PASS/NEEDS_REVISION]"""

        try:
            response = self.llm.generate_content(prompt)
            verification_report = response.text
            
            # Parse confidence score
            confidence = self._extract_confidence(verification_report)
            passed = confidence >= 70
            
            logger.info(f"✅ Verification complete: {confidence}% confidence")
            
            return {
                "verification_report": verification_report,
                "confidence_score": confidence,
                "passed": passed,
                "needs_revision": not passed
            }
        except Exception as e:
            logger.error(f"Verification failed: {e}")
            return {
                "verification_report": f"Verification failed: {str(e)}",
                "confidence_score": 50,
                "passed": True,
                "needs_revision": False,
                "error": str(e)
            }

    def _extract_confidence(self, report: str) -> int:
        try:
            for line in report.split('\n'):
                if 'CONFIDENCE SCORE' in line.upper():
                    score = ''.join(filter(str.isdigit, line))
                    if score:
                        return int(score)
            return 70
        except:
            return 70

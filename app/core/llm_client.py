"""
LLM Client wrapper for Mistral AI
Provides a unified interface compatible with the agent system
"""

from mistralai.client import Mistral
import logging

logger = logging.getLogger("atlas.llm")


class MistralLLMClient:
    """Wrapper for Mistral AI client to provide generate_content interface"""
    
    def __init__(self, api_key: str, model: str = "mistral-small-latest"):
        self.client = Mistral(api_key=api_key)
        self.model = model
        logger.info(f"✅ Mistral LLM initialized with model: {model}")
    
    def generate_content(self, prompt: str, **kwargs) -> 'MistralResponse':
        """
        Generate content using Mistral API
        Compatible with Gemini's generate_content interface
        
        Optimized for faster responses:
        - Uses mistral-small-latest by default (faster than mistral-large)
        - Limits max_tokens to 2000 for quicker responses
        - Sets temperature to 0.7 for balanced creativity/speed
        """
        try:
            # Extract custom parameters or use optimized defaults
            max_tokens = kwargs.get('max_tokens', 2000)  # Reduced from unlimited
            temperature = kwargs.get('temperature', 0.7)  # Balanced setting
            
            response = self.client.chat.complete(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            return MistralResponse(response)
            
        except Exception as e:
            logger.error(f"❌ Mistral API call failed: {e}")
            raise


class MistralResponse:
    """Wrapper for Mistral response to provide .text attribute"""
    
    def __init__(self, response):
        self._response = response
    
    @property
    def text(self) -> str:
        """Extract text from Mistral response and clean markdown formatting"""
        try:
            content = self._response.choices[0].message.content
            
            # Clean markdown formatting
            # Remove ** (bold)
            content = content.replace('**', '')
            
            # Remove markdown headers (### , ## , # )
            import re
            content = re.sub(r'^#{1,6}\s+', '', content, flags=re.MULTILINE)
            
            # Convert markdown bullet points (* , - ) to simple dashes
            content = re.sub(r'^\s*[\*\-]\s+', '- ', content, flags=re.MULTILINE)
            
            return content
            
        except (AttributeError, IndexError, KeyError) as e:
            logger.error(f"Failed to extract text from Mistral response: {e}")
            return "Error: Could not extract response text"

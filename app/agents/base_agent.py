from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import time
import logging

logger = logging.getLogger("atlas.agents")


class BaseAgent(ABC):
    def __init__(self, name: str, llm_client: Any):
        self.name = name
        self.llm = llm_client
        self.max_retries = 2
        self.timeout = 60

    @abstractmethod
    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    async def run(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        try:
            logger.info(f"🤖 {self.name} starting execution")
            result = await self.execute(input_data, context)
            duration = time.time() - start_time
            
            logger.info(f"✅ {self.name} completed in {duration:.2f}s")
            
            return {
                "agent": self.name,
                "status": "success",
                "result": result,
                "duration": duration,
                "timestamp": time.time()
            }
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"❌ {self.name} failed: {str(e)}")
            
            return {
                "agent": self.name,
                "status": "error",
                "error": str(e),
                "duration": duration,
                "timestamp": time.time()
            }

    def _create_prompt(self, template: str, **kwargs) -> str:
        return template.format(**kwargs)

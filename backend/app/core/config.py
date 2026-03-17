from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://atlas:atlas123@postgres:5432/atlas_db"
    REDIS_URL: str = "redis://redis:6379"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    MISTRAL_API_KEY: Optional[str] = None
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_FILE_TYPES: list = [".pdf", ".docx", ".txt"]
    
    MAX_RESPONSE_TIME: int = 60  # 1 minute (reduced from 3)
    MAX_TOKENS: int = 2000  # Reduced from 10000 for faster responses
    
    # LLM optimization settings
    LLM_MODEL: str = "mistral-small-latest"  # Faster than mistral-large
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 2000
    
    # File upload settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 100
    CHROMA_DB_DIR: str = "./chroma_db"
    
    class Config:
        env_file = ".env"
        case_sensitive = False  # Changed to False for Vercel compatibility
        extra = "allow"


settings = Settings()

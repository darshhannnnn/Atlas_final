from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    UPLOAD_DIR: str = "uploads"
    # Database (Vercel Postgres or any PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://atlas:atlas123@localhost:5432/atlas_db")
    
    # Redis (Upstash Redis or any Redis)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # LLM Configuration
    MISTRAL_API_KEY: Optional[str] = os.getenv("MISTRAL_API_KEY")
    LLM_MODEL: str = "mistral-small-latest"  # Optimized for speed
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 2000
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_FILE_TYPES: list = [".pdf", ".docx", ".txt"]
    MAX_UPLOAD_SIZE_MB: int = 100
    
    # Vercel Blob Storage (for file uploads in serverless)
    BLOB_READ_WRITE_TOKEN: Optional[str] = os.getenv("BLOB_READ_WRITE_TOKEN")
    
    # Vector Database Options
    # Option 1: Pinecone (recommended for serverless)
    PINECONE_API_KEY: Optional[str] = os.getenv("PINECONE_API_KEY")
    PINECONE_ENVIRONMENT: Optional[str] = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "atlas-knowledge")
    
    # Option 2: ChromaDB (local fallback)
    CHROMA_DB_DIR: str = "./chroma_db"
    USE_CHROMADB: bool = os.getenv("USE_CHROMADB", "false").lower() == "true"
    
    # Performance Settings
    MAX_RESPONSE_TIME: int = 60  # Seconds (fits Vercel Pro tier)
    MAX_TOKENS: int = 2000
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"


settings = Settings()

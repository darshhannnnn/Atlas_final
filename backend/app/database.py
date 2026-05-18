from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import redis
import logging

from app.core.config import settings

logger = logging.getLogger("atlas.database")

# Optimized engine for serverless with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,              # Limit connection pool size
    max_overflow=10,          # Allow up to 10 overflow connections
    pool_recycle=3600,        # Recycle connections after 1 hour
    echo=False                # Disable SQL logging in production
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis client with lazy initialization
_redis_client = None

def get_redis():
    """Get Redis client with lazy initialization and error handling"""
    global _redis_client
    
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            _redis_client.ping()
            logger.info("✅ Redis connected")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}")
            _redis_client = None
    
    return _redis_client


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

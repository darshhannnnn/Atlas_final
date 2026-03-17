"""
Migration script to add onboarding fields to users table
Run this after updating the User model
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # Add name column
            logger.info("Adding 'name' column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS name VARCHAR
            """))
            conn.commit()
            logger.info("✅ 'name' column added")
            
            # Add interests column (JSON)
            logger.info("Adding 'interests' column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS interests JSON
            """))
            conn.commit()
            logger.info("✅ 'interests' column added")
            
            # Add onboarding_completed column
            logger.info("Adding 'onboarding_completed' column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE
            """))
            conn.commit()
            logger.info("✅ 'onboarding_completed' column added")
            
            # Set existing users as onboarding completed
            logger.info("Setting existing users as onboarding completed...")
            conn.execute(text("""
                UPDATE users 
                SET onboarding_completed = TRUE 
                WHERE onboarding_completed IS NULL
            """))
            conn.commit()
            logger.info("✅ Existing users updated")
            
            logger.info("🎉 Migration completed successfully!")
            
        except Exception as e:
            logger.error(f"❌ Migration failed: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    migrate()

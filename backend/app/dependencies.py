from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.core.security import decode_token
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # Handle guest tokens
    if isinstance(user_id, str) and user_id.startswith("guest-"):
        # For guest users, create a temporary in-memory user
        # This allows testing without DB records
        from datetime import datetime
        guest_user = User()
        guest_user.id = 999999  # Temporary ID
        guest_user.username = "guest"
        guest_user.email = "guest@test.local"
        guest_user.is_active = True
        guest_user.hashed_password = ""
        guest_user.full_name = "Guest User"
        guest_user.created_at = datetime.utcnow()
        guest_user.updated_at = datetime.utcnow()
        return guest_user
    
    # Regular user lookup
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format"
        )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, User, Token, LoginRequest, UserProfileUpdate
from app.models.user import User as UserModel
from app.core.security import verify_password, get_password_hash, create_access_token
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(
        (UserModel.email == user_data.email) | (UserModel.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    db_user = UserModel(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token)


@router.get("/me", response_model=User)
def get_current_user_info(
    current_user: UserModel = Depends(get_current_user)
):
    return current_user


@router.patch("/profile", response_model=User)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    
    if profile_data.name is not None:
        current_user.name = profile_data.name
    
    if profile_data.interests is not None:
        current_user.interests = profile_data.interests
    
    if profile_data.onboarding_completed is not None:
        current_user.onboarding_completed = profile_data.onboarding_completed
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


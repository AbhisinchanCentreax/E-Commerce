from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.common_schema import MessageResponse
from schema.user_schema import UserCreate, UserResponse, Token, RefreshTokenRequest
from service import auth_service

router = APIRouter(prefix="/auth", tags=["1. Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Send as form data (x-www-form-urlencoded): username (or email) + password."""
    return auth_service.login_user(db, form_data.username, form_data.password)


@router.post("/refresh", response_model=Token)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access token and rotated refresh token."""
    return auth_service.refresh_token_pair(db, data.refresh_token)


@router.post("/logout", response_model=MessageResponse)
def logout(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Revoke the provided refresh token so it cannot be used again."""
    auth_service.logout_user(db, data.refresh_token)
    return {"message": "Logged out successfully"}


@router.post("/logout-all", response_model=MessageResponse)
def logout_all(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Revoke all active refresh tokens/sessions for the authenticated user."""
    auth_service.logout_all_sessions(db, current_user)
    return {"message": "All sessions logged out successfully"}
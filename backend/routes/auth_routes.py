from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schema.user_schema import UserCreate, UserResponse, Token
from service import auth_service

router = APIRouter(prefix="/auth", tags=["1. Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Send as form data (x-www-form-urlencoded): username (or email) + password."""
    return auth_service.login_user(db, form_data.username, form_data.password)
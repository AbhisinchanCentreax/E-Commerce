from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.common_schema import MessageResponse
from schema.user_schema import UserResponse, UserUpdate, ChangePassword
from service import user_service

router = APIRouter(prefix="/users", tags=["2. My Profile"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, db: Session = Depends(get_db),
              current_user: User = Depends(get_current_user)):
    return user_service.update_profile(db, current_user, data)


@router.put("/me/password", response_model=MessageResponse)
def change_my_password(data: ChangePassword, db: Session = Depends(get_db),
                       current_user: User = Depends(get_current_user)):
    user_service.change_password(db, current_user, data)
    return {"message": "Password changed successfully"}
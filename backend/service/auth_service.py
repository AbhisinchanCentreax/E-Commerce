from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import hash_password, verify_password, create_access_token
from models.user_model import User, UserRole
from schema.user_schema import UserCreate


def register_user(db: Session, data: UserCreate) -> User:
    existing = db.query(User).filter(
        (User.username == data.username) | (User.email == data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Username or email already registered")

    user = User(
        username=data.username,
        email=data.email.lower(),
        full_name=data.full_name,
        phone=data.phone,
        hashed_password=hash_password(data.password),
        role=UserRole.CUSTOMER,  # public registration can never create an admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, username_or_email: str, password: str) -> dict:
    user = db.query(User).filter(
        (User.username == username_or_email) | (User.email == username_or_email.lower())
    ).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is disabled")

    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": user}
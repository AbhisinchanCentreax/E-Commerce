import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from models.refresh_token_model import RefreshToken
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

    access_token = create_access_token(user.id, user.role)
    refresh_token, expires_at = create_refresh_token(user.id)

    db_refresh = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
    db.add(db_refresh)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


def refresh_token_pair(db: Session, refresh_token_str: str) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_refresh_token(refresh_token_str)
        user_id = int(payload.get("sub"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise credentials_exception

    # Look up non-revoked refresh token in DB
    token_record = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token_str,
        RefreshToken.revoked.is_(False),
    ).first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled or does not exist",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Token rotation: invalidate old token and create new pair
    token_record.revoked = True
    new_access_token = create_access_token(user.id, user.role)
    new_refresh_token, new_expires_at = create_refresh_token(user.id)

    db.add(RefreshToken(user_id=user.id, token=new_refresh_token, expires_at=new_expires_at))
    db.commit()

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user,
    }


def logout_user(db: Session, refresh_token_str: str) -> None:
    token_record = db.query(RefreshToken).filter(RefreshToken.token == refresh_token_str).first()
    if token_record:
        token_record.revoked = True
        db.commit()


def logout_all_sessions(db: Session, user: User) -> None:
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked.is_(False),
    ).update({"revoked": True})
    db.commit()
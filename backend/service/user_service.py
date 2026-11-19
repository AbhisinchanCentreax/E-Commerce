from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import hash_password, verify_password
from models.user_model import User
from schema.common_schema import Page
from schema.user_schema import UserUpdate, ChangePassword


def update_profile(db: Session, user: User, data: UserUpdate) -> User:
    updates = data.model_dump(exclude_unset=True)

    if "email" in updates and updates["email"]:
        updates["email"] = updates["email"].lower()
        taken = db.query(User).filter(User.email == updates["email"], User.id != user.id).first()
        if taken:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    for key, value in updates.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, data: ChangePassword) -> None:
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    user.hashed_password = hash_password(data.new_password)
    db.commit()


# ---------- Admin ----------
def list_users(db: Session, page: int, size: int, search: str | None) -> Page:
    query = db.query(User)
    if search:
        like = f"%{search}%"
        query = query.filter(User.username.ilike(like) | User.email.ilike(like) | User.full_name.ilike(like))
    total = query.count()
    items = query.order_by(User.id.desc()).offset((page - 1) * size).limit(size).all()
    return Page.create(items, total, page, size)


def set_user_status(db: Session, admin: User, user_id: int, is_active: bool) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot deactivate yourself")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
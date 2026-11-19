from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.cart_schema import CartItemAdd, CartItemUpdate, CartResponse
from service import cart_service

router = APIRouter(prefix="/cart", tags=["5. Cart"])


@router.get("/", response_model=CartResponse)
def view_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return cart_service.get_cart(db, user)


@router.post("/items", response_model=CartResponse)
def add_to_cart(data: CartItemAdd, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    return cart_service.add_item(db, user, data)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(item_id: int, data: CartItemUpdate, db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    return cart_service.update_item(db, user, item_id, data)


@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(item_id: int, db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    return cart_service.remove_item(db, user, item_id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cart_service.clear_cart(db, user)
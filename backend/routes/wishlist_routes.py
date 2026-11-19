from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.wishlist_schema import WishlistItemAdd, WishlistResponse, WishlistCheckResponse
from service import wishlist_service

router = APIRouter(prefix="/wishlist", tags=["5b. Wishlist"])


@router.get("/", response_model=WishlistResponse)
def view_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return wishlist_service.get_wishlist(db, user)


@router.post("/items", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(data: WishlistItemAdd, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    return wishlist_service.add_item(db, user, data)


@router.delete("/items/{product_id}", response_model=WishlistResponse)
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db),
                         user: User = Depends(get_current_user)):
    return wishlist_service.remove_item(db, user, product_id)


@router.post("/items/{product_id}/move-to-cart", response_model=WishlistResponse)
def move_to_cart(product_id: int, quantity: int = Query(1, ge=1, le=100),
                 db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Transfers a product from wishlist into the shopping cart."""
    return wishlist_service.move_to_cart(db, user, product_id, quantity)


@router.get("/check/{product_id}", response_model=WishlistCheckResponse)
def check_in_wishlist(product_id: int, db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    return wishlist_service.check_item(db, user, product_id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    wishlist_service.clear_wishlist(db, user)

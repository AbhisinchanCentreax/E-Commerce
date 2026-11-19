from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from models.product_model import Product
from models.user_model import User
from models.wishlist_model import WishlistItem
from schema.cart_schema import CartItemAdd
from schema.wishlist_schema import WishlistItemAdd
from service import cart_service


def get_wishlist(db: Session, user: User) -> dict:
    wishlist_items = (
        db.query(WishlistItem)
        .options(joinedload(WishlistItem.product))
        .filter(WishlistItem.user_id == user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )

    items = []
    for wi in wishlist_items:
        p = wi.product
        items.append({
            "id": wi.id,
            "product_id": p.id,
            "product_name": p.product_name,
            "product_code": p.product_code,
            "image_url": p.image_url,
            "unit_price": p.unit_price,
            "stock_quantity": p.stock_quantity,
            "in_stock": p.is_active and p.stock_quantity > 0,
            "created_at": wi.created_at,
        })

    return {
        "items": items,
        "total_items": len(items),
    }


def add_item(db: Session, user: User, data: WishlistItemAdd) -> dict:
    product = db.get(Product, data.product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == data.product_id)
        .first()
    )
    if not existing:
        db.add(WishlistItem(user_id=user.id, product_id=product.id))
        db.commit()

    return get_wishlist(db, user)


def remove_item(db: Session, user: User, product_id: int) -> dict:
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist")

    db.delete(item)
    db.commit()
    return get_wishlist(db, user)


def move_to_cart(db: Session, user: User, product_id: int, quantity: int = 1) -> dict:
    """Adds product to cart and removes it from the wishlist."""
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist")

    # Add to cart (will validate product active status and stock availability)
    cart_service.add_item(db, user, CartItemAdd(product_id=product_id, quantity=quantity))

    # Remove from wishlist
    db.delete(item)
    db.commit()

    return get_wishlist(db, user)


def clear_wishlist(db: Session, user: User) -> None:
    db.query(WishlistItem).filter(WishlistItem.user_id == user.id).delete()
    db.commit()


def check_item(db: Session, user: User, product_id: int) -> dict:
    exists = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user.id, WishlistItem.product_id == product_id)
        .first()
        is not None
    )
    return {"product_id": product_id, "in_wishlist": exists}

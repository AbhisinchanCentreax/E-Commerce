from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from core.config import settings
from models.cart_model import CartItem
from models.product_model import Product
from models.user_model import User
from schema.cart_schema import CartItemAdd, CartItemUpdate


def calculate_shipping(subtotal: Decimal) -> Decimal:
    if subtotal == 0 or subtotal >= settings.FREE_SHIPPING_ABOVE:
        return Decimal("0.00")
    return settings.SHIPPING_FEE


def get_cart(db: Session, user: User) -> dict:
    cart_items = (db.query(CartItem).options(joinedload(CartItem.product))
                  .filter(CartItem.user_id == user.id).order_by(CartItem.id).all())

    items, subtotal, total_items = [], Decimal("0.00"), 0
    for ci in cart_items:
        p = ci.product
        line_total = p.unit_price * ci.quantity
        subtotal += line_total
        total_items += ci.quantity
        items.append({
            "id": ci.id,
            "product_id": p.id,
            "product_name": p.product_name,
            "product_code": p.product_code,
            "image_url": p.image_url,
            "unit_price": p.unit_price,
            "quantity": ci.quantity,
            "line_total": line_total,
            "stock_quantity": p.stock_quantity,
            "in_stock": p.is_active and p.stock_quantity >= ci.quantity,
        })

    shipping_fee = calculate_shipping(subtotal)
    return {
        "items": items,
        "total_items": total_items,
        "subtotal": subtotal,
        "shipping_fee": shipping_fee,
        "total_amount": subtotal + shipping_fee,
    }


def _get_available_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _check_stock(product: Product, quantity: int):
    if quantity > product.stock_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock_quantity} unit(s) of '{product.product_name}' in stock",
        )


def add_item(db: Session, user: User, data: CartItemAdd) -> dict:
    product = _get_available_product(db, data.product_id)
    item = db.query(CartItem).filter(CartItem.user_id == user.id,
                                     CartItem.product_id == data.product_id).first()
    new_qty = (item.quantity if item else 0) + data.quantity
    _check_stock(product, new_qty)

    if item:
        item.quantity = new_qty
    else:
        db.add(CartItem(user_id=user.id, product_id=product.id, quantity=data.quantity))
    db.commit()
    return get_cart(db, user)


def _get_user_item(db: Session, user: User, item_id: int) -> CartItem:
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return item


def update_item(db: Session, user: User, item_id: int, data: CartItemUpdate) -> dict:
    item = _get_user_item(db, user, item_id)
    _check_stock(_get_available_product(db, item.product_id), data.quantity)
    item.quantity = data.quantity
    db.commit()
    return get_cart(db, user)


def remove_item(db: Session, user: User, item_id: int) -> dict:
    item = _get_user_item(db, user, item_id)
    db.delete(item)
    db.commit()
    return get_cart(db, user)


def clear_cart(db: Session, user: User) -> None:
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
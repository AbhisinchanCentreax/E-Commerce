import secrets
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from models.cart_model import CartItem
from models.order_model import Order, OrderItem, OrderStatus, PaymentStatus, PaymentMethod
from models.product_model import Product
from models.user_model import User
from schema.common_schema import Page
from schema.order_schema import CheckoutRequest
from service.address_service import get_address, format_address
from service.cart_service import calculate_shipping

# Which status an admin may move an order to, from each status
ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.CONFIRMED, OrderStatus.CANCELLED},
    OrderStatus.CONFIRMED: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
}

CUSTOMER_CANCELLABLE = {OrderStatus.PENDING, OrderStatus.CONFIRMED}


def _bad_request(db: Session, message: str):
    db.rollback()  # undo any stock changes made so far
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def _generate_order_number() -> str:
    return f"ORD{datetime.now():%Y%m%d}{secrets.token_hex(3).upper()}"


# ---------- Checkout ----------
def checkout(db: Session, user: User, data: CheckoutRequest) -> Order:
    address = get_address(db, user, data.address_id)

    cart_items = db.query(CartItem).filter(CartItem.user_id == user.id).order_by(CartItem.id).all()
    if not cart_items:
        _bad_request(db, "Your cart is empty")

    # Lock the product rows so two customers can't buy the last unit at the same time
    product_ids = [ci.product_id for ci in cart_items]
    products = {
        p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids))
        .order_by(Product.id).with_for_update().all()
    }

    subtotal = Decimal("0.00")
    order_items = []
    for ci in cart_items:
        product = products.get(ci.product_id)
        if not product or not product.is_active:
            _bad_request(db, f"A product in your cart is no longer available (id {ci.product_id})")
        if product.stock_quantity < ci.quantity:
            _bad_request(db, f"Only {product.stock_quantity} unit(s) of '{product.product_name}' left in stock")

        line_total = product.unit_price * ci.quantity
        subtotal += line_total
        product.stock_quantity -= ci.quantity  # reserve stock

        order_items.append(OrderItem(
            product_id=product.id,
            product_code=product.product_code,
            product_name=product.product_name,
            unit_price=product.unit_price,
            quantity=ci.quantity,
            line_total=line_total,
        ))

    shipping_fee = calculate_shipping(subtotal)
    is_cod = data.payment_method == PaymentMethod.COD

    order = Order(
        order_number=_generate_order_number(),
        user_id=user.id,
        status=OrderStatus.CONFIRMED if is_cod else OrderStatus.PENDING,
        payment_method=data.payment_method,
        payment_status=PaymentStatus.UNPAID,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total_amount=subtotal + shipping_fee,
        shipping_name=address.full_name,
        shipping_phone=address.phone,
        shipping_address=format_address(address),
        items=order_items,
    )
    db.add(order)

    for ci in cart_items:  # empty the cart
        db.delete(ci)

    db.commit()  # everything above is saved together, or nothing is
    db.refresh(order)
    return order


# ---------- Customer ----------
def list_my_orders(db: Session, user: User, page: int, size: int) -> Page:
    query = db.query(Order).filter(Order.user_id == user.id)
    total = query.count()
    items = query.order_by(Order.id.desc()).offset((page - 1) * size).limit(size).all()
    return Page.create(items, total, page, size)


def get_order(db: Session, order_id: int, user: User | None = None) -> Order:
    """Pass `user` to restrict to that customer's orders; leave it None for admin."""
    query = db.query(Order).options(selectinload(Order.items)).filter(Order.id == order_id)
    if user is not None:
        query = query.filter(Order.user_id == user.id)
    order = query.first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _restock(db: Session, order: Order):
    for item in order.items:
        if item.product_id:
            product = db.get(Product, item.product_id)
            if product:
                product.stock_quantity += item.quantity


def _cancel(db: Session, order: Order):
    _restock(db, order)
    order.status = OrderStatus.CANCELLED
    if order.payment_status == PaymentStatus.PAID:
        order.payment_status = PaymentStatus.REFUNDED  # hook your real refund here


def cancel_my_order(db: Session, user: User, order_id: int) -> Order:
    order = get_order(db, order_id, user)
    if order.status not in CUSTOMER_CANCELLABLE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Order cannot be cancelled once it is '{order.status}'")
    _cancel(db, order)
    db.commit()
    db.refresh(order)
    return order


def pay_order(db: Session, user: User, order_id: int) -> Order:
    """MOCK payment. Replace with Razorpay/Stripe verification in production."""
    order = get_order(db, order_id, user)
    if order.payment_method != PaymentMethod.ONLINE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This is a Cash on Delivery order")
    if order.payment_status == PaymentStatus.PAID:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already paid")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Order is '{order.status}'")

    order.payment_status = PaymentStatus.PAID
    order.status = OrderStatus.CONFIRMED
    db.commit()
    db.refresh(order)
    return order


# ---------- Admin ----------
def list_all_orders(db: Session, page: int, size: int, status_filter: str | None,
                    search: str | None) -> Page:
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.filter(Order.order_number.ilike(like) | Order.shipping_name.ilike(like))
    total = query.count()
    items = query.order_by(Order.id.desc()).offset((page - 1) * size).limit(size).all()
    return Page.create(items, total, page, size)


def update_order_status(db: Session, order_id: int, new_status: str) -> Order:
    order = get_order(db, order_id)
    if new_status not in ALLOWED_TRANSITIONS.get(order.status, set()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Cannot change status from '{order.status}' to '{new_status}'")

    if new_status == OrderStatus.CANCELLED:
        _cancel(db, order)
    else:
        order.status = new_status
        if new_status == OrderStatus.DELIVERED and order.payment_method == PaymentMethod.COD:
            order.payment_status = PaymentStatus.PAID  # cash collected on delivery

    db.commit()
    db.refresh(order)
    return order


def dashboard(db: Session) -> dict:
    revenue = (db.query(func.coalesce(func.sum(Order.total_amount), 0))
               .filter(Order.payment_status == PaymentStatus.PAID).scalar())
    low_stock = (db.query(Product).filter(Product.is_active.is_(True), Product.stock_quantity <= 5)
                 .order_by(Product.stock_quantity).limit(10).all())
    return {
        "total_users": db.query(User).count(),
        "total_products": db.query(Product).filter(Product.is_active.is_(True)).count(),
        "total_orders": db.query(Order).count(),
        "pending_orders": db.query(Order).filter(
            Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED])).count(),
        "total_revenue": Decimal(revenue or 0),
        "low_stock_products": low_stock,
    }
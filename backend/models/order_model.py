from sqlalchemy import (Column, Integer, String, Text, Numeric, DateTime, ForeignKey, func)
from sqlalchemy.orm import relationship

from database import Base


class OrderStatus:
    PENDING = "pending"        # online order waiting for payment
    CONFIRMED = "confirmed"    # paid, or COD order placed
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class PaymentStatus:
    UNPAID = "unpaid"
    PAID = "paid"
    REFUNDED = "refunded"


class PaymentMethod:
    COD = "cod"
    ONLINE = "online"


class Order(Base):
    __tablename__ = "tbl_order"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("tbl_user.id", ondelete="RESTRICT"), nullable=False, index=True)

    status = Column(String(20), nullable=False, default=OrderStatus.PENDING, index=True)
    payment_method = Column(String(20), nullable=False, default=PaymentMethod.COD)
    payment_status = Column(String(20), nullable=False, default=PaymentStatus.UNPAID)

    subtotal = Column(Numeric(12, 2), nullable=False)
    shipping_fee = Column(Numeric(12, 2), nullable=False, default=0)
    total_amount = Column(Numeric(12, 2), nullable=False)

    # Snapshot of the address at order time (so later address edits don't change old orders)
    shipping_name = Column(String(150), nullable=False)
    shipping_phone = Column(String(20), nullable=False)
    shipping_address = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "tbl_order_item"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("tbl_order.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("tbl_product.id", ondelete="SET NULL"), nullable=True)

    # Snapshot of the product at order time (price changes later won't affect this order)
    product_code = Column(String(50), nullable=False)
    product_name = Column(String(150), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
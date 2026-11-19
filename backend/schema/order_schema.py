from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


class CheckoutRequest(BaseModel):
    address_id: int
    payment_method: Literal["cod", "online"] = "cod"


class OrderStatusUpdate(BaseModel):
    status: Literal["confirmed", "shipped", "delivered", "cancelled"]


class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_code: str
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderSummary(BaseModel):
    id: int
    order_number: str
    status: str
    payment_method: str
    payment_status: str
    total_amount: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(OrderSummary):
    user_id: int
    subtotal: Decimal
    shipping_fee: Decimal
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    updated_at: Optional[datetime] = None
    items: list[OrderItemResponse]


class LowStockProduct(BaseModel):
    id: int
    product_code: str
    product_name: str
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    pending_orders: int
    total_revenue: Decimal
    low_stock_products: list[LowStockProduct]
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1, le=100)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=100)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_code: str
    image_url: Optional[str] = None
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    stock_quantity: int
    in_stock: bool


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total_items: int
    subtotal: Decimal
    shipping_fee: Decimal
    total_amount: Decimal
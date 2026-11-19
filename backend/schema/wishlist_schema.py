from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class WishlistItemAdd(BaseModel):
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_code: str
    image_url: Optional[str] = None
    unit_price: Decimal
    stock_quantity: int
    in_stock: bool
    created_at: datetime


class WishlistResponse(BaseModel):
    items: list[WishlistItemResponse]
    total_items: int


class WishlistCheckResponse(BaseModel):
    product_id: int
    in_wishlist: bool

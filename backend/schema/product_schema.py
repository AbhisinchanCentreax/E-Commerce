from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

from schema.category_schema import CategoryBrief


class ProductCreate(BaseModel):
    product_code: str = Field(..., min_length=1, max_length=50)
    product_name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    category_id: int
    unit_price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: bool = True


class ProductUpdate(BaseModel):
    product_code: Optional[str] = Field(None, min_length=1, max_length=50)
    product_name: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = None
    category_id: Optional[int] = None
    unit_price: Optional[Decimal] = Field(None, ge=0, max_digits=12, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    product_code: str
    product_name: str
    description: Optional[str] = None
    category_id: int
    category: Optional[CategoryBrief] = None
    unit_price: Decimal
    stock_quantity: int
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
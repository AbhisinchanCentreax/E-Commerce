from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    product_code: str = Field(..., max_length=50)
    product_name: str = Field(..., max_length=150)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    unit_price: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    stock_quantity: int = Field(0, ge=0)
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    product_code: Optional[str] = Field(None, max_length=50)
    product_name: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    unit_price: Optional[Decimal] = Field(None, ge=0, max_digits=12, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
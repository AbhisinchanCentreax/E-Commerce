from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schema.common_schema import Page
from schema.product_schema import ProductResponse
from service import product_service

# Public (no login needed). Admin create/update/delete is in admin_routes.py
router = APIRouter(prefix="/products", tags=["4. Products"])


@router.get("/", response_model=Page[ProductResponse])
def list_products(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[Decimal] = Query(None, ge=0),
    max_price: Optional[Decimal] = Query(None, ge=0),
    in_stock: Optional[bool] = None,
    sort: Literal["newest", "price_asc", "price_desc", "name_asc"] = "newest",
    db: Session = Depends(get_db),
):
    return product_service.list_products(db, page, size, search, category_id,
                                         min_price, max_price, in_stock, sort)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)
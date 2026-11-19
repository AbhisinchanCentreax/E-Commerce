from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.dependencies import require_admin
from database import get_db
from models.user_model import User
from schema.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from schema.common_schema import Page
from schema.order_schema import OrderResponse, OrderSummary, OrderStatusUpdate, DashboardResponse
from schema.product_schema import ProductCreate, ProductUpdate, ProductResponse
from schema.user_schema import UserResponse, UserStatusUpdate
from service import category_service, product_service, order_service, user_service

# Every endpoint here needs an ADMIN token
router = APIRouter(prefix="/admin", tags=["8. Admin"], dependencies=[Depends(require_admin)])


# ---------- Dashboard ----------
@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)):
    return order_service.dashboard(db)


# ---------- Categories ----------
@router.get("/categories", response_model=list[CategoryResponse])
def list_all_categories(db: Session = Depends(get_db)):
    return category_service.list_categories(db, include_inactive=True)


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db, data)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    return category_service.update_category(db, category_id, data)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category_service.delete_category(db, category_id)


# ---------- Products ----------
@router.get("/products", response_model=Page[ProductResponse])
def list_all_products(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
                      search: Optional[str] = None, db: Session = Depends(get_db)):
    return product_service.list_products(db, page, size, search, include_inactive=True)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, data)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, data)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Soft delete: product is hidden from the shop but kept for old orders."""
    product_service.delete_product(db, product_id)


# ---------- Orders ----------
@router.get("/orders", response_model=Page[OrderSummary])
def list_all_orders(
    page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
    status_filter: Optional[Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return order_service.list_all_orders(db, page, size, status_filter, search)


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_any_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db)):
    return order_service.update_order_status(db, order_id, data.status)


# ---------- Users ----------
@router.get("/users", response_model=Page[UserResponse])
def list_users(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
               search: Optional[str] = None, db: Session = Depends(get_db)):
    return user_service.list_users(db, page, size, search)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def set_user_status(user_id: int, data: UserStatusUpdate, db: Session = Depends(get_db),
                    admin: User = Depends(require_admin)):
    return user_service.set_user_status(db, admin, user_id, data.is_active)
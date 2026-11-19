from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.common_schema import Page
from schema.order_schema import CheckoutRequest, OrderResponse, OrderSummary
from service import order_service

router = APIRouter(prefix="/orders", tags=["7. Orders"])


@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout(data: CheckoutRequest, db: Session = Depends(get_db),
             user: User = Depends(get_current_user)):
    return order_service.checkout(db, user, data)


@router.get("/", response_model=Page[OrderSummary])
def my_orders(page: int = Query(1, ge=1), size: int = Query(10, ge=1, le=100),
              db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return order_service.list_my_orders(db, user, page, size)


@router.get("/{order_id}", response_model=OrderResponse)
def get_my_order(order_id: int, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    return order_service.get_order(db, order_id, user)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_my_order(order_id: int, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    return order_service.cancel_my_order(db, user, order_id)


@router.post("/{order_id}/pay", response_model=OrderResponse)
def pay_order(order_id: int, db: Session = Depends(get_db),
              user: User = Depends(get_current_user)):
    """MOCK payment for 'online' orders. Replace with Razorpay/Stripe later."""
    return order_service.pay_order(db, user, order_id)
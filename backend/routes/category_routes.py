from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schema.category_schema import CategoryResponse
from service import category_service

# Public (no login needed). Admin create/update/delete is in admin_routes.py
router = APIRouter(prefix="/categories", tags=["3. Categories"])


@router.get("/", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return category_service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return category_service.get_category(db, category_id)
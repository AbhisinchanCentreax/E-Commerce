from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.category_model import Category
from models.product_model import Product
from schema.category_schema import CategoryCreate, CategoryUpdate


def list_categories(db: Session, include_inactive: bool = False):
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active.is_(True))
    return query.order_by(Category.name).all()


def get_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def _check_duplicate_name(db: Session, name: str, exclude_id: int | None = None):
    query = db.query(Category).filter(Category.name.ilike(name))
    if exclude_id:
        query = query.filter(Category.id != exclude_id)
    if query.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Category '{name}' already exists")


def create_category(db: Session, data: CategoryCreate) -> Category:
    _check_duplicate_name(db, data.name)
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = get_category(db, category_id)
    updates = data.model_dump(exclude_unset=True)
    if updates.get("name"):
        _check_duplicate_name(db, updates["name"], exclude_id=category_id)
    for key, value in updates.items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    if db.query(Product).filter(Product.category_id == category_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category has products. Move or delete them first, or deactivate the category instead.",
        )
    db.delete(category)
    db.commit()
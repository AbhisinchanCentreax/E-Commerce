from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from models.category_model import Category
from models.product_model import Product
from schema.common_schema import Page
from schema.product_schema import ProductCreate, ProductUpdate

SORT_OPTIONS = {
    "newest": Product.id.desc(),
    "price_asc": Product.unit_price.asc(),
    "price_desc": Product.unit_price.desc(),
    "name_asc": Product.product_name.asc(),
}


def list_products(
    db: Session,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    category_id: int | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    in_stock: bool | None = None,
    sort: str = "newest",
    include_inactive: bool = False,
) -> Page:
    query = db.query(Product).options(joinedload(Product.category))

    if not include_inactive:
        query = query.filter(Product.is_active.is_(True))
    if search:
        like = f"%{search}%"
        query = query.filter(Product.product_name.ilike(like) | Product.product_code.ilike(like))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price is not None:
        query = query.filter(Product.unit_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.unit_price <= max_price)
    if in_stock:
        query = query.filter(Product.stock_quantity > 0)

    total = query.count()
    items = (query.order_by(SORT_OPTIONS.get(sort, Product.id.desc()))
             .offset((page - 1) * size).limit(size).all())
    return Page.create(items, total, page, size)


def get_product(db: Session, product_id: int, include_inactive: bool = False) -> Product:
    product = db.get(Product, product_id)
    if not product or (not include_inactive and not product.is_active):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _check_category(db: Session, category_id: int):
    if not db.get(Category, category_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")


def _check_duplicate_code(db: Session, product_code: str, exclude_id: int | None = None):
    query = db.query(Product).filter(Product.product_code == product_code)
    if exclude_id:
        query = query.filter(Product.id != exclude_id)
    if query.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Product code '{product_code}' already exists")


def create_product(db: Session, data: ProductCreate) -> Product:
    _check_duplicate_code(db, data.product_code)
    _check_category(db, data.category_id)
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
    product = get_product(db, product_id, include_inactive=True)
    updates = data.model_dump(exclude_unset=True)

    if updates.get("product_code"):
        _check_duplicate_code(db, updates["product_code"], exclude_id=product_id)
    if updates.get("category_id"):
        _check_category(db, updates["category_id"])

    for key, value in updates.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    """Soft delete: hides the product from the shop but keeps it for old orders."""
    product = get_product(db, product_id, include_inactive=True)
    product.is_active = False
    db.commit()
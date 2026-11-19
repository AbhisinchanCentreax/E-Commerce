from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.product_model import Product
from schema.product_schema import ProductCreate, ProductUpdate


def get_all_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).order_by(Product.id).offset(skip).limit(limit).all()


def get_product_by_id(db: Session, product_id: int):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def _check_duplicate_code(db: Session, product_code: str):
    if db.query(Product).filter(Product.product_code == product_code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Product code '{product_code}' already exists")


def create_product(db: Session, data: ProductCreate):
    _check_duplicate_code(db, data.product_code)
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product_id: int, data: ProductUpdate):
    product = get_product_by_id(db, product_id)
    updates = data.model_dump(exclude_unset=True)

    if "product_code" in updates and updates["product_code"] != product.product_code:
        _check_duplicate_code(db, updates["product_code"])

    for key, value in updates.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int):
    product = get_product_by_id(db, product_id)
    db.delete(product)
    db.commit()
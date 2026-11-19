from sqlalchemy import (Column, Integer, String, Text, Numeric, Boolean, DateTime,
                        ForeignKey, func)
from sqlalchemy.orm import relationship

from database import Base


class Product(Base):
    __tablename__ = "tbl_product"

    id = Column(Integer, primary_key=True, index=True)
    product_code = Column(String(50), unique=True, nullable=False, index=True)
    product_name = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("tbl_category.id", ondelete="RESTRICT"), nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False, default=0)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")
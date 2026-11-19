# Import every model here so SQLAlchemy knows all tables before create_all() runs
from models.user_model import User  # noqa: F401
from models.category_model import Category  # noqa: F401
from models.product_model import Product  # noqa: F401
from models.cart_model import CartItem  # noqa: F401
from models.wishlist_model import WishlistItem  # noqa: F401
from models.address_model import Address  # noqa: F401
from models.order_model import Order, OrderItem  # noqa: F401
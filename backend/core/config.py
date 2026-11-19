import os
from decimal import Decimal

from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]

    SHIPPING_FEE: Decimal = Decimal(os.getenv("SHIPPING_FEE", "50"))
    FREE_SHIPPING_ABOVE: Decimal = Decimal(os.getenv("FREE_SHIPPING_ABOVE", "500"))


settings = Settings()

if not settings.DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in .env")
if not settings.SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing in .env")
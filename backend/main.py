from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

import models  # noqa: F401  (registers all tables)
from core.config import settings
from database import Base, engine
from routes import (auth_routes, user_routes, category_routes, product_routes,
                    cart_routes, wishlist_routes, address_routes, order_routes, admin_routes)

Base.metadata.create_all(bind=engine)  # creates any missing tables

app = FastAPI(title="E-Commerce API", version="1.0.0")

# Allow the React app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Turn database constraint errors into a clean 409 instead of a 500
@app.exception_handler(IntegrityError)
def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(status_code=status.HTTP_409_CONFLICT,
                        content={"detail": "Database constraint error (duplicate or invalid reference)"})


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(category_routes.router)
app.include_router(product_routes.router)
app.include_router(cart_routes.router)
app.include_router(wishlist_routes.router)
app.include_router(address_routes.router)
app.include_router(order_routes.router)
app.include_router(admin_routes.router)


@app.get("/", tags=["Health"])
def root():
    return {"message": "E-Commerce API is running"}
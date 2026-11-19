from fastapi import FastAPI

from database import Base, engine
from models import product_model, user_model    # noqa: F401  (registers the table)
from routes.product_routes import router as product_router
from routes.auth_routes import router as auth_router

Base.metadata.create_all(bind=engine)  # creates product_master table if missing

app = FastAPI(title="Product Master API", version="1.0.0")

app.include_router(auth_router)
app.include_router(product_router)


@app.get("/")
def root():
    return {"message": "Product Master API is running"}
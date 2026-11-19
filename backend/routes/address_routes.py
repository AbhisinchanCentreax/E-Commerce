from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from database import get_db
from models.user_model import User
from schema.address_schema import AddressCreate, AddressUpdate, AddressResponse
from service import address_service

router = APIRouter(prefix="/addresses", tags=["6. Addresses"])


@router.get("/", response_model=list[AddressResponse])
def list_addresses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return address_service.list_addresses(db, user)


@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(data: AddressCreate, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    return address_service.create_address(db, user, data)


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(address_id: int, data: AddressUpdate, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    return address_service.update_address(db, user, address_id, data)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(address_id: int, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    address_service.delete_address(db, user, address_id)
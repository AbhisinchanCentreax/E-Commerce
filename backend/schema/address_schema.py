from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class AddressCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=150)
    phone: str = Field(..., min_length=10, max_length=20)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    pincode: str = Field(..., pattern=r"^\d{6}$")
    country: str = Field("India", max_length=100)
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address_line1: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state: Optional[str] = Field(None, min_length=1, max_length=100)
    pincode: Optional[str] = Field(None, pattern=r"^\d{6}$")
    country: Optional[str] = Field(None, max_length=100)
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    country: str
    is_default: bool

    model_config = ConfigDict(from_attributes=True)
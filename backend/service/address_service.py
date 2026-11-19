from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.address_model import Address
from models.user_model import User
from schema.address_schema import AddressCreate, AddressUpdate


def list_addresses(db: Session, user: User):
    return (db.query(Address).filter(Address.user_id == user.id)
            .order_by(Address.is_default.desc(), Address.id).all())


def get_address(db: Session, user: User, address_id: int) -> Address:
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not address:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    return address


def _unset_other_defaults(db: Session, user: User, keep_id: int | None = None):
    query = db.query(Address).filter(Address.user_id == user.id, Address.is_default.is_(True))
    if keep_id:
        query = query.filter(Address.id != keep_id)
    for addr in query.all():
        addr.is_default = False


def create_address(db: Session, user: User, data: AddressCreate) -> Address:
    is_first = db.query(Address).filter(Address.user_id == user.id).count() == 0
    address = Address(user_id=user.id, **data.model_dump())
    if is_first:
        address.is_default = True  # first address is always the default
    if address.is_default:
        _unset_other_defaults(db, user)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update_address(db: Session, user: User, address_id: int, data: AddressUpdate) -> Address:
    address = get_address(db, user, address_id)
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(address, key, value)
    if updates.get("is_default"):
        _unset_other_defaults(db, user, keep_id=address.id)
    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, user: User, address_id: int) -> None:
    address = get_address(db, user, address_id)
    was_default = address.is_default
    db.delete(address)
    db.flush()
    if was_default:  # promote another address to default
        other = db.query(Address).filter(Address.user_id == user.id).order_by(Address.id).first()
        if other:
            other.is_default = True
    db.commit()


def format_address(address: Address) -> str:
    parts = [address.address_line1, address.address_line2, address.city,
             f"{address.state} - {address.pincode}", address.country]
    return ", ".join(p for p in parts if p)
"""Run once to create (or promote) an admin user:   python create_admin.py"""
from getpass import getpass

import models  # noqa: F401
from core.security import hash_password
from database import Base, SessionLocal, engine
from models.user_model import User, UserRole

Base.metadata.create_all(bind=engine)

username = input("Admin username: ").strip()
db = SessionLocal()
try:
    user = db.query(User).filter(User.username == username).first()
    if user:
        user.role = UserRole.ADMIN
        print(f"Existing user '{username}' promoted to admin.")
    else:
        email = input("Admin email: ").strip().lower()
        password = getpass("Admin password (min 6 chars): ")
        if len(password) < 6:
            raise SystemExit("Password too short.")
        db.add(User(username=username, email=email, full_name="Administrator",
                    hashed_password=hash_password(password), role=UserRole.ADMIN))
        print(f"Admin user '{username}' created.")
    db.commit()
finally:
    db.close()
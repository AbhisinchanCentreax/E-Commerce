"""
Utility script to promote any user to ADMIN role or list existing users.
Usage:
    python promote_admin.py <username_or_email>
Or without arguments to list all registered users:
    python promote_admin.py
"""
import sys
from database import SessionLocal
from models.user_model import User, UserRole

def main():
    db = SessionLocal()
    try:
        if len(sys.argv) > 1:
            target = sys.argv[1].strip()
            user = db.query(User).filter(
                (User.username == target) | (User.email == target.lower())
            ).first()

            if not user:
                print(f"Error: User '{target}' was not found in the database.")
                print("Available users:")
                for u in db.query(User).all():
                    print(f" - {u.username} ({u.email}) [role={u.role}]")
                return

            user.role = UserRole.ADMIN
            db.commit()
            print(f"Success: User '{user.username}' (ID: {user.id}) has been promoted to ADMIN!")
        else:
            print("Registered users in database:")
            users = db.query(User).order_by(User.id).all()
            if not users:
                print(" No users registered yet.")
            for u in users:
                print(f" - ID: {u.id} | Username: {u.username} | Email: {u.email} | Role: {u.role} | Active: {u.is_active}")
            print("\nTo promote a user to admin, run:")
            print(" python promote_admin.py <username_or_email>")
    finally:
        db.close()

if __name__ == "__main__":
    main()

from app.db.session import SessionLocal
from app.models.role import Role

db = SessionLocal()

roles = ["admin", "doctor", "patient"]

for role_name in roles:
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        db.add(Role(name=role_name))

db.commit()
db.close()
print("Roles populated successfully.")

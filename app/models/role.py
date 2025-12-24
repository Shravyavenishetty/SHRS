from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, Session
import logging
from app.db.base import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # Example: "admin", "doctor", "patient"
    
    # Relationship with Permission
    permissions = relationship("Permission", back_populates="role")

    # Relationship with User
    users = relationship("User", back_populates="role")

def seed_roles(db: Session):
    """Seed the Role table with default roles."""
    logging.basicConfig(level=logging.INFO)  # Configure logging
    
    roles = ["admin", "doctor", "patient"]
    for role_name in roles:
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if not existing_role:
            role = Role(name=role_name)
            db.add(role)
            logging.info(f"Added role: {role_name}")
        else:
            logging.info(f"Role already exists: {role_name}")
    db.commit()

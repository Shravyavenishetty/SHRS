from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, index=True)  # e.g., "read_patient", "edit_appointment"
    role_id = Column(Integer, ForeignKey("roles.id"))
    role = relationship("Role", back_populates="permissions")

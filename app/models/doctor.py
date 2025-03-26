from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Ensure this field name matches
    specialty = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    contact = Column(String, nullable=False)
    experience = Column(Integer, nullable=False)
    hospital = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)  # Store hashed password
    is_active = Column(Boolean, default=True)
    role=Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Establish a relationship with the Appointment model
    appointments = relationship("Appointment", back_populates="doctor")  # Assuming Appointment has a doctor field
    medical_records = relationship("MedicalRecord", back_populates="doctor")  # Relationship with MedicalRecord
    prescriptions = relationship("Prescription", back_populates="doctor")  # Relationship with Prescription

    def __repr__(self):
        return f"<Doctor(id={self.id}, name={self.name}, specialty={self.specialty})>"

    @classmethod
    def hash_password(cls, password: str) -> str:
        """Method to hash the password, to be used during user creation/updating."""
        return pwd_context.hash(password)

from sqlalchemy import Column, Integer, String, Text, Date, Boolean
from datetime import date
from app.db.base import Base
from sqlalchemy.orm import relationship

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=True)
    address = Column(Text, nullable=False)
    medical_history = Column(Text, nullable=True)
    date_registered = Column(Date, default=date.today)
    is_active = Column(Boolean, default=True)

    # Define the relationship with MedicalRecord
    medical_records = relationship("MedicalRecord", back_populates="patient")
    # Define the relationship with Prescription
    prescriptions = relationship("Prescription", back_populates="patient")
    # Define the relationship with Appointment
    appointments = relationship("Appointment", back_populates="patient")

    def __repr__(self):
        return f"<Patient(id={self.id}, name={self.first_name} {self.last_name}, phone={self.phone})>"

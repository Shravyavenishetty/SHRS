from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.core.security import hash_password  # Function to hash passwords

def create_doctor(db: Session, doctor_data: DoctorCreate):
    """Create a new doctor in the database with hashed password."""
    try:
        hashed_password = hash_password(doctor_data.password)
        new_doctor = Doctor(**doctor_data.dict(exclude={"password"}), password=hashed_password)
        db.add(new_doctor)
        db.commit()
        db.refresh(new_doctor)
        return new_doctor
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email or contact already exists")

def get_doctors(db: Session):
    """Retrieve all doctors."""
    return db.query(Doctor).all()

def get_doctor_by_id(db: Session, doctor_id: int):
    """Retrieve a doctor by ID."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

def update_doctor(db: Session, doctor_id: int, doctor_data: DoctorUpdate):
    """Update a doctor by ID."""
    doctor = get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    if doctor_data.password:
        doctor_data.password = hash_password(doctor_data.password)  # Hash new password

    for key, value in doctor_data.dict(exclude_unset=True).items():
        setattr(doctor, key, value)

    db.commit()
    db.refresh(doctor)
    return doctor

def delete_doctor(db: Session, doctor_id: int):
    """Delete a doctor by ID."""
    doctor = get_doctor_by_id(db, doctor_id)
    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}

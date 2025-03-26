from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.services.doctor_service import (
    create_doctor, get_doctors, get_doctor_by_id, update_doctor, delete_doctor
)
from app.core.security import get_current_doctor  # Import the new get_current_doctor function
from app.models import Doctor

router = APIRouter()

@router.post("/", response_model=DoctorResponse)
def add_doctor(doctor: DoctorCreate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Create a new doctor (admin only)."""
    if current_doctor.role != "admin":  # Only allow admins to create doctors
        raise HTTPException(status_code=403, detail="You do not have permission to perform this action.")
    return create_doctor(db, doctor)

@router.get("/", response_model=list[DoctorResponse])
def list_doctors(db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Retrieve all doctors (admin or doctor only)."""
    if current_doctor.role not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="You do not have permission to view this resource.")
    return get_doctors(db)

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Retrieve a doctor by ID (admin or doctor only)."""
    if current_doctor.role not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="You do not have permission to view this resource.")
    return get_doctor_by_id(db, doctor_id)

@router.put("/{doctor_id}", response_model=DoctorResponse)
def modify_doctor(doctor_id: int, doctor: DoctorUpdate, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Update doctor details (admin only)."""
    if current_doctor.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to modify this resource.")
    return update_doctor(db, doctor_id, doctor)

@router.delete("/{doctor_id}")
def remove_doctor(doctor_id: int, db: Session = Depends(get_db), current_doctor: Doctor = Depends(get_current_doctor)):
    """Delete a doctor (admin only)."""
    if current_doctor.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this resource.")
    return delete_doctor(db, doctor_id)

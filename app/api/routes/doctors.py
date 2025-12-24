from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.services.doctor_service import (
    create_doctor, get_doctors, get_doctor_by_id, update_doctor, delete_doctor
)
from app.core.security import get_current_user
from app.core.permissions import has_permission
from app.schemas.user import UserSchema as User
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new doctor to the system. Only admins can create doctors."""
    logger.info(f"Current user: {current_user.email}, Role: {current_user.role.name}")
    
    if not has_permission(current_user.role.name, "create_doctor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create a doctor")
    
    return create_doctor(db, doctor)

@router.get("/", response_model=list[DoctorResponse])
def list_doctors(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Retrieve all doctors (admin or doctor only)."""
    if not has_permission(current_user.role.name, "view_all_doctors"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return get_doctors(db)

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(
    doctor_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Retrieve a doctor by ID. Doctors can view only their own profile unless they are admin."""
    doctor = get_doctor_by_id(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Admins can view all doctors, doctors can only view their own profile
    if current_user.role.name != "admin" and current_user.id != doctor.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    return doctor

@router.put("/{doctor_id}", response_model=DoctorResponse)
def modify_doctor(
    doctor_id: int, 
    doctor: DoctorUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Update doctor details. Admins can update any doctor, while doctors can only update their own profile."""
    doctor_record = get_doctor_by_id(db, doctor_id)
    if not doctor_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Admins can edit any doctor, doctors can only edit themselves
    if current_user.role.name != "admin" and current_user.id != doctor_record.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    return update_doctor(db, doctor_id, doctor)

@router.delete("/{doctor_id}")
def remove_doctor(
    doctor_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Delete a doctor. Only admins can delete, and doctors cannot delete themselves."""
    if not has_permission(current_user.role.name, "delete_doctor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    doctor_record = get_doctor_by_id(db, doctor_id)
    if not doctor_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Prevent users from deleting themselves for safety
    if current_user.id == doctor_record.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot delete yourself")
    
    return delete_doctor(db, doctor_id)

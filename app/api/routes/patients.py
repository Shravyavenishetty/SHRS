from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import (
    create_patient, get_patients, get_patient_by_id, update_patient, delete_patient
)
from app.core.security import get_current_user
from app.schemas.user import UserSchema as User
from app.core.permissions import has_permission
import logging


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=PatientResponse)
def add_patient(
    patient: PatientCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new patient. Only doctors and admins can add a patient."""
    logger.info(f"Current user: {current_user.email}, Role: {current_user.role.name}")

    if not has_permission(current_user.role.name, "create_patient"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return create_patient(db, patient)

@router.get("/", response_model=list[PatientResponse])
def list_patients(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Retrieve all patients. Only doctors and admins can access this."""
    if not has_permission(current_user.role.name, "view_all_patients"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    return get_patients(db)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Retrieve a patient by ID. Patients can view only their records, doctors can view all."""
    patient = get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    # Check permission - patients can only view their own records
    if current_user.role.name == "patient" and current_user.id != patient.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def modify_patient(
    patient_id: int, 
    patient: PatientUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Update patient details. Only doctors or the patient themselves can update."""
    if not has_permission(current_user.role.name, "edit_patient"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    patient_record = get_patient_by_id(db, patient_id)
    if not patient_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    # Patients can only update their own records
    if current_user.role.name == "patient" and current_user.id != patient_record.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return update_patient(db, patient_id, patient)

@router.delete("/{patient_id}")
def remove_patient(
    patient_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Delete a patient. Only admins can delete."""
    if not has_permission(current_user.role.name, "delete_patient"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    
    return delete_patient(db, patient_id)

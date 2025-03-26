from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import (
    create_patient, get_patients, get_patient_by_id, update_patient, delete_patient
)
from app.core.security import get_current_user
from app.schemas.user import UserSchema as User

router = APIRouter()

@router.post("/", response_model=PatientResponse)
def add_patient(patient: PatientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new patient."""
    return create_patient(db, patient)

@router.get("/", response_model=list[PatientResponse])
def list_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all patients."""
    return get_patients(db)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve a patient by ID."""
    return get_patient_by_id(db, patient_id)

@router.put("/{patient_id}", response_model=PatientResponse)
def modify_patient(patient_id: int, patient: PatientUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update patient details."""
    return update_patient(db, patient_id, patient)

@router.delete("/{patient_id}")
def remove_patient(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a patient."""
    return delete_patient(db, patient_id)

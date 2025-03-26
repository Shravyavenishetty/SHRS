from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse, PrescriptionUpdate
from app.services.prescription_service import (
    create_prescription, get_prescription_by_id, get_all_prescriptions, update_prescription, delete_prescription
)
from app.core.security import get_current_doctor  # Import the dependency for authentication

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.post("/", response_model=PrescriptionResponse)
def add_prescription(prescription_data: PrescriptionCreate, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    """Add a new prescription."""
    # Ensure the current user is a doctor
    if not current_doctor:
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    return create_prescription(db, prescription_data)

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def fetch_prescription(prescription_id: int, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    """Get details of a specific prescription."""
    # Ensure the current user is a doctor
    if not current_doctor:
        raise HTTPException(status_code=403, detail="Only doctors can access prescriptions")
    prescription = get_prescription_by_id(db, prescription_id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.get("/", response_model=list[PrescriptionResponse])
def list_prescriptions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    """Retrieve a list of prescriptions."""
    # Ensure the current user is a doctor
    if not current_doctor:
        raise HTTPException(status_code=403, detail="Only doctors can list prescriptions")
    return get_all_prescriptions(db, skip, limit)

@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def modify_prescription(prescription_id: int, prescription_data: PrescriptionUpdate, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    """Update prescription details."""
    # Ensure the current user is a doctor
    if not current_doctor:
        raise HTTPException(status_code=403, detail="Only doctors can modify prescriptions")
    updated_prescription = update_prescription(db, prescription_id, prescription_data)
    if not updated_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return updated_prescription

@router.delete("/{prescription_id}")
def remove_prescription(prescription_id: int, db: Session = Depends(get_db), current_doctor: User = Depends(get_current_doctor)):
    """Delete a prescription."""
    # Ensure the current user is a doctor
    if not current_doctor:
        raise HTTPException(status_code=403, detail="Only doctors can delete prescriptions")
    deleted_prescription = delete_prescription(db, prescription_id)
    if not deleted_prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return {"message": "Prescription deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordResponse, MedicalRecordUpdate
from app.services.medical_record_service import (
    create_medical_record, get_medical_record_by_id, get_all_medical_records, update_medical_record, delete_medical_record
)
from app.core.security import get_current_doctor, get_current_user  # Importing authentication functions

router = APIRouter()

@router.post("/", response_model=MedicalRecordResponse)
def add_medical_record(
    record_data: MedicalRecordCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Add a new medical record."""
    # Ensure that the current user has permission (e.g., doctors can add records)
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized to add medical records")
    
    return create_medical_record(db, record_data)

@router.get("/{record_id}", response_model=MedicalRecordResponse)
def fetch_medical_record(
    record_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific medical record."""
    record = get_medical_record_by_id(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Optional: Add logic to allow patient to fetch their own records or a doctor to fetch any record
    if current_user.role == "patient" and record.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this record")
    
    return record

@router.get("/", response_model=list[MedicalRecordResponse])
def list_medical_records(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a list of medical records."""
    # Allow doctor to list all records, but patients can only view their own records
    if current_user.role == "patient":
        return get_all_medical_records(db, skip, limit, patient_id=current_user.id)
    
    return get_all_medical_records(db, skip, limit)

@router.put("/{record_id}", response_model=MedicalRecordResponse)
def modify_medical_record(
    record_id: int, 
    record_data: MedicalRecordUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update medical record details."""
    record = get_medical_record_by_id(db, record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Only allow the doctor to modify the record or the owner of the record (patient)
    if current_user.role == "doctor" and record.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this record")
    
    if current_user.role == "patient" and record.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this record")
    
    return update_medical_record(db, record_id, record_data)

@router.delete("/{record_id}")
def remove_medical_record(
    record_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a medical record."""
    record = get_medical_record_by_id(db, record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    
    # Only allow the doctor to delete the record or the owner of the record (patient)
    if current_user.role == "doctor" and record.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
    
    if current_user.role == "patient" and record.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this record")
    
    delete_medical_record(db, record_id)
    return {"message": "Medical record deleted successfully"}

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate
import logging


logger=logging.getLogger(__name__)

def create_patient(db: Session, patient: PatientCreate) -> Patient:
    """Create a new patient."""
    try:
        new_patient = Patient(**patient.dict())
        db.add(new_patient)
        db.commit()
        db.refresh(new_patient)
        logger.info(f"Patient  created successfully: {new_patient.id}")
        return new_patient  # Ensure the full Patient object is returned
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error creating patient: {e}")
        raise HTTPException(status_code=400, detail="Error creating patient")

def get_patients(db: Session):
    """Get all patients."""
    return db.query(Patient).all()

def get_patient_by_id(db: Session, patient_id: int):
    """Get a patient by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

def update_patient(db: Session, patient_id: int, patient_data: PatientUpdate):
    """Update a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    for key, value in patient_data.dict().items():
        setattr(patient, key, value)

    db.commit()
    db.refresh(patient)
    return patient

def delete_patient(db: Session, patient_id: int):
    """Delete a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

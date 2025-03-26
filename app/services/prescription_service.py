from sqlalchemy.orm import Session
from app.models.prescription import Prescription
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate

def create_prescription(db: Session, prescription_data: PrescriptionCreate):
    """Create a new prescription."""
    new_prescription = Prescription(**prescription_data.dict())
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)
    return new_prescription

def get_prescription_by_id(db: Session, prescription_id: int):
    """Get a prescription by ID."""
    return db.query(Prescription).filter(Prescription.id == prescription_id).first()

def get_all_prescriptions(db: Session, skip: int = 0, limit: int = 10):
    """Get all prescriptions."""
    return db.query(Prescription).offset(skip).limit(limit).all()

def update_prescription(db: Session, prescription_id: int, prescription_data: PrescriptionUpdate):
    """Update a prescription."""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if prescription:
        for key, value in prescription_data.dict(exclude_unset=True).items():
            setattr(prescription, key, value)
        db.commit()
        db.refresh(prescription)
    return prescription

def delete_prescription(db: Session, prescription_id: int):
    """Delete a prescription."""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if prescription:
        db.delete(prescription)
        db.commit()
    return {"message": "Prescription deleted successfully"}

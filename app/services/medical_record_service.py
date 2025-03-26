from sqlalchemy.orm import Session
from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordCreate, MedicalRecordUpdate

def create_medical_record(db: Session, record_data: MedicalRecordCreate):
    """Create a new medical record."""
    new_record = MedicalRecord(**record_data.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

def get_medical_record_by_id(db: Session, record_id: int):
    """Get a medical record by ID."""
    return db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()

def get_all_medical_records(db: Session, skip: int = 0, limit: int = 10):
    """Retrieve a paginated list of medical records."""
    return db.query(MedicalRecord).offset(skip).limit(limit).all()

def update_medical_record(db: Session, record_id: int, record_data: MedicalRecordUpdate):
    """Update a medical record."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if record:
        for key, value in record_data.dict(exclude_unset=True).items():
            setattr(record, key, value)
        db.commit()
        db.refresh(record)
    return record

def delete_medical_record(db: Session, record_id: int):
    """Delete a medical record."""
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if record:
        db.delete(record)
        db.commit()
    return record

from sqlalchemy.orm import Session
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate

def create_medicine(db: Session, medicine_data: MedicineCreate):
    """Create a new medicine."""
    new_medicine = Medicine(**medicine_data.dict())
    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)
    return new_medicine

def get_medicine_by_id(db: Session, medicine_id: int):
    """Get a medicine by ID."""
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()

def get_all_medicines(db: Session, skip: int = 0, limit: int = 10):
    """Get all medicines."""
    return db.query(Medicine).offset(skip).limit(limit).all()

def update_medicine(db: Session, medicine_id: int, medicine_data: MedicineUpdate):
    """Update a medicine."""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if medicine:
        for key, value in medicine_data.dict(exclude_unset=True).items():
            setattr(medicine, key, value)
        db.commit()
        db.refresh(medicine)
    return medicine

def delete_medicine(db: Session, medicine_id: int):
    """Delete a medicine."""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if medicine:
        db.delete(medicine)
        db.commit()
    return {"message": "Medicine deleted successfully"}

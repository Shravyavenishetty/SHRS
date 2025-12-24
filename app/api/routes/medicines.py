from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineUpdate
from app.services.medicine_service import (
    create_medicine, get_medicine_by_id, get_all_medicines, update_medicine, delete_medicine
)
from app.core.security import get_current_user  # Import the authentication dependency
from app.models import User  # Assuming User model exists

router = APIRouter(tags=["Medicines"])

@router.post("/", response_model=MedicineResponse)
def add_medicine(medicine_data: MedicineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Add a new medicine."""
    # You can now use current_user for authorization logic if needed
    return create_medicine(db, medicine_data)

@router.get("/{medicine_id}", response_model=MedicineResponse)
def fetch_medicine(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get details of a specific medicine."""
    medicine = get_medicine_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

@router.get("/", response_model=list[MedicineResponse])
def list_medicines(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve a list of medicines."""
    return get_all_medicines(db, skip, limit)

@router.put("/{medicine_id}", response_model=MedicineResponse)
def modify_medicine(medicine_id: int, medicine_data: MedicineUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update medicine details."""
    updated_medicine = update_medicine(db, medicine_id, medicine_data)
    if not updated_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return updated_medicine

@router.delete("/{medicine_id}")
def remove_medicine(medicine_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a medicine."""
    deleted_medicine = delete_medicine(db, medicine_id)
    if not deleted_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"message": "Medicine deleted successfully"}

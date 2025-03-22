from fastapi import APIRouter , Depends, HTTPException
from app.services.doctor_service import create_doctor, get_all_doctors, get_doctor_by_id, update_doctor, delete_doctor
from app.models.doctor import Doctor
from app.services.auth_service import get_current_doctor



router=APIRouter()

@router.post("/",response_model=Doctor)
async def add_doctor(doctor: Doctor):
    """Register a new doctor."""
    return await create_doctor(doctor)

@router.get("/", response_model=list[Doctor])
async def list_doctors():
    """Retrieve all doctors."""
    return await get_all_doctors()

@router.get("/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    """Retrieve a doctor by ID."""
    return await get_doctor_by_id(doctor_id)

@router.put("/{doctor_id}")
async def modify_doctor(doctor_id: str, update_data: dict, doctor: dict = Depends(get_current_doctor)):
    """Update doctor details (only authenticated doctors)."""
    if str(doctor["_id"]) != doctor_id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this doctor")
    return await update_doctor(doctor_id, update_data)

@router.delete("/{doctor_id}")
async def remove_doctor(doctor_id: str, doctor: dict = Depends(get_current_doctor)):
    """Delete a doctor by ID (only authenticated doctors)."""
    if str(doctor["_id"]) != doctor_id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this doctor")
    return await delete_doctor(doctor_id)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.services.appointment_service import create_appointment, get_appointments_by_patient, get_appointments_by_doctor, update_appointment_status
from app.api.dependencies import get_current_user
from app.models.doctor import Doctor
from app.models.user import User  
from app.core.security import get_current_doctor

router = APIRouter()

@router.post("/", response_model=AppointmentResponse)
def book_appointment(appointment_data: AppointmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Book an appointment."""
    # Ensure only patients can book appointments (you can add role checks if needed)
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments.")
    return create_appointment(db, appointment_data, current_user.id)

@router.get("/patient/{patient_id}", response_model=list[AppointmentResponse])
def get_patient_appointments(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve appointments for a patient."""
    if current_user.role != "patient" or current_user.id != patient_id:
        raise HTTPException(status_code=403, detail="You do not have permission to view this resource.")
    return get_appointments_by_patient(db, patient_id)

@router.get("/doctor", response_model=list[AppointmentResponse])
def get_doctor_appointments(current_user: Doctor = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve appointments for the logged-in doctor."""
    return get_appointments_by_doctor(db, current_user.id)

@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, update_data: AppointmentUpdate, db: Session = Depends(get_db), current_user: Doctor = Depends(get_current_doctor)):
    """Update appointment status."""
    # Ensure only the doctor associated with the appointment can update it
    return update_appointment_status(db, appointment_id, update_data, current_user.id)

from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from fastapi import HTTPException

def create_appointment(db: Session, appointment_data: AppointmentCreate, patient_id: int):
    """Create a new appointment."""
    new_appointment = Appointment(**appointment_data.dict(), patient_id=patient_id)
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment

def get_appointments_by_patient(db: Session, patient_id: int):
    """Get appointments by patient ID."""
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()

def get_appointments_by_doctor(db: Session, doctor_id: int):
    """Get appointments by doctor ID."""
    return db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()

def update_appointment_status(db: Session, appointment_id: int, update_data: AppointmentUpdate, doctor_id: int):
    """Update the status of an appointment."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor_id).first()
    if appointment:
        for key, value in update_data.dict(exclude_unset=True).items():
            setattr(appointment, key, value)
        db.commit()
        db.refresh(appointment)
    return appointment

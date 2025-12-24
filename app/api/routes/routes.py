from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import check_role, get_current_user
from app.db.session import get_db
from app.models import Appointment, MedicalRecord, Prescription, User, Doctor, Medicine

router = APIRouter()

# ✅ Admin - Full access
@router.get("/users", dependencies=[Depends(check_role(["admin"]))])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/doctors", dependencies=[Depends(check_role(["admin"]))])
def get_all_doctors(db: Session = Depends(get_db)):
    return db.query(Doctor).all()

@router.get("/patients", dependencies=[Depends(check_role(["admin"]))])
def get_all_patients(db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == "patient").all()

@router.get("/medicines", dependencies=[Depends(check_role(["admin", "doctor"]))])
def get_all_medicines(db: Session = Depends(get_db)):
    return db.query(Medicine).all()

@router.get("/prescriptions", dependencies=[Depends(check_role(["admin"]))])
def get_all_prescriptions(db: Session = Depends(get_db)):
    return db.query(Prescription).all()

@router.get("/medical_records", dependencies=[Depends(check_role(["admin"]))])
def get_all_medical_records(db: Session = Depends(get_db)):
    return db.query(MedicalRecord).all()

@router.get("/appointments", dependencies=[Depends(check_role(["admin"]))])
def get_all_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).all()

# ✅ Doctor - Limited access
@router.get("/appointments/doctor", dependencies=[Depends(check_role(["doctor"]))])
def get_doctor_appointments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.doctor_id == user.id).all()

@router.get("/medical_records/doctor", dependencies=[Depends(check_role(["doctor"]))])
def get_medical_records_for_doctor(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(MedicalRecord).filter(MedicalRecord.doctor_id == user.id).all()

@router.get("/prescriptions/doctor", dependencies=[Depends(check_role(["doctor"]))])
def get_prescriptions_for_doctor(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.doctor_id == user.id).all()

# ✅ Patient - Limited access
@router.get("/medical_records", dependencies=[Depends(check_role(["patient"]))])
def get_patient_medical_records(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == user.id).all()

@router.post("/prescriptions", dependencies=[Depends(check_role(["patient"]))])
def post_prescription(user: User = Depends(get_current_user), db: Session = Depends(get_db), medicine: str = "", dosage: str = ""):
    prescription = Prescription(patient_id=user.id, doctor_id=None, medicine=medicine, dosage=dosage)
    db.add(prescription)
    db.commit()
    return {"message": "Prescription added"}

@router.post("/appointments", dependencies=[Depends(check_role(["patient"]))])
def book_appointment(user: User = Depends(get_current_user), db: Session = Depends(get_db), doctor_id: int = 0, date: str = "", time: str = ""):
    appointment = Appointment(patient_id=user.id, doctor_id=doctor_id, date=date, time=time)
    db.add(appointment)
    db.commit()
    return {"message": "Appointment booked"}

@router.post("/patients", dependencies=[Depends(check_role(["patient"]))])
def post_patient(user: User = Depends(get_current_user), db: Session = Depends(get_db), name: str = "", age: int = 0, gender: str = ""):
    new_patient = User(name=name, age=age, gender=gender, role="patient")
    db.add(new_patient)
    db.commit()
    return {"message": "Patient profile created"}

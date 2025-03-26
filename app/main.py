import logging
from fastapi import FastAPI
from app.api.routes.patients import router as patient_router
from app.api.routes.doctors import router as doctor_router
from app.api.routes.auth import router as auth_router
from app.api.routes.appointments import router as appointments_router
from app.api.routes.medicines import router as medicines_router
from app.api.routes.medical_records import router as medical_record_router
from app.api.routes.prescriptions import router as prescription_router
from app.db.session import engine, Base  # Ensure these are correctly imported
from app.models.user import User  # Ensure the User model is imported
from app.db.init_db import init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Swecha Health Records System")

# Create all tables
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(patient_router, prefix="/patients", tags=["Patients"])
app.include_router(doctor_router, prefix="/doctors", tags=["Doctors"])
app.include_router(appointments_router, prefix="/appointments", tags=["Appointments"])
app.include_router(medicines_router, prefix="/medicines", tags=["Medicines"])
app.include_router(medical_record_router, prefix="/medical_records", tags=["MedicalRecords"])
app.include_router(prescription_router, prefix="/prescriptions", tags=["Prescriptions"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

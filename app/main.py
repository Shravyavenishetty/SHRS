import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.patients import router as patient_router
from app.api.routes.doctors import router as doctor_router
from app.api.routes.auth import router as auth_router
from app.api.routes.appointments import router as appointment_router
from app.api.routes.medicines import router as medicine_router
from app.api.routes.medical_records import router as medical_record_router
from app.api.routes.prescriptions import router as prescription_router
from app.api.routes.users import router as users_router
from app.api.routes.routes import router as api_router
from app.db.session import engine, Base
from app.models.user import User
from app.db.init_db import init_db
from app.db.session import get_db
from app.models.role import seed_roles

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Swecha Health Records System",
    description="Healthcare management system with role-based access control",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default dev server
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    """Initialize database and seed roles on startup."""
    logger.info("Starting up application...")
    init_db()
    db = next(get_db())
    seed_roles(db)
    logger.info("Application startup complete")

@app.get("/", tags=["root"])
def read_root():
    """Root endpoint returning API information."""
    return {
        "message": "Welcome to Swecha Health Records System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Register routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(users_router, prefix="/api", tags=["users"])
app.include_router(patient_router, prefix="/patients", tags=["patients"])
app.include_router(doctor_router, prefix="/doctors", tags=["doctors"])
app.include_router(appointment_router, prefix="/appointments", tags=["appointments"])
app.include_router(medicine_router, prefix="/medicines", tags=[" medicines"])
app.include_router(medical_record_router, prefix="/medical_records", tags=["medical_records"])
app.include_router(prescription_router, prefix="/prescriptions", tags=["prescriptions"])
app.include_router(api_router, prefix="/api")

logger.info("All routes registered successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

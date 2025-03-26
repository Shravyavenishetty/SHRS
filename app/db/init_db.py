from sqlalchemy import create_engine
from app.models.user import Base as UserBase
from app.models.doctor import Base as DoctorBase
from app.core.config import settings
from app.db.base import Base  # Import your Base class
from app.db.session import engine

def init_db():
    # Import all the models here to ensure they are registered properly
    from app.models import patient, doctor, user, medical_record, prescription, appointment  # Import your models

    # Create tables
    Base.metadata.create_all(bind=engine)

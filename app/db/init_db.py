from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.user import Base as UserBase
from app.models.doctor import Base as DoctorBase
from app.core.config import settings
from app.db.base import Base  # Import your Base class
from app.db.session import engine
from app.models.role import Role

def init_roles(db: Session):
    """Initialize the Role table with default roles."""
    roles = ["admin", "doctor", "patient"]
    for role_name in roles:
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if not existing_role:
            new_role = Role(name=role_name)
            db.add(new_role)
    db.commit()

def init_db():
    """Initialize the database and seed roles."""
    # Import all the models here to ensure they are registered properly
    from app.models import patient, doctor, user, medical_record, prescription, appointment, role  # Import your models

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Initialize roles
    with Session(engine) as db:
        init_roles(db)
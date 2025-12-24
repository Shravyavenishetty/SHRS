from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.doctor import Doctor
from app.models.user import User
from app.models.role import Role
from app.schemas.doctor import DoctorCreate, DoctorUpdate
from app.core.security import hash_password  # Function to hash passwords

def create_doctor(db: Session, doctor_data: DoctorCreate):
    """Create a new doctor in the database with hashed password and corresponding user."""
    try:
        # Hash the password before storing
        hashed_password = hash_password(doctor_data.password)
        
        # First, get the 'doctor' role
        doctor_role = db.query(Role).filter(Role.name == "doctor").first()
        if not doctor_role:
            raise HTTPException(status_code=500, detail="Doctor role not found in database")
        
        # Create a User record first
        new_user = User(
            username=doctor_data.email.split('@')[0],  # Use email prefix as username
            email=doctor_data.email,
            hashed_password=hashed_password,
            is_active=True,
            role_id=doctor_role.id
        )
        db.add(new_user)
        db.flush()  # Flush to get the user ID without committing
        
        # Now create the doctor record linked to the user
        new_doctor = Doctor(
            user_id=new_user.id,
            name=doctor_data.name,
            specialty=doctor_data.specialty,
            email=doctor_data.email,
            contact=doctor_data.contact,
            experience=doctor_data.experience,
            hospital=doctor_data.hospital if hasattr(doctor_data, 'hospital') else None,
            hashed_password=hashed_password,
            is_active=True
        )
        
        # Add the new doctor to the database session
        db.add(new_doctor)
        db.commit()  # Commit both user and doctor
        db.refresh(new_doctor)  # Refresh to get the updated doctor object
        return new_doctor
    except IntegrityError as e:
        db.rollback()  # Rollback the transaction in case of an error (e.g., duplicate email/phone)
        raise HTTPException(status_code=400, detail="Email or contact already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

def get_doctors(db: Session):
    """Retrieve all doctors from the database."""
    return db.query(Doctor).all()

def get_doctor_by_id(db: Session, doctor_id: int):
    """Retrieve a doctor by ID."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

def update_doctor(db: Session, doctor_id: int, doctor_data: DoctorUpdate):
    """Update a doctor by ID."""
    doctor = get_doctor_by_id(db, doctor_id)  # Ensure the doctor exists
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # If password is provided, hash it before saving
    if doctor_data.password:
        doctor_data.password = hash_password(doctor_data.password)
    
    # Update doctor fields based on input data
    for key, value in doctor_data.dict(exclude_unset=True).items():
        setattr(doctor, key, value)  # Update the doctor instance

    db.commit()  # Commit the changes to the database
    db.refresh(doctor)  # Refresh to get the updated doctor instance
    return doctor

def delete_doctor(db: Session, doctor_id: int):
    """Delete a doctor by ID."""
    doctor = get_doctor_by_id(db, doctor_id)  # Ensure the doctor exists
    db.delete(doctor)  # Remove doctor from the session
    db.commit()  # Commit to delete the doctor from the database
    return {"message": "Doctor deleted successfully"}

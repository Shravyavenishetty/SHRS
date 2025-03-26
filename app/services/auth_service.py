from sqlalchemy.orm import Session
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.doctor import Doctor
from app.models.user import User  # Ensure this is the SQLAlchemy model
from app.schemas.user import UserLogin, UserCreate  # Ensure UserCreate schema exists for registration
from app.core.security import verify_password, create_access_token, hash_password  # Ensure you have hash_password function
import logging

logger = logging.getLogger(__name__)

# Function to authenticate a regular user
def authenticate_user(db: Session, login_data: UserLogin):
    """Authenticate a user using email and password."""
    logger.info(f"Authenticating user: {login_data.email}")
    result = db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalars().first()  # No await needed

    if not user or not verify_password(login_data.password, user.hashed_password):  # Ensure correct field
        logger.error("Authentication failed for user")
        return None

    if not user.is_active:
        logger.error("User is inactive")
        raise HTTPException(status_code=403, detail="User is inactive")

    logger.info("User authenticated successfully")
    return {"type": "user", "data": user}

# Function to authenticate a doctor
def authenticate_doctor(db: Session, login_data: UserLogin):
    """Authenticate a doctor using email and password."""
    logger.info(f"Authenticating doctor: {login_data.email}")
    result = db.execute(select(Doctor).filter(Doctor.email == login_data.email))
    doctor = result.scalars().first()  # No await needed

    if not doctor or not verify_password(login_data.password, doctor.hashed_password):  # Ensure correct field
        logger.error("Authentication failed for doctor")
        return None

    if not doctor.is_active:
        logger.error("Doctor is inactive")
        raise HTTPException(status_code=403, detail="Doctor is inactive")

    logger.info("Doctor authenticated successfully")
    return {"type": "doctor", "data": doctor}

def login_user(db: Session, login_data: UserLogin):
    """Login a user or doctor and return an access token."""
    logger.info("Logging in user or doctor")
    # Try authenticating as a user
    user_or_doctor = authenticate_user(db, login_data)
    
    # If user authentication fails, try authenticating as a doctor
    if not user_or_doctor:
        user_or_doctor = authenticate_doctor(db, login_data)

    if not user_or_doctor:
        logger.error("Invalid email or password")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = user_or_doctor["data"]
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    logger.info(f"Access token created for: {user.email}")

    return {"access_token": access_token, "token_type": "bearer"}

def register_user(db: Session, register_data: UserCreate):
    """Register a new user or doctor."""
    logger.info(f"Registering user: {register_data.email}")
    # Check if the email already exists in the user table
    result = db.execute(select(User).filter(User.email == register_data.email))
    existing_user = result.scalars().first()  # No await needed

    if existing_user:
        logger.error("Email already registered")
        raise HTTPException(status_code=400, detail="Email already registered")

    # If not a user, check if the email exists in the doctor table
    result = db.execute(select(Doctor).filter(Doctor.email == register_data.email))
    existing_doctor = result.scalars().first()  # No await needed

    if existing_doctor:
        logger.error("Email already registered")
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before saving
    hashed_password = hash_password(register_data.password)

    # Create the new user or doctor
    if register_data.role == "doctor":
        new_user_or_doctor = Doctor(
            email=register_data.email,
            hashed_password=hashed_password,  # Corrected field name
            name=register_data.full_name,  # Corrected field name
            specialty=register_data.role.value,  # Ensure role is converted to string
            contact=register_data.contact,  # Ensure contact is provided
            experience=register_data.experience,  # Ensure experience is provided
            is_active=True  # Assuming the user/doctor is active by default
        )
        role = "doctor"  # Set role for Doctor
    else:
        new_user_or_doctor = User(
            email=register_data.email,
            hashed_password=hashed_password,  # Corrected field name
            full_name=register_data.full_name,
            role=register_data.role.value,  # Ensure role is converted to string
            is_active=True  # Assuming the user/doctor is active by default
        )
        role = register_data.role.value  # Set role for User

    db.add(new_user_or_doctor)
    db.commit()
    db.refresh(new_user_or_doctor)

    logger.info(f"User/Doctor registered successfully: {new_user_or_doctor.email}")
    return {"message": "User/Doctor registered successfully", "user": new_user_or_doctor, "role": role}

def delete_user_or_doctor(db: Session, email: str) -> bool:
    """Delete a user or doctor by email."""
    logger.info(f"Deleting user or doctor with email: {email}")
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.delete(user)
        db.commit()
        logger.info(f"User with email {email} deleted successfully")
        return True

    doctor = db.query(Doctor).filter(Doctor.email == email).first()
    if doctor:
        db.delete(doctor)
        db.commit()
        logger.info(f"Doctor with email {email} deleted successfully")
        return True

    logger.error(f"User or doctor with email {email} not found")
    return False

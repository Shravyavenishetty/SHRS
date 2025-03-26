from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.models.user import User as UserModel
from app.models.doctor import Doctor as DoctorModel
from app.schemas.user import UserLogin, UserCreate, UserResponse, Token
from app.services.auth_service import (
    register_user,
    authenticate_doctor,
    authenticate_user,
    create_access_token,
    delete_user_or_doctor  # Import the delete function
)
from app.core.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    logger.info("Registering a new user")
    new_user_data = register_user(db, user)

    if not new_user_data or "user" not in new_user_data:
        logger.error("Registration failed")
        raise HTTPException(status_code=400, detail="Registration failed")

    new_user = new_user_data["user"]
    role = new_user_data.get("role", "user")  # Default to 'user' if role is missing
    logger.info(f"User registered successfully: {new_user.email}")
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name if hasattr(new_user, 'full_name') else new_user.name,
        role=role
    )

@router.post("/token", response_model=Token)
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user or doctor and return a JWT token."""
    logger.info("Attempting to authenticate and generate a token")
    login_data = UserLogin(email=form_data.username, password=form_data.password)

    user_auth = None
    doctor_auth = None

    try:
        user_auth = authenticate_user(db, login_data)
    except HTTPException:
        pass  # Ignore and try authenticating as a doctor

    if user_auth:
        user = user_auth["data"]
        token = create_access_token(data={"sub": user.email, "role": "user"}, expires_delta=timedelta(minutes=30))
        logger.info(f"User logged in successfully: {user.email}")
        return {"access_token": token, "token_type": "bearer"}

    try:
        doctor_auth = authenticate_doctor(db, login_data)
    except HTTPException:
        pass

    if doctor_auth:
        doctor = doctor_auth["data"]
        token = create_access_token(data={"sub": doctor.email, "role": "doctor"}, expires_delta=timedelta(minutes=30))
        logger.info(f"Doctor logged in successfully: {doctor.email}")
        return {"access_token": token, "token_type": "bearer"}

    logger.error("Invalid email or password")
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.delete("/delete/{email}")
def delete_user(email: str, db: Session = Depends(get_db)):
    """Delete a user or doctor by email."""
    logger.info(f"Attempting to delete user or doctor with email: {email}")
    success = delete_user_or_doctor(db, email)
    if not success:
        logger.error(f"User or doctor with email {email} not found")
        raise HTTPException(status_code=404, detail="User or doctor not found")
    logger.info(f"User or doctor with email {email} deleted successfully")
    return {"message": "User or doctor deleted successfully"}

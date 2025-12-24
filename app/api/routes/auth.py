from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta

from app.models.user import User as UserModel
from app.models.doctor import Doctor as DoctorModel
from app.schemas.user import UserLogin, UserCreate, UserResponse, Token, UserRole
from app.services.auth_service import (
    register_user,
    authenticate_doctor,
    authenticate_user,
    create_access_token,
    delete_user_or_doctor  # Import the delete function
)
from app.core.database import get_db
from app.core.security import decode_access_token  # Import the function
from app.core.permissions import has_permission  # Import the function
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")  # Define this

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    logger.info("Registering a new user")
    if user.role not in UserRole.__members__.values():
        logger.error(f"Invalid role provided: {user.role}")
        raise HTTPException(status_code=400, detail="Invalid role value")

    # Call register_user without requiring a token
    new_user_data = register_user(db, user)

    if not new_user_data or "user" not in new_user_data:
        logger.error("Registration failed")
        raise HTTPException(status_code=400, detail="Registration failed")

    new_user = new_user_data["user"]
    role = user.role
    logger.info(f"User registered successfully: {new_user.email}")
    
    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.username,
        role=role
    )

@router.post("/token", response_model=Token)
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user or doctor and return a JWT token."""
    logger.info("Attempting to authenticate and generate a token")
    login_data = UserLogin(email=form_data.username, password=form_data.password)

    user_auth = authenticate_user(db, login_data)
    if user_auth:
        user = user_auth["data"]
        logger.info(f"User role: {user.role.name}")
        token = create_access_token(data={"sub": user.email, "role": user.role.name}, expires_delta=timedelta(minutes=30))
        logger.info(f"Token generated for user: {user.email}")
        return {"access_token": token, "token_type": "bearer"}

    logger.error("Invalid email or password")
    raise HTTPException(status_code=401, detail="Invalid email or password")

@router.delete("/delete/{email}")
def delete_user(email: str, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """Delete a user or doctor by email."""
    logger.info(f"Attempting to delete user or doctor with email: {email}")

    # Extract role from token
    payload = decode_access_token(token)
    role: str = payload.get("role")

    # Check if the role has permission to delete users
    if not has_permission(role, "delete_user"):
        raise HTTPException(status_code=403, detail="Not authorized to delete users")

    success = delete_user_or_doctor(db, email)
    if not success:
        logger.error(f"User or doctor with email {email} not found")
        raise HTTPException(status_code=404, detail="User or doctor not found")
    logger.info(f"User or doctor with email {email} deleted successfully")
    return {"message": "User or doctor deleted successfully"}
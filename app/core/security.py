import logging
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db
from app.models import Doctor, User  # Assuming User and Doctor models are available
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Secret key for JWT (replace this with a more secure method in production)
SECRET_KEY = "Xfwsub3eGdLhHaW8OZcpvXq-RgfwW5Q72yEnnpQaxNE"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour

# OAuth2 scheme for Bearer token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Password hash context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Set up logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generate JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    """Decode JWT and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Decoded token payload: {payload}")
        return payload
    except JWTError:
        logger.error("Invalid token.")
        raise HTTPException(status_code=401, detail="Invalid token")

# Dependency to extract user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode and verify JWT token, and extract user information."""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    role: str = payload.get("role")

    logger.info(f"Decoded token: email={email}, role={role}")

    if not email or not role:
        logger.error("Invalid token, missing email or role.")
        raise HTTPException(status_code=401, detail="Invalid token")

    # Retrieve user from the database using email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        logger.error(f"User with email {email} not found.")
        raise HTTPException(status_code=404, detail="User not found")

    # Log the role name for debugging
    logger.info(f"User role from database: {user.role.name}")

    # Return the user object with the role name accessible as `user.role.name`
    return user

def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Doctor:
    """Retrieve the current doctor from the JWT token. Handles both admin and doctor roles."""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    role: str = payload.get("role")

    logger.info(f"Decoded token: email={email}, role={role}")

    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    # If role is 'admin', we allow access but don't need to fetch a doctor
    if role == "admin":
        logger.info(f"Admin user {email} authorized to access doctor resources.")
        return None  # Admin doesn't need a Doctor entry in DB, but is authorized

    # If role is 'doctor', we look up the doctor in the database
    if role == "doctor":
        doctor = db.query(Doctor).filter(Doctor.email == email).first()
        
        if not doctor:
            logger.error(f"Doctor with email {email} not found.")
            raise HTTPException(status_code=404, detail="Doctor not found")

        logger.info(f"Doctor with email {email} successfully fetched.")
        return doctor

    # If role is neither admin nor doctor, deny access
    logger.error(f"Unauthorized role: {role}")
    raise HTTPException(status_code=403, detail="Not authorized to access doctor resources")


def has_permission(role: str, action: str) -> bool:
    """Check if a role has permission for a given action."""
    role_permissions = {
        "admin": [
            "create_user", "delete_user", "view_all_users", "edit_user",
            "create_patient", "delete_patient", "view_all_patients", "edit_patient",
            "manage_roles", "view_permissions",
            "create_doctor", "delete_doctor", "view_all_doctors", "edit_doctors"
        ],
        "doctor": [
            "view_patients", "edit_patient", "create_patient", "view_prescriptions"
        ],
        "patient": [
            "view_self", "edit_self", "view_prescriptions"
        ],
    }
    
    # Check if the action is allowed for the given role
    has_perm = action in role_permissions.get(role, [])
    
    # Log the result of permission check
    logger.info(f"Role: {role}, Action: {action}, Has Permission: {has_perm}")
    
    return has_perm

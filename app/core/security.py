from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db
from app.models import Doctor, User  # Assuming User and Doctor models are available
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.future import select

# Secret key for JWT
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour

# OAuth2 scheme for Bearer token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Dependency to extract user from JWT
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode and verify JWT token, and extract user information."""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    role: str = payload.get("role")

    if not email or not role:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Retrieve user from the database using email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def get_current_doctor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Doctor:
    """Retrieve the current doctor from the JWT token."""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    role: str = payload.get("role")

    if not email or role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized to access doctor resources")

    # Retrieve doctor from the database
    doctor = db.query(Doctor).filter(Doctor.email == email).first()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return doctor

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.db.session import database
from app.models.user import User
from bson import ObjectId
import os

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

users_collection = database.get_collection("users")

def hash_password(password: str) -> str:
    """Hash the password before storing."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

async def register_user(user: User):
    """Register a new user (patient, doctor, or admin)."""
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)  # Hash password before storing
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    return user_data

async def authenticate_user(email: str, password: str):
    """Authenticate a user (including doctors) and return a JWT token."""
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT token with user role
    access_token = create_access_token({"sub": user["email"], "role": user["role"], "user_id": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Generate a JWT access token with user role."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get the currently authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
        user = await users_collection.find_one({"email": email})
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

async def get_current_doctor(user: dict = Depends(get_current_user)):
    """Ensure the authenticated user is a doctor."""
    if user["role"] != "doctor":
        raise HTTPException(status_code=403, detail="You are not authorized to access this resource")
    return user

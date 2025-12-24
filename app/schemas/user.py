from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole

    class Config:
        from_attributes = True  # Use this instead of `orm_mode`

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    username: Optional[str]
    email: EmailStr
    password: str
    role: UserRole  # Ensure this matches the UserRole enum
    
class UserResponse(UserBase):
    id: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserSchema(UserBase):  # Renamed to avoid conflict with SQLAlchemy User model
    email: EmailStr
    role: str

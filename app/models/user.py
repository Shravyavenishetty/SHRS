from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    id: Optional[str]  # MongoDB ObjectId (converted to string)
    email: EmailStr
    password: str  # Hashed password
    role: str  # "patient" | "doctor" | "admin"

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword",
                "role": "patient"
            }
        }

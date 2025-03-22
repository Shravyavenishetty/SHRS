from pydantic import BaseModel, EmailStr
from typing import Optional, List

class Doctor(BaseModel):
    id: Optional[str]
    name: str
    email: EmailStr
    password: str  # Added for authentication
    specialization: str
    experience: int
    available_slots: List[str]

    class Config:
        schema_extra = {
            "example": {
                "name": "Dr. Aditi Sharma",
                "email": "aditi.sharma@example.com",
                "password": "securepassword",
                "specialization": "Cardiology",
                "experience": 10,
                "available_slots": ["Monday 10:00 AM", "Wednesday 2:00 PM"]
            }
        }

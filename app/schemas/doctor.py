from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class DoctorBase(BaseModel):
    name: str = Field(..., example="Dr. John Doe")
    specialty: str = Field(..., example="Cardiologist")
    email: EmailStr = Field(..., example="johndoe@example.com")
    contact: str = Field(..., example="9876543210")
    experience: int = Field(..., ge=0, example=10)
    hospital: Optional[str] = Field(None, example="Apollo Hospital")

class DoctorCreate(DoctorBase):
    password: str = Field(..., example="securepassword123")  # Will be hashed

class DoctorUpdate(BaseModel):
    """Schema for updating doctor details (optional fields)."""
    name: Optional[str] = None
    specialty: Optional[str] = None
    email: Optional[EmailStr] = None
    contact: Optional[str] = None
    experience: Optional[int] = None
    hospital: Optional[str] = None
    password: Optional[str] = None  # Allow password change

class DoctorResponse(DoctorBase):
    id: int

    class Config:
        orm_mode = True

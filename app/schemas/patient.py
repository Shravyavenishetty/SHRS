from pydantic import BaseModel, Field, EmailStr
from datetime import date
from typing import Optional

class PatientBase(BaseModel):
    first_name: str = Field(..., example="John")
    last_name: str = Field(..., example="Doe")
    age: int = Field(..., gt=0, example=30)
    gender: str = Field(..., example="Male")
    phone: str = Field(..., example="9876543210")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    address: str = Field(..., example="123 Main St, New York, NY")
    medical_history: Optional[str] = Field(None, example="Diabetes, Hypertension")

class PatientCreate(PatientBase):
    """Schema for creating a new patient."""

class PatientUpdate(BaseModel):
    """Schema for updating a patient - fields are optional."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    date_registered: date

    class Config:
        orm_mode = True

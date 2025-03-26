from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PrescriptionBase(BaseModel):
    patient_id: int = Field(..., example=1)
    doctor_id: int = Field(..., example=2)
    medical_record_id: Optional[int] = Field(None, example=5)
    medicine_name: str = Field(..., example="Paracetamol")
    dosage: str = Field(..., example="500mg, twice a day")
    duration: str = Field(..., example="7 days")
    instructions: Optional[str] = Field(None, example="Take after meals")
    date_prescribed: date = Field(..., example="2025-03-22")

class PrescriptionCreate(PrescriptionBase):
    """Schema for creating a new prescription."""
    pass

class PrescriptionUpdate(BaseModel):
    """Schema for updating prescription details."""
    medicine_name: Optional[str]
    dosage: Optional[str]
    duration: Optional[str]
    instructions: Optional[str]

class PrescriptionResponse(PrescriptionBase):
    """Schema for returning prescription details."""
    id: int

    class Config:
        orm_mode = True

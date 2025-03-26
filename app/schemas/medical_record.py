from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class MedicalRecordBase(BaseModel):
    patient_id: int = Field(..., example=1)
    doctor_id: int = Field(..., example=2)
    diagnosis: str = Field(..., example="Acute Bronchitis")
    treatment: str = Field(..., example="Prescribed antibiotics and rest")
    prescribed_medicines: Optional[str] = Field(None, example="Azithromycin")
    visit_date: date = Field(..., example="2025-03-22")
    notes: Optional[str] = Field(None, example="Follow-up after one week")

class MedicalRecordCreate(MedicalRecordBase):
    """Schema for creating a new medical record."""
    pass

class MedicalRecordUpdate(BaseModel):
    """Schema for updating medical record details."""
    diagnosis: Optional[str]
    treatment: Optional[str]
    prescribed_medicines: Optional[str]
    notes: Optional[str]

class MedicalRecordResponse(MedicalRecordBase):
    """Schema for returning medical record details."""
    id: int

    class Config:
        orm_mode = True

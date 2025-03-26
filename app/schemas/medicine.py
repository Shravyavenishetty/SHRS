from pydantic import BaseModel, Field
from typing import Optional

class MedicineBase(BaseModel):
    name: str = Field(..., example="Paracetamol")
    description: Optional[str] = Field(None, example="Used for fever and pain relief")
    manufacturer: str = Field(..., example="Cipla")
    price: float = Field(..., example=25.50)
    stock: int = Field(..., example=100)
    expiry_date: str = Field(..., example="2026-05-10")

class MedicineCreate(MedicineBase):
    """Schema for creating a new medicine."""
    pass

class MedicineUpdate(BaseModel):
    """Schema for updating medicine details."""
    description: Optional[str]
    price: Optional[float]
    stock: Optional[int]
    expiry_date: Optional[str]

class MedicineResponse(MedicineBase):
    """Schema for returning medicine details."""
    id: int

    class Config:
        orm_mode = True

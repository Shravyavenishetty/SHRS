from pydantic import BaseModel
from typing import Optional
from bson import ObjectId
from datetime import date
from pydantic import Field

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid Object ID")
        return str(v)
    
class Patient(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=date.today)
    first_name: str
    last_name: str
    age: int
    gender: str
    phone: str
    email: Optional[str]=None
    address:str
    medical_history: Optional[str]=None
    date_registered : date=Field(default_factory=date.today)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "_id": "605c72b0f9a3b2e6a0a8d5c7",
                "first_name": "John",
                "last_name": "Doe",
                "age": 30,
                "gender": "Male",
                "phone": "+91-9876543210",
                "email": "john.doe@example.com",
                "address": "123, Hyderabad, India",
                "medical_history": "Diabetes, Hypertension",
                "date_registered": "2025-03-22",
            }
        }
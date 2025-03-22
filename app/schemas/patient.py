from pydantic import BaseModel
from typing import Optional


class PatientBase(BaseModel):
    name:str
    age:int
    gender:str
    contact:str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(PatientBase):
    pass

class PatientDB(PatientBase):
    id: Optional[str]
    class Config:
        orm_mode = True

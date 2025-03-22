from fastapi import APIRouter,HTTPException,Depends
from app.schemas.patient import PatientCreate,PatientDB
from typing import List
from app.services.patient_service import create_patient,get_patients,get_patient_by_id,update_patient,delete_patient
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from jose import JWTError,jwt
from app.core.security import SECRET_KEY,ALGORITHM

router=APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Extract user details from the token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/",response_model=PatientDB)
async def create_patient(patient:PatientCreate,current_user: dict = Depends(get_current_user)):
    return await create_patient(patient)

@router.get("/",response_model=List[PatientDB])
async def get_patients(current_user: dict = Depends(get_current_user)):
    return await get_patients()

@router.get("/{patient_id}",response_model=PatientDB)
async def get_patient(patient_id:str,current_user: dict = Depends(get_current_user)):
    return await get_patient_by_id(patient_id)

@router.put("/{patient_id}",response_model=PatientDB)
async def update_patient(patient_id:str,patient:PatientCreate,current_user: dict = Depends(get_current_user)):
    updated_patient = await update_patient(patient_id,patient_data)
    if not updated_patient:
        raise HTTPException(status_code=404,detail="Patient not found")
    return updated_patient

@router.delete("/{patient_id}")
async def delete_patient(patient_id:str,current_user: dict = Depends(get_current_user)):
    deleted = await delete_patient(patient_id)
    if not deleted:
        raise HTTPException(status_code=404,detail="Patient not found")
    return {"message":"Patient deleted successfully"}

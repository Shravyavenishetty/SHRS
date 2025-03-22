from app.db.session import database
from app.schemas.patient import PatientCreate,PatientDB
from bson import ObjectId

async def create_patient(patient:PatientCreate) -> PatientDB:
    patient_dict = patient.dict()
    result=await database.patients.insert_one(patient_dict) 
    patient_dict['id'] = str(result.inserted_id)
    return PatientDB(**patient_dict)

async def get_patients():
    patients = await database.patients.find().to_list(100)
    return [PatientDB(id=str(p["_id"]), **p) for p in patients]

async def get_patient_by_id(patient_id:str):
    patient = await database.patients.find_one({"_id":ObjectId(patient_id)})
    if patient:
        return PatientDB(id=str(patient["_id"]), **patient)
    return None

async def update_patient(patient_id:str,patient_data:PatientCreate):
    update_result = await database.patients.update_one({"_id":ObjectId(patient_id)}, {"$set": patient_data.dict()})
    if update_result.modified_count == 1:
        return await get_patient_by_id(patient_id)
    return None

async def delete_patient(patient_id:str)->bool:
    delete_result = await database.patients.delete_one({"_id":ObjectId(patient_id)})
    return delete_result.deleted_count == 1 
        



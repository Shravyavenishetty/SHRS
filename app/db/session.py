from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
database = client[settings.DATABASE_NAME]
patients_collection = database.get_collection("patients")
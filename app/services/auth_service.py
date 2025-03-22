from app.db.session import database
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException

users_collection = database.get_collection("users")

async def register_user(user: User):
    """Register a new user (patient, doctor, or admin)."""
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)  # Hash password before storing
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    return user_data

async def authenticate_user(email: str, password: str):
    """Authenticate a user and return a JWT token."""
    user = await users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}

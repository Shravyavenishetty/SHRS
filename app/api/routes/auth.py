from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.services.auth_service import register_user, authenticate_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register")
async def register(user: User):
    """Register a new user."""
    return await register_user(user)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get JWT token."""
    return await authenticate_user(form_data.username, form_data.password)

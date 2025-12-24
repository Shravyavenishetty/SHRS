from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/protected-endpoint")
def protected_endpoint(current_user: User = Depends(get_current_user)):
    """Example protected endpoint."""
    return {"message": f"Hello, {current_user.username}! You are authorized."}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.core.permissions import has_permission
from app.schemas.user import UserSchema
from typing import List

router = APIRouter()

@router.get("/users", response_model=List[dict])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users with their role information. Only admins can access this."""
    
    # Check if user has permission
    if not has_permission(current_user.role.name, "view_all_users"):
        raise HTTPException(status_code=403, detail="Not authorized to view users")
    
    # Query users with role relationship eagerly loaded
    users = db.query(User).options(joinedload(User.role)).all()
    
    # Format response to include role information
    users_response = []
    for user in users:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "role": {
                "id": user.role.id if user.role else None,
                "name": user.role.name if user.role else None
            } if user.role else None
        }
        users_response.append(user_dict)
    
    return users_response

@router.get("/users/{user_id}", response_model=dict)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific user by ID with role information."""
    
    # Check if user has permission or is requesting their own data
    if current_user.id != user_id and not has_permission(current_user.role.name, "view_all_users"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "role": {
            "id": user.role.id if user.role else None,
            "name": user.role.name if user.role else None
        } if user.role else None
    }

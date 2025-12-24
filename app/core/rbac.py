from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.permission import Permission

def check_permission(user: User, required_permission: str):
    if not user or not user.role:
        raise HTTPException(status_code=403, detail="Access Denied: No role assigned")

    user_permissions = [perm.action for perm in user.role.permissions]
    
    if required_permission not in user_permissions:
        raise HTTPException(status_code=403, detail=f"Access Denied: Missing {required_permission} permission")

    return True

def get_current_user_permissions(user: User):
    if not user or not user.role:
        return []
    return [perm.action for perm in user.role.permissions]

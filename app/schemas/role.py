from pydantic import BaseModel
from typing import List

class PermissionBase(BaseModel):
    action: str

class PermissionCreate(PermissionBase):
    pass

class Permission(PermissionBase):
    id: int
    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    permissions: List[str]  # List of permissions for this role

class Role(RoleBase):
    id: int
    permissions: List[Permission]
    class Config:
        from_attributes = True

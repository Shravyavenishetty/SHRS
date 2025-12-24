import logging
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_access_token  # Import the function
from app.db.session import get_db
from app.models.user import User  # Assuming User model includes roles
from dotenv import load_dotenv
from app.core.config import settings

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Security(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode and verify JWT token, and extract user information."""
    payload = decode_access_token(token)
    logger.info(f"Token payload: {payload}")  # Log the token payload
    email: str = payload.get("sub")
    role: str = payload.get("role")

    if not email or not role:
        logger.error("Invalid token: missing email or role")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        logger.error(f"User not found: {email}")
        raise HTTPException(status_code=404, detail="User not found")

    return user

def check_role(allowed_roles: list):
    """Dependency to enforce role-based access control."""
    def role_dependency(user: User = Depends(get_current_user)):
        if user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return user
    return role_dependency

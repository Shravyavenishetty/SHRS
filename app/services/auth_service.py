from sqlalchemy.orm import Session
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.user import User
from app.models.doctor import Doctor
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.user import UserLogin, UserCreate, UserRole
from app.core.security import verify_password, create_access_token, hash_password, decode_access_token
from app.core.permissions import has_permission  # Import the function
import logging

logger = logging.getLogger(__name__)

# Helper function to get a user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Helper function to get a doctor by email
def get_doctor_by_email(db: Session, email: str):
    return db.query(Doctor).filter(Doctor.email == email).first()

# Function to authenticate a user
def authenticate_user(db: Session, login_data: UserLogin):
    """Authenticate a user using email and password."""
    logger.info(f"Authenticating user with email: {login_data.email[:3]}***")
    user = get_user_by_email(db, login_data.email)

    if not user or not verify_password(login_data.password, user.hashed_password):
        logger.error("Authentication failed for user")
        return None

    if not user.is_active:
        logger.error("User is inactive")
        raise HTTPException(status_code=403, detail="User is inactive")

    logger.info("User authenticated successfully")
    return {"type": "user", "data": user}

# Function to authenticate a doctor
def authenticate_doctor(db: Session, login_data: UserLogin):
    """Authenticate a doctor using email and password."""
    logger.info(f"Authenticating doctor with email: {login_data.email[:3]}***")
    doctor = get_doctor_by_email(db, login_data.email)

    if not doctor or not verify_password(login_data.password, doctor.hashed_password):
        logger.error("Authentication failed for doctor")
        return None

    if not doctor.is_active:
        logger.error("Doctor is inactive")
        raise HTTPException(status_code=403, detail="Doctor is inactive")

    logger.info("Doctor authenticated successfully")
    return {"type": "doctor", "data": doctor}

# Function to handle user login
def login_user(db: Session, login_data: UserLogin):
    """Login a user or doctor and return an access token."""
    logger.info("Logging in user or doctor")

    # Try authenticating as a user
    user_or_doctor = authenticate_user(db, login_data)
    
    # If user authentication fails, try authenticating as a doctor
    if not user_or_doctor:
        user_or_doctor = authenticate_doctor(db, login_data)

    if not user_or_doctor:
        logger.error("Invalid email or password")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = user_or_doctor["data"]
    access_token = create_access_token(data={"sub": user.email, "role": user.role.name})
    logger.info(f"Access token created for: {user.email}")

    return {"access_token": access_token, "token_type": "bearer"}

# Function to register a new user
def register_user(db: Session, register_data: UserCreate):
    """Register a new user or doctor."""
    logger.info(f"Registering user: {register_data.email}")

    # Check if the email already exists
    existing_user = db.query(User).filter(User.email == register_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(register_data.password)

    # Fetch the Role object
    role_obj = db.query(Role).filter(Role.name == register_data.role).first()
    if not role_obj:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Create the new user
    new_user = User(
        username=register_data.username,
        email=register_data.email,
        hashed_password=hashed_password,
        role=role_obj,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"User registered successfully: {new_user.email}")
    return {"message": "User registered successfully", "user": new_user}

# Function to delete a user or doctor
def delete_user_or_doctor(db: Session, email: str):
    """Delete a user or doctor by email."""
    logger.info(f"Deleting user or doctor with email: {email}")

    entity = get_user_by_email(db, email) or get_doctor_by_email(db, email)
    
    if entity:
        db.delete(entity)
        db.commit()
        logger.info(f"{entity.__class__.__name__} with email {email} deleted successfully")
        return {"message": f"{entity.__class__.__name__} with email {email} deleted successfully"}
    
    logger.error(f"User or doctor with email {email} not found")
    raise HTTPException(status_code=404, detail="User or doctor not found")

# Function to create a new role and assign permissions
def create_role(db: Session, name: str, permissions: list):
    """Create a new role and assign permissions."""
    logger.info(f"Creating role: {name}")

    role = Role(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)

    for perm_action in permissions:
        permission = Permission(action=perm_action, role_id=role.id)
        db.add(permission)

    db.commit()
    logger.info(f"Role '{name}' created successfully with permissions: {permissions}")
    return role

# Function to assign a role to a user
def assign_role_to_user(db: Session, user: User, role_name: str):
    """Assign a role to a user."""
    logger.info(f"Assigning role '{role_name}' to user '{user.email}'")

    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        logger.error(f"Role '{role_name}' not found")
        raise HTTPException(status_code=404, detail="Role not found")

    user.role_id = role.id
    db.commit()
    db.refresh(user)

    logger.info(f"Role '{role_name}' assigned to user '{user.email}' successfully")
    return user

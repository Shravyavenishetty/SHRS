import logging

# Initialize the logger
logger = logging.getLogger(__name__)

def has_permission(role: str, action: str) -> bool:
    """Check if a role has permission for a given action."""
    
    # Log the actual role received
    logger.info(f"Checking permissions for Role: {role}, Action: {action}")
    
    # Ensure role is a string (avoiding object reference issues)
    if not isinstance(role, str):
        role = getattr(role, "name", None)  # Extract 'name' if role is an object
    
    if role == "admin":
        logger.info(f"Admin role bypassing permission check for action: {action}")
        return True

    role_permissions = {
        "doctor": [
            # Patient management
            "view_patients", "view_all_patients", "edit_patient", "create_patient",
            # Appointments
            "view_appointments", "create_appointment", "edit_appointment",
            # Medical records
            "view_medical_records", "create_medical_record", "edit_medical_record",
            # Prescriptions
            "view_prescriptions", "create_prescription", "edit_prescription",
            # Medicines (view only)
            "view_medicines",
        ],
        "patient": [
            # Self management
            "view_self", "edit_self",
            # Appointments (own)
            "view_appointments", "create_appointment",
            # Medical records (own, view only)
            "view_medical_records",
            # Prescriptions (own, view only)
            "view_prescriptions",
        ],
    }
    
    has_perm = action in role_permissions.get(role, [])
    logger.info(f"Role: {role}, Action: {action}, Has Permission: {has_perm}")
    
    return has_perm

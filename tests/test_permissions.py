from app.core.security import has_permission

def test_has_permission():
    assert has_permission("admin", "create_patient") == True
    assert has_permission("doctor", "create_patient") == True
    assert has_permission("patient", "create_patient") == False
    assert has_permission("admin", "delete_patient") == True
    assert has_permission("doctor", "delete_patient") == False

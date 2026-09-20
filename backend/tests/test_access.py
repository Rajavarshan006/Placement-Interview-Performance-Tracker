from datetime import date

from app.enums import AccessStatus
from app.models import Student, Coordinator, Drive, StudentDriveRegistration
from app.models.student_access import StudentAccess


def _seed_placed_student(db):
    coordinator = Coordinator(
        coordinator_id="coord-1", name="Test Coord", email="coord@test.com", department="CSE"
    )
    db.add(coordinator)

    student = Student(
        student_id="stu-1",
        name="Test Student",
        register_number="2021CS001",
        email="student@test.com",
        department="CSE",
        cgpa=8.5,
        tenth_percentage=90.0,
        twelfth_percentage=85.0,
    )
    db.add(student)

    drive = Drive(
        drive_id="drive-1",
        company_name="Zoho",
        company_type="PRODUCT",
        role_title="SDE",
        package_lpa=8.0,
        drive_date=date(2026, 9, 15),
        required_cgpa=7.0,
        required_tenth=60.0,
        required_twelfth=60.0,
        total_rounds=3,
        coordinator_id="coord-1",
    )
    db.add(drive)

    reg = StudentDriveRegistration(
        registration_id="reg-1",
        student_id="stu-1",
        drive_id="drive-1",
        final_status="SELECTED",
        rounds_cleared=3,
    )
    db.add(reg)
    db.commit()


def test_get_placed_students(client, db):
    _seed_placed_student(db)
    resp = client.get("/api/access/placed-students")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["student_id"] == "stu-1"
    assert data[0]["placed_company"] == "Zoho"
    assert data[0]["access"]["status"] == "NO_ACCESS"


def test_give_access_success(client, db):
    _seed_placed_student(db)
    resp = client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["message"] == "Invitation sent successfully"

    access = db.query(StudentAccess).filter(StudentAccess.student_id == "stu-1").first()
    assert access is not None
    assert access.status == AccessStatus.INVITED


def test_give_access_already_invited(client, db):
    _seed_placed_student(db)
    client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    resp = client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    data = resp.json()
    assert data["success"] is False
    assert "Cannot give access" in data["message"]


def test_remove_access_from_active(client, db):
    _seed_placed_student(db)
    client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    client.post("/api/access/activate/stu-1")

    resp = client.post("/api/access/remove-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    data = resp.json()
    assert data["success"] is True
    assert data["message"] == "Access removed successfully"

    access = db.query(StudentAccess).filter(StudentAccess.student_id == "stu-1").first()
    assert access.status == AccessStatus.REVOKED


def test_remove_access_not_active(client, db):
    _seed_placed_student(db)
    resp = client.post("/api/access/remove-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    data = resp.json()
    assert data["success"] is False


def test_activate_access(client, db):
    _seed_placed_student(db)
    client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1",
        "student_id": "stu-1",
    })
    resp = client.post("/api/access/activate/stu-1")
    data = resp.json()
    assert data["success"] is True

    access = db.query(StudentAccess).filter(StudentAccess.student_id == "stu-1").first()
    assert access.status == AccessStatus.ACTIVE


def test_full_lifecycle(client, db):
    """NO_ACCESS -> INVITED -> ACTIVE -> REVOKED -> INVITED again"""
    _seed_placed_student(db)

    resp = client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1", "student_id": "stu-1",
    })
    assert resp.json()["success"] is True

    resp = client.post("/api/access/activate/stu-1")
    assert resp.json()["success"] is True

    resp = client.post("/api/access/remove-access", json={
        "coordinator_id": "coord-1", "student_id": "stu-1",
    })
    assert resp.json()["success"] is True

    resp = client.post("/api/access/give-access", json={
        "coordinator_id": "coord-1", "student_id": "stu-1",
    })
    assert resp.json()["success"] is True

    access = db.query(StudentAccess).filter(StudentAccess.student_id == "stu-1").first()
    assert access.status == AccessStatus.INVITED
    assert len(access.history) == 4

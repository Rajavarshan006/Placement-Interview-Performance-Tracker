from datetime import date

from app.models import Student, Coordinator, Drive, Round, RoundResult, StudentDriveRegistration


def _seed_student_data(db):
    coordinator = Coordinator(
        coordinator_id="coord-1", name="Test Coord", email="coord@test.com", department="CSE"
    )
    db.add(coordinator)

    student = Student(
        student_id="stu-1",
        name="Sneha Gupta",
        register_number="2021CS001",
        email="sneha@test.com",
        department="CSE",
        cgpa=8.5,
        tenth_percentage=90.0,
        twelfth_percentage=85.0,
    )
    db.add(student)

    drive1 = Drive(
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
    db.add(drive1)

    drive2 = Drive(
        drive_id="drive-2",
        company_name="TCS",
        company_type="SERVICE",
        role_title="System Engineer",
        package_lpa=4.0,
        drive_date=date(2026, 10, 1),
        required_cgpa=6.0,
        required_tenth=60.0,
        required_twelfth=60.0,
        total_rounds=2,
        coordinator_id="coord-1",
    )
    db.add(drive2)

    round1 = Round(
        round_id="r1", drive_id="drive-1", round_type="APTITUDE",
        round_number=1, round_name="Aptitude Test",
    )
    round2 = Round(
        round_id="r2", drive_id="drive-1", round_type="CODING",
        round_number=2, round_name="Coding Round",
    )
    db.add_all([round1, round2])

    result1 = RoundResult(
        result_id="res-1", student_id="stu-1", round_id="r1", drive_id="drive-1",
        result="PASSED", score=80, max_score=100, attempt_date=date(2026, 9, 15),
    )
    result2 = RoundResult(
        result_id="res-2", student_id="stu-1", round_id="r2", drive_id="drive-1",
        result="FAILED", score=30, max_score=100,
        rejection_reason="Low score", weakness_area="Data Structures",
        attempt_date=date(2026, 9, 15),
    )
    db.add_all([result1, result2])

    reg1 = StudentDriveRegistration(
        registration_id="reg-1", student_id="stu-1", drive_id="drive-1",
        final_status="REJECTED", rounds_cleared=1,
    )
    db.add(reg1)
    db.commit()


def test_get_student_profile(client, db):
    _seed_student_data(db)
    resp = client.get("/api/student/stu-1/profile")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Sneha Gupta"
    assert data["cgpa"] == 8.5


def test_get_student_profile_not_found(client, db):
    resp = client.get("/api/student/nonexistent/profile")
    assert resp.status_code == 404


def test_view_round_status(client, db):
    _seed_student_data(db)
    resp = client.get("/api/student/stu-1/round-status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["student_id"] == "stu-1"
    assert data["total_drives"] == 1
    assert len(data["rounds"]) == 2
    assert data["rounds"][0]["round_name"] == "Aptitude Test"
    assert data["rounds"][0]["result"] == "PASSED"
    assert data["rounds"][1]["round_name"] == "Coding Round"
    assert data["rounds"][1]["result"] == "FAILED"


def test_view_job_applications(client, db):
    _seed_student_data(db)
    resp = client.get("/api/student/stu-1/job-applications")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_applications"] == 1
    assert data["applications"][0]["company_name"] == "Zoho"
    assert data["applications"][0]["final_status"] == "REJECTED"
    assert data["applications"][0]["rounds_cleared"] == 1


def test_apply_job_application_success(client, db):
    _seed_student_data(db)
    resp = client.post("/api/student/stu-1/apply", json={
        "student_id": "stu-1",
        "drive_id": "drive-2",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["registration_id"] is not None


def test_apply_job_already_applied(client, db):
    _seed_student_data(db)
    resp = client.post("/api/student/stu-1/apply", json={
        "student_id": "stu-1",
        "drive_id": "drive-1",
    })
    data = resp.json()
    assert data["success"] is False
    assert "Already applied" in data["message"]


def test_apply_job_cgpa_too_low(client, db):
    _seed_student_data(db)
    low_cgpa_student = Student(
        student_id="stu-2", name="Low CGPA", register_number="2021CS002",
        email="low@test.com", department="CSE", cgpa=3.0,
        tenth_percentage=90.0, twelfth_percentage=85.0,
    )
    db.add(low_cgpa_student)
    db.commit()

    resp = client.post("/api/student/stu-2/apply", json={
        "student_id": "stu-2",
        "drive_id": "drive-1",
    })
    data = resp.json()
    assert data["success"] is False
    assert "CGPA" in data["message"]


def test_view_analysis(client, db):
    _seed_student_data(db)
    resp = client.get("/api/student/stu-1/analysis")
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary"]["total_rounds_attempted"] == 2
    assert data["summary"]["rounds_passed"] == 1
    assert data["summary"]["rounds_failed"] == 1
    assert data["failure_analysis"]["most_failed_round"] == "CODING"
    assert data["risk_level"] == "low"


def test_view_analysis_not_found(client, db):
    resp = client.get("/api/student/nonexistent/analysis")
    assert resp.status_code == 404

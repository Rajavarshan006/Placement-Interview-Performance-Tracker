import uuid
from datetime import date

from app.enums import CompanyType, DriveStatus, Result, RoundType
from app.models import (
    Coordinator, Drive, Round, RoundResult, Student,
    StudentDriveRegistration,
)
from app.services.pattern_analyzer import analyze_student_patterns, get_at_risk_students


def _id():
    return str(uuid.uuid4())


def _seed_rahul_scenario(db):
    """Rahul fails CODING 3 times across 3 drives."""
    coord = Coordinator(coordinator_id=_id(), name="Admin", email="admin@c.edu")
    db.add(coord)

    student = Student(
        student_id=_id(), name="Rahul Sharma", register_number="2021CS101",
        email="rahul@c.edu", department="CSE", cgpa=7.8,
        tenth_percentage=89.5, twelfth_percentage=85.2,
        placement_marks=72.0, skills=["Python", "SQL"],
    )
    db.add(student)
    db.flush()

    drives_data = [
        ("TCS", CompanyType.SERVICE, 7.5, date(2026, 7, 15)),
        ("Infosys", CompanyType.SERVICE, 5.0, date(2026, 8, 1)),
        ("Zoho", CompanyType.PRODUCT, 8.0, date(2026, 8, 20)),
    ]
    drives = []
    for name, ctype, pkg, dt in drives_data:
        d = Drive(
            drive_id=_id(), company_name=name, company_type=ctype,
            role_title="SDE", package_lpa=pkg, drive_date=dt,
            required_cgpa=7.0, required_tenth=60.0, required_twelfth=60.0,
            total_rounds=4, drive_status=DriveStatus.COMPLETED,
            coordinator_id=coord.coordinator_id,
        )
        db.add(d)
        drives.append(d)
    db.flush()

    for i, d in enumerate(drives):
        apt_round = Round(
            round_id=_id(), drive_id=d.drive_id, round_type=RoundType.APTITUDE,
            round_number=1, round_name="Aptitude", total_appeared=80, total_passed=40,
        )
        code_round = Round(
            round_id=_id(), drive_id=d.drive_id, round_type=RoundType.CODING,
            round_number=2, round_name="Coding", total_appeared=40, total_passed=15,
        )
        db.add_all([apt_round, code_round])
        db.flush()

        db.add(RoundResult(
            result_id=_id(), student_id=student.student_id,
            round_id=apt_round.round_id, drive_id=d.drive_id,
            result=Result.PASSED, score=75 + i * 3, max_score=100,
            attempt_date=d.drive_date,
        ))
        db.add(RoundResult(
            result_id=_id(), student_id=student.student_id,
            round_id=code_round.round_id, drive_id=d.drive_id,
            result=Result.FAILED, score=30 + i * 5, max_score=100,
            rejection_reason="DP problem failed",
            weakness_area="Dynamic Programming",
            attempt_date=d.drive_date,
        ))
        db.add(StudentDriveRegistration(
            registration_id=_id(), student_id=student.student_id,
            drive_id=d.drive_id, final_status="REJECTED", rounds_cleared=1,
        ))

    db.commit()
    return student


def test_analyze_finds_bottleneck_round(db):
    student = _seed_rahul_scenario(db)
    result = analyze_student_patterns(db, student.student_id)

    assert result["total_drives_attempted"] == 3
    assert result["total_drives_cleared"] == 0
    assert "CODING" in result["failure_by_round_type"]
    assert result["failure_by_round_type"]["CODING"]["count"] == 3
    assert result["biggest_bottleneck"] == "CODING"


def test_analyze_finds_weakness_areas(db):
    student = _seed_rahul_scenario(db)
    result = analyze_student_patterns(db, student.student_id)

    assert "Dynamic Programming" in result["weakness_areas"]
    assert result["weakness_areas"]["Dynamic Programming"] >= 3


def test_analyze_detects_score_trend(db):
    student = _seed_rahul_scenario(db)
    result = analyze_student_patterns(db, student.student_id)

    assert len(result["score_trend"]) == 3
    assert result["score_trend"] == [30.0, 35.0, 40.0]
    assert result["failure_trend"] == "IMPROVING"


def test_analyze_identifies_strengths(db):
    student = _seed_rahul_scenario(db)
    result = analyze_student_patterns(db, student.student_id)

    assert "APTITUDE" in result["always_clears"]


def test_at_risk_students_returns_failing_students(db):
    student = _seed_rahul_scenario(db)
    at_risk = get_at_risk_students(db, min_failures=2)

    assert len(at_risk) >= 1
    ids = [s["student_id"] for s in at_risk]
    assert student.student_id in ids


def test_at_risk_excludes_selected_students(db):
    """A student with only SELECTED registrations should not be at-risk."""
    coord = Coordinator(coordinator_id=_id(), name="A2", email="a2@c.edu")
    db.add(coord)
    good_student = Student(
        student_id=_id(), name="Sneha", register_number="2021CS200",
        email="sneha@c.edu", department="CSE", cgpa=9.0,
        tenth_percentage=95.0, twelfth_percentage=93.0,
    )
    db.add(good_student)
    d = Drive(
        drive_id=_id(), company_name="Google", company_type=CompanyType.PRODUCT,
        role_title="SDE", package_lpa=25.0, drive_date=date(2026, 9, 1),
        required_cgpa=8.0, required_tenth=80.0, required_twelfth=80.0,
        total_rounds=3, drive_status=DriveStatus.COMPLETED,
        coordinator_id=coord.coordinator_id,
    )
    db.add(d)
    db.flush()
    db.add(StudentDriveRegistration(
        registration_id=_id(), student_id=good_student.student_id,
        drive_id=d.drive_id, final_status="SELECTED", rounds_cleared=3,
    ))
    db.commit()

    at_risk = get_at_risk_students(db, min_failures=2)
    ids = [s["student_id"] for s in at_risk]
    assert good_student.student_id not in ids

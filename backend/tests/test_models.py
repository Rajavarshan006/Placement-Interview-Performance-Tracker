import uuid
from datetime import date, datetime

from app.models.student import Student
from app.models.coordinator import Coordinator
from app.models.mentor import Mentor
from app.models.drive import Drive
from app.models.round import Round
from app.models.round_result import RoundResult
from app.models.student_drive_registration import StudentDriveRegistration
from app.models.intervention import Intervention
from app.models.intervention_action import InterventionAction
from app.enums import (
    CompanyType, DriveStatus, RoundType, Result, Priority, InterventionStatus,
)


def _id():
    return str(uuid.uuid4())


def test_create_student(db):
    s = Student(
        student_id=_id(),
        name="Rahul Sharma",
        register_number="2021CS101",
        email="rahul@college.edu",
        department="CSE",
        cgpa=7.8,
        tenth_percentage=89.5,
        twelfth_percentage=85.2,
        placement_marks=72.0,
        skills=["Python", "SQL"],
    )
    db.add(s)
    db.commit()
    assert db.query(Student).count() == 1
    assert db.query(Student).first().name == "Rahul Sharma"


def test_create_coordinator(db):
    c = Coordinator(
        coordinator_id=_id(),
        name="Dr. Priya Kumar",
        email="priya@college.edu",
        department="CSE",
    )
    db.add(c)
    db.commit()
    assert db.query(Coordinator).first().name == "Dr. Priya Kumar"


def test_create_mentor(db):
    m = Mentor(
        mentor_id=_id(),
        name="Prof. Arun Raj",
        email="arun@college.edu",
        department="CSE",
        specialization="Data Structures & Algorithms",
        max_mentees=10,
        current_mentee_count=4,
    )
    db.add(m)
    db.commit()
    assert db.query(Mentor).first().specialization == "Data Structures & Algorithms"


def test_create_drive_with_rounds(db):
    cid = _id()
    db.add(Coordinator(coordinator_id=cid, name="Admin", email="a@c.edu"))
    did = _id()
    db.add(Drive(
        drive_id=did,
        company_name="TCS",
        company_type=CompanyType.SERVICE,
        role_title="Software Developer",
        package_lpa=7.5,
        drive_date=date(2026, 8, 15),
        required_cgpa=7.0,
        required_tenth=60.0,
        required_twelfth=60.0,
        total_rounds=4,
        drive_status=DriveStatus.COMPLETED,
        coordinator_id=cid,
    ))
    db.add(Round(
        round_id=_id(),
        drive_id=did,
        round_type=RoundType.APTITUDE,
        round_number=1,
        round_name="Online Aptitude Test",
        total_appeared=85,
        total_passed=40,
    ))
    db.commit()
    assert db.query(Round).first().drive_id == did


def test_create_round_result(db):
    sid = _id()
    rid = _id()
    did = _id()
    cid = _id()
    db.add(Coordinator(coordinator_id=cid, name="Admin", email="a@c.edu"))
    db.add(Student(
        student_id=sid, name="Test", register_number="T001",
        email="t@c.edu", department="CSE", cgpa=8.0,
        tenth_percentage=90.0, twelfth_percentage=85.0,
    ))
    db.add(Drive(
        drive_id=did, company_name="TCS", company_type=CompanyType.SERVICE,
        role_title="SDE", package_lpa=7.5, drive_date=date(2026, 8, 15),
        required_cgpa=7.0, required_tenth=60.0, required_twelfth=60.0,
        total_rounds=4, drive_status=DriveStatus.COMPLETED,
        coordinator_id=cid,
    ))
    db.add(Round(
        round_id=rid, drive_id=did, round_type=RoundType.CODING,
        round_number=2, round_name="Coding Test",
        total_appeared=40, total_passed=12,
    ))
    db.add(RoundResult(
        result_id=_id(), student_id=sid, round_id=rid, drive_id=did,
        result=Result.FAILED, score=30.0, max_score=100.0,
        rejection_reason="Could not solve DP problem",
        feedback="Good approach to Q1, TLE on Q2",
        weakness_area="Dynamic Programming",
        attempt_date=date(2026, 8, 15),
    ))
    db.commit()
    rr = db.query(RoundResult).first()
    assert rr.result == Result.FAILED
    assert rr.weakness_area == "Dynamic Programming"


def test_create_intervention_with_actions(db):
    sid = _id()
    cid = _id()
    db.add(Student(
        student_id=sid, name="Test", register_number="T002",
        email="t2@c.edu", department="CSE", cgpa=7.0,
        tenth_percentage=80.0, twelfth_percentage=75.0,
    ))
    db.add(Coordinator(coordinator_id=cid, name="Admin", email="a2@c.edu"))
    db.commit()

    intv_id = _id()
    db.add(Intervention(
        intervention_id=intv_id,
        student_id=sid,
        coordinator_id=cid,
        trigger_reason="Failed coding round 3 times",
        failure_summary={"total_drives_attempted": 4, "biggest_bottleneck": "CODING"},
        ai_analysis="Student consistently fails at coding rounds...",
        recommendations=[{"title": "Practice DP", "action_type": "Practice Set"}],
        priority=Priority.HIGH,
        status=InterventionStatus.GENERATED,
    ))
    db.commit()

    db.add(InterventionAction(
        action_id=_id(),
        intervention_id=intv_id,
        action_type="Practice Set",
        title="Complete 30 DP problems",
        description="Focus on medium-difficulty DP problems",
        target_weakness="Dynamic Programming",
        resources=["https://leetcode.com/tag/dynamic-programming"],
    ))
    db.commit()

    intv = db.query(Intervention).first()
    assert intv.priority == Priority.HIGH
    assert len(intv.actions) == 1
    assert intv.actions[0].title == "Complete 30 DP problems"

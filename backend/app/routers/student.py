import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Student,
    Drive,
    Round,
    RoundResult,
    StudentDriveRegistration,
)
from app.schemas.student import (
    ApplyJobRequest,
    ApplyJobResponse,
    JobApplicationOut,
    ResumeUploadResponse,
    RoundStatusOut,
    StudentProfileOut,
    ViewJobApplicationsResponse,
    ViewRoundStatusResponse,
)

router = APIRouter(prefix="/api/student", tags=["student"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "resumes")


@router.get("/{student_id}/profile", response_model=StudentProfileOut)
def get_student_profile(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/{student_id}/round-status", response_model=ViewRoundStatusResponse)
def view_round_status(student_id: str, db: Session = Depends(get_db)):
    """viewRoundStatus() — Student views their round-by-round results across all drives."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    results = (
        db.query(RoundResult)
        .filter(RoundResult.student_id == student_id)
        .all()
    )

    drive_ids = set()
    rounds = []
    for r in results:
        drive_ids.add(r.drive_id)
        round_obj = db.query(Round).filter(Round.round_id == r.round_id).first()
        drive_obj = db.query(Drive).filter(Drive.drive_id == r.drive_id).first()
        if not round_obj or not drive_obj:
            continue

        rounds.append(RoundStatusOut(
            drive_id=r.drive_id,
            company_name=drive_obj.company_name,
            role_title=drive_obj.role_title,
            round_number=round_obj.round_number,
            round_name=round_obj.round_name,
            round_type=round_obj.round_type.value,
            result=r.result.value,
            score=r.score,
            max_score=r.max_score,
            rejection_reason=r.rejection_reason,
            feedback=r.feedback,
            attempt_date=r.attempt_date,
        ))

    rounds.sort(key=lambda x: (x.drive_id, x.round_number))

    return ViewRoundStatusResponse(
        student_id=student_id,
        name=student.name,
        total_drives=len(drive_ids),
        rounds=rounds,
    )


@router.get("/{student_id}/job-applications", response_model=ViewJobApplicationsResponse)
def view_job_applications(student_id: str, db: Session = Depends(get_db)):
    """viewJobApplication() — Student views all drives they registered for."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    registrations = (
        db.query(StudentDriveRegistration)
        .filter(StudentDriveRegistration.student_id == student_id)
        .all()
    )

    applications = []
    for reg in registrations:
        drive = db.query(Drive).filter(Drive.drive_id == reg.drive_id).first()
        if not drive:
            continue

        applications.append(JobApplicationOut(
            registration_id=reg.registration_id,
            drive_id=reg.drive_id,
            company_name=drive.company_name,
            company_type=drive.company_type.value,
            role_title=drive.role_title,
            package_lpa=drive.package_lpa,
            drive_date=drive.drive_date,
            drive_status=drive.drive_status.value,
            final_status=reg.final_status,
            rounds_cleared=reg.rounds_cleared,
            total_rounds=drive.total_rounds,
            registered_at=reg.registered_at,
        ))

    return ViewJobApplicationsResponse(
        student_id=student_id,
        name=student.name,
        total_applications=len(applications),
        applications=applications,
    )


@router.post("/{student_id}/apply", response_model=ApplyJobResponse)
def apply_job_application(student_id: str, body: ApplyJobRequest, db: Session = Depends(get_db)):
    """applyJobApplication() — Student applies to a placement drive."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return ApplyJobResponse(success=False, message="Student not found")

    drive = db.query(Drive).filter(Drive.drive_id == body.drive_id).first()
    if not drive:
        return ApplyJobResponse(success=False, message="Drive not found")

    if drive.drive_status.value != "UPCOMING" and drive.drive_status.value != "ONGOING":
        return ApplyJobResponse(success=False, message="Drive is not open for applications")

    if student.cgpa < drive.required_cgpa:
        return ApplyJobResponse(success=False, message=f"CGPA {student.cgpa} below required {drive.required_cgpa}")

    if student.tenth_percentage < drive.required_tenth:
        return ApplyJobResponse(success=False, message=f"10th percentage {student.tenth_percentage} below required {drive.required_tenth}")

    if student.twelfth_percentage < drive.required_twelfth:
        return ApplyJobResponse(success=False, message=f"12th percentage {student.twelfth_percentage} below required {drive.required_twelfth}")

    existing = (
        db.query(StudentDriveRegistration)
        .filter(
            StudentDriveRegistration.student_id == student_id,
            StudentDriveRegistration.drive_id == body.drive_id,
        )
        .first()
    )
    if existing:
        return ApplyJobResponse(success=False, message="Already applied to this drive")

    registration = StudentDriveRegistration(
        registration_id=str(uuid.uuid4()),
        student_id=student_id,
        drive_id=body.drive_id,
        final_status="REGISTERED",
        rounds_cleared=0,
    )
    db.add(registration)
    db.commit()

    return ApplyJobResponse(
        success=True,
        message="Successfully applied to drive",
        registration_id=registration.registration_id,
    )


@router.post("/{student_id}/resume-upload", response_model=ResumeUploadResponse)
def resume_upload(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """resumeUpload() — Student uploads their resume."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        return ResumeUploadResponse(success=False, message="Student not found")

    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type not in allowed_types:
        return ResumeUploadResponse(success=False, message="Only PDF and Word documents are allowed")

    if file.size and file.size > 5 * 1024 * 1024:
        return ResumeUploadResponse(success=False, message="File size must be under 5MB")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "resume.pdf")[1]
    filename = f"{student_id}_{student.register_number}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = file.file.read()
        f.write(content)

    student.resume_path = filepath
    db.commit()

    return ResumeUploadResponse(
        success=True,
        message="Resume uploaded successfully",
        resume_path=filepath,
    )


@router.get("/{student_id}/analysis")
def view_analysis(student_id: str, db: Session = Depends(get_db)):
    """viewAnalysis() — Student views their failure analysis and patterns."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    results = (
        db.query(RoundResult)
        .filter(RoundResult.student_id == student_id)
        .all()
    )

    total_rounds = len(results)
    passed = sum(1 for r in results if r.result.value == "PASSED")
    failed = sum(1 for r in results if r.result.value == "FAILED")

    failure_by_type: dict[str, int] = {}
    weakness_areas: dict[str, int] = {}

    for r in results:
        if r.result.value == "FAILED":
            round_obj = db.query(Round).filter(Round.round_id == r.round_id).first()
            if round_obj:
                rtype = round_obj.round_type.value
                failure_by_type[rtype] = failure_by_type.get(rtype, 0) + 1
            if r.weakness_area:
                weakness_areas[r.weakness_area] = weakness_areas.get(r.weakness_area, 0) + 1

    most_failed_round = max(failure_by_type, key=failure_by_type.get) if failure_by_type else None
    top_weaknesses = sorted(weakness_areas.items(), key=lambda x: x[1], reverse=True)[:5]

    registrations = (
        db.query(StudentDriveRegistration)
        .filter(StudentDriveRegistration.student_id == student_id)
        .all()
    )
    total_drives = len(registrations)
    selected_count = sum(1 for reg in registrations if reg.final_status == "SELECTED")

    risk_level = "low"
    if failed >= 5:
        risk_level = "high"
    elif failed >= 3:
        risk_level = "medium"

    return {
        "student_id": student_id,
        "name": student.name,
        "summary": {
            "total_drives_applied": total_drives,
            "total_rounds_attempted": total_rounds,
            "rounds_passed": passed,
            "rounds_failed": failed,
            "pass_rate": round(passed / total_rounds * 100, 1) if total_rounds > 0 else 0,
            "drives_selected": selected_count,
        },
        "failure_analysis": {
            "failure_by_round_type": failure_by_type,
            "most_failed_round": most_failed_round,
            "top_weaknesses": [{"area": area, "count": count} for area, count in top_weaknesses],
        },
        "risk_level": risk_level,
    }

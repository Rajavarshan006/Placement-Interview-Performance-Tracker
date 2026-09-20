from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import AccessStatus
from app.models import (
    Student,
    Coordinator,
    StudentDriveRegistration,
    Drive,
)
from app.models.student_access import StudentAccess
from app.models.access_history import AccessHistory
from app.schemas.access import (
    AccessHistoryOut,
    AccessOperationResult,
    AccessOut,
    GiveAccessRequest,
    PlacedStudentOut,
    RemoveAccessRequest,
)
from app.services.credential_service import generate_username, generate_password, hash_password
from app.services.email_service import send_credentials_email, send_access_revoked_email

router = APIRouter(prefix="/api/access", tags=["access"])


def _build_placed_student(student: Student, registration, drive, access: StudentAccess | None) -> PlacedStudentOut:
    if access:
        access_out = AccessOut(
            status=access.status.value,
            invitation_sent_at=access.invitation_sent_at,
            activated_at=access.activated_at,
            last_login_at=access.last_login_at,
            revoked_at=access.revoked_at,
            history=[
                AccessHistoryOut(
                    id=h.id,
                    action=h.action,
                    timestamp=h.timestamp,
                    actor=h.actor,
                )
                for h in access.history
            ],
        )
    else:
        access_out = AccessOut(status=AccessStatus.NO_ACCESS.value, history=[])

    return PlacedStudentOut(
        student_id=student.student_id,
        name=student.name,
        register_number=student.register_number,
        department=student.department,
        email=student.email,
        cgpa=student.cgpa,
        placed_company=drive.company_name,
        role_placed=drive.role_title,
        package_lpa=drive.package_lpa,
        access=access_out,
    )


@router.get("/placed-students", response_model=list[PlacedStudentOut])
def get_placed_students(coordinator_id: str | None = None, db: Session = Depends(get_db)):
    registrations = (
        db.query(StudentDriveRegistration)
        .filter(StudentDriveRegistration.final_status == "SELECTED")
        .all()
    )

    results = []
    seen_students = set()
    for reg in registrations:
        if reg.student_id in seen_students:
            continue
        seen_students.add(reg.student_id)

        student = db.query(Student).filter(Student.student_id == reg.student_id).first()
        drive = db.query(Drive).filter(Drive.drive_id == reg.drive_id).first()
        if not student or not drive:
            continue

        access = (
            db.query(StudentAccess)
            .filter(StudentAccess.student_id == student.student_id)
            .first()
        )

        results.append(_build_placed_student(student, reg, drive, access))

    return results


@router.get("/students/{student_id}", response_model=PlacedStudentOut)
def get_student_by_id(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    registration = (
        db.query(StudentDriveRegistration)
        .filter(
            StudentDriveRegistration.student_id == student_id,
            StudentDriveRegistration.final_status == "SELECTED",
        )
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Student has no placement record")

    drive = db.query(Drive).filter(Drive.drive_id == registration.drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")

    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == student_id)
        .first()
    )

    return _build_placed_student(student, registration, drive, access)


@router.post("/give-access", response_model=AccessOperationResult)
def give_access(body: GiveAccessRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == body.student_id).first()
    if not student:
        return AccessOperationResult(success=False, message="Student not found")

    coordinator = (
        db.query(Coordinator)
        .filter(Coordinator.coordinator_id == body.coordinator_id)
        .first()
    )
    if not coordinator:
        return AccessOperationResult(success=False, message="Coordinator not found")

    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == body.student_id)
        .first()
    )

    now = datetime.utcnow()

    if access is not None and access.status not in (AccessStatus.NO_ACCESS, AccessStatus.REVOKED):
        return AccessOperationResult(
            success=False, message="Cannot give access to student with current status"
        )

    username = generate_username()
    plain_password = generate_password()
    hashed = hash_password(plain_password)

    if access is None:
        access = StudentAccess(
            student_id=body.student_id,
            coordinator_id=body.coordinator_id,
            status=AccessStatus.INVITED,
            username=username,
            password_hash=hashed,
            invitation_sent_at=now,
        )
        db.add(access)
        db.flush()

        history = AccessHistory(
            student_access_id=access.access_id,
            action="Invitation sent",
            actor="Coordinator",
            timestamp=now,
        )
        db.add(history)
    else:
        access.status = AccessStatus.INVITED
        access.username = username
        access.password_hash = hashed
        access.invitation_sent_at = now
        access.revoked_at = None
        access.updated_at = now

        history = AccessHistory(
            student_access_id=access.access_id,
            action="New invitation sent",
            actor="Coordinator",
            timestamp=now,
        )
        db.add(history)

    db.commit()

    send_credentials_email(
        to_email=student.email,
        student_name=student.name,
        username=username,
        password=plain_password,
    )

    return AccessOperationResult(
        success=True, message="Invitation sent successfully", student_id=body.student_id
    )


@router.post("/remove-access", response_model=AccessOperationResult)
def remove_access(body: RemoveAccessRequest, db: Session = Depends(get_db)):
    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == body.student_id)
        .first()
    )
    if not access:
        return AccessOperationResult(success=False, message="Student not found")

    if access.status != AccessStatus.ACTIVE:
        return AccessOperationResult(
            success=False, message="Can only remove access from active students"
        )

    student = db.query(Student).filter(Student.student_id == body.student_id).first()

    now = datetime.utcnow()
    access.status = AccessStatus.REVOKED
    access.revoked_at = now
    access.username = None
    access.password_hash = None
    access.updated_at = now

    history = AccessHistory(
        student_access_id=access.access_id,
        action="Access removed",
        actor="Coordinator",
        timestamp=now,
    )
    db.add(history)
    db.commit()

    if student:
        send_access_revoked_email(to_email=student.email, student_name=student.name)

    return AccessOperationResult(
        success=True, message="Access removed successfully", student_id=body.student_id
    )


@router.post("/resend-invitation/{student_id}", response_model=AccessOperationResult)
def resend_invitation(student_id: str, db: Session = Depends(get_db)):
    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == student_id)
        .first()
    )
    if not access:
        return AccessOperationResult(success=False, message="Student not found")

    if access.status != AccessStatus.INVITED:
        return AccessOperationResult(
            success=False, message="Can only resend invitation to invited students"
        )

    now = datetime.utcnow()
    access.invitation_sent_at = now
    access.updated_at = now

    history = AccessHistory(
        student_access_id=access.access_id,
        action="Invitation resent",
        actor="Coordinator",
        timestamp=now,
    )
    db.add(history)
    db.commit()
    return AccessOperationResult(
        success=True, message="Invitation resent successfully", student_id=student_id
    )


@router.post("/revoke-invitation/{student_id}", response_model=AccessOperationResult)
def revoke_invitation(student_id: str, db: Session = Depends(get_db)):
    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == student_id)
        .first()
    )
    if not access:
        return AccessOperationResult(success=False, message="Student not found")

    if access.status != AccessStatus.INVITED:
        return AccessOperationResult(
            success=False, message="Can only revoke invitation for invited students"
        )

    now = datetime.utcnow()
    access.status = AccessStatus.REVOKED
    access.revoked_at = now
    access.updated_at = now

    history = AccessHistory(
        student_access_id=access.access_id,
        action="Invitation revoked",
        actor="Coordinator",
        timestamp=now,
    )
    db.add(history)
    db.commit()
    return AccessOperationResult(
        success=True, message="Invitation revoked successfully", student_id=student_id
    )


@router.post("/activate/{student_id}", response_model=AccessOperationResult)
def activate_access(student_id: str, db: Session = Depends(get_db)):
    access = (
        db.query(StudentAccess)
        .filter(StudentAccess.student_id == student_id)
        .first()
    )
    if not access:
        return AccessOperationResult(success=False, message="Student not found")

    if access.status != AccessStatus.INVITED:
        return AccessOperationResult(
            success=False, message="Can only activate invited students"
        )

    now = datetime.utcnow()
    access.status = AccessStatus.ACTIVE
    access.activated_at = now
    access.last_login_at = now
    access.updated_at = now

    history = AccessHistory(
        student_access_id=access.access_id,
        action="Account activated",
        timestamp=now,
    )
    db.add(history)
    db.commit()
    return AccessOperationResult(
        success=True, message="Account activated successfully", student_id=student_id
    )

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.enums import InterventionStatus
from app.models import Intervention, InterventionAction, Student, Coordinator
from app.schemas.intervention import (
    ActionStatusUpdate,
    AtRiskStudentOut,
    InterventionCreate,
    InterventionOut,
    InterventionStatusUpdate,
    PatternOut,
)
from app.services.groq_agent import generate_intervention
from app.services.pattern_analyzer import analyze_student_patterns, get_at_risk_students

router = APIRouter(prefix="/api/intervention", tags=["intervention"])


@router.post("/{student_id}", response_model=InterventionOut)
def create_intervention(student_id: str, body: InterventionCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    coordinator = db.query(Coordinator).filter(Coordinator.coordinator_id == body.coordinator_id).first()
    if not coordinator:
        raise HTTPException(status_code=404, detail="Coordinator not found")

    result = generate_intervention(db, student_id, body.coordinator_id)

    intervention = Intervention(
        student_id=student_id,
        coordinator_id=body.coordinator_id,
        trigger_reason=result["trigger_reason"],
        failure_summary=result["failure_summary"],
        ai_analysis=result["ai_analysis"],
        recommendations=result["recommendations"],
        priority=result["priority"],
        status=InterventionStatus.GENERATED,
    )
    db.add(intervention)
    db.flush()

    for rec in result["recommendations"]:
        action = InterventionAction(
            intervention_id=intervention.intervention_id,
            action_type=rec.get("action_type", "General"),
            title=rec["title"],
            description=rec["description"],
            target_weakness=rec.get("target_weakness", "General"),
            resources=rec.get("resources"),
        )
        db.add(action)

    db.commit()
    db.refresh(intervention)
    return intervention


@router.get("/at-risk", response_model=list[AtRiskStudentOut])
def list_at_risk_students(min_failures: int = 2, db: Session = Depends(get_db)):
    return get_at_risk_students(db, min_failures)


@router.get("/pattern/{student_id}", response_model=PatternOut)
def get_student_pattern(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return analyze_student_patterns(db, student_id)


@router.get("/{intervention_id}", response_model=InterventionOut)
def get_intervention(intervention_id: str, db: Session = Depends(get_db)):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.intervention_id == intervention_id)
        .first()
    )
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return intervention


@router.get("/", response_model=list[InterventionOut])
def list_interventions(
    status: str | None = None,
    priority: str | None = None,
    student_id: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Intervention)
    if status:
        query = query.filter(Intervention.status == status)
    if priority:
        query = query.filter(Intervention.priority == priority)
    if student_id:
        query = query.filter(Intervention.student_id == student_id)
    return query.order_by(Intervention.created_at.desc()).all()


@router.patch("/{intervention_id}/status", response_model=InterventionOut)
def update_intervention_status(
    intervention_id: str, body: InterventionStatusUpdate, db: Session = Depends(get_db),
):
    intervention = (
        db.query(Intervention)
        .filter(Intervention.intervention_id == intervention_id)
        .first()
    )
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervention not found")

    intervention.status = body.status
    intervention.updated_at = datetime.utcnow()

    if body.status == InterventionStatus.APPROVED.value:
        intervention.approved_at = datetime.utcnow()
    if body.status == InterventionStatus.COMPLETED.value:
        intervention.completed_at = datetime.utcnow()
    if body.mentor_id:
        intervention.mentor_id = body.mentor_id

    db.commit()
    db.refresh(intervention)
    return intervention


@router.patch("/{intervention_id}/actions/{action_id}", response_model=InterventionOut)
def update_action_status(
    intervention_id: str,
    action_id: str,
    body: ActionStatusUpdate,
    db: Session = Depends(get_db),
):
    action = (
        db.query(InterventionAction)
        .filter(
            InterventionAction.action_id == action_id,
            InterventionAction.intervention_id == intervention_id,
        )
        .first()
    )
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")

    action.is_completed = body.is_completed
    if body.is_completed:
        action.completed_at = datetime.utcnow()
    if body.notes:
        action.notes = body.notes

    db.commit()

    intervention = (
        db.query(Intervention)
        .filter(Intervention.intervention_id == intervention_id)
        .first()
    )
    db.refresh(intervention)
    return intervention

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InterventionCreate(BaseModel):
    student_id: str
    coordinator_id: str


class InterventionActionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action_id: str
    action_type: str
    title: str
    description: str
    target_weakness: str
    resources: list | None = None
    assigned_to: str | None = None
    is_completed: bool
    due_date: str | None = None
    completed_at: datetime | None = None
    notes: str | None = None


class InterventionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    intervention_id: str
    student_id: str
    coordinator_id: str
    mentor_id: str | None = None
    trigger_reason: str
    failure_summary: dict
    ai_analysis: str
    recommendations: list
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    approved_at: datetime | None = None
    completed_at: datetime | None = None
    actions: list[InterventionActionOut] = []


class InterventionStatusUpdate(BaseModel):
    status: str
    mentor_id: str | None = None


class ActionStatusUpdate(BaseModel):
    is_completed: bool
    notes: str | None = None


class AtRiskStudentOut(BaseModel):
    student_id: str
    student_name: str
    department: str
    cgpa: float
    total_failures: int


class PatternOut(BaseModel):
    student_id: str
    student_name: str
    department: str
    cgpa: float
    total_drives_attempted: int
    total_drives_cleared: int
    failure_by_round_type: dict
    weakness_areas: dict
    score_trend: list
    failure_trend: str
    always_clears: list
    biggest_bottleneck: str | None

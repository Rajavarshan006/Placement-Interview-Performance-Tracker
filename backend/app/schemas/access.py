from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AccessHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    action: str
    timestamp: datetime
    actor: str | None = None


class AccessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    invitation_sent_at: datetime | None = None
    activated_at: datetime | None = None
    last_login_at: datetime | None = None
    revoked_at: datetime | None = None
    history: list[AccessHistoryOut] = []


class PlacedStudentOut(BaseModel):
    student_id: str
    name: str
    register_number: str
    department: str
    email: str
    cgpa: float
    placed_company: str
    role_placed: str
    package_lpa: float
    access: AccessOut


class GiveAccessRequest(BaseModel):
    coordinator_id: str
    student_id: str


class RemoveAccessRequest(BaseModel):
    coordinator_id: str
    student_id: str


class AccessOperationResult(BaseModel):
    success: bool
    message: str
    student_id: str | None = None

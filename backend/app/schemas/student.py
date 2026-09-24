from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class RoundResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    result_id: str
    round_id: str
    drive_id: str
    result: str
    score: float | None = None
    max_score: float | None = None
    rejection_reason: str | None = None
    feedback: str | None = None
    weakness_area: str | None = None
    attempt_date: date


class RoundStatusOut(BaseModel):
    drive_id: str
    company_name: str
    role_title: str
    round_number: int
    round_name: str
    round_type: str
    result: str
    score: float | None = None
    max_score: float | None = None
    rejection_reason: str | None = None
    feedback: str | None = None
    attempt_date: date


class ViewRoundStatusResponse(BaseModel):
    student_id: str
    name: str
    total_drives: int
    rounds: list[RoundStatusOut]


class JobApplicationOut(BaseModel):
    registration_id: str
    drive_id: str
    company_name: str
    company_type: str
    role_title: str
    package_lpa: float
    drive_date: date
    drive_status: str
    final_status: str
    rounds_cleared: int
    total_rounds: int
    registered_at: datetime


class ViewJobApplicationsResponse(BaseModel):
    student_id: str
    name: str
    total_applications: int
    applications: list[JobApplicationOut]


class ApplyJobRequest(BaseModel):
    student_id: str
    drive_id: str


class ApplyJobResponse(BaseModel):
    success: bool
    message: str
    registration_id: str | None = None


class ResumeUploadResponse(BaseModel):
    success: bool
    message: str
    resume_path: str | None = None


class StudentProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: str
    name: str
    register_number: str
    email: str
    department: str
    cgpa: float
    tenth_percentage: float
    twelfth_percentage: float
    placement_marks: float | None = None
    skills: list | None = None
    resume_path: str | None = None

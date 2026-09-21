from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student
from app.services.pattern_analyzer import (
    CurrentUser,
    accessible_students,
    analyse_student,
    assert_can_view_student,
    compact_student_analysis,
    current_user,
)

router = APIRouter(tags=["failure-analysis"])


def get_current_user(
    x_user_id: str = Header(..., alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    db: Session = Depends(get_db),
) -> CurrentUser:
    try:
        return current_user(db, x_user_id, x_user_role)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from error


@router.get("/coordinator/analysis/overview")
def coordinator_overview(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    analyses = [analyse_student(db, student.student_id) for student in accessible_students(db, user)]
    failures: dict[str, int] = {}
    for analysis in analyses:
        for row in analysis["round_failure_summary"]:
            failures[row["round"]] = failures.get(row["round"], 0) + row["failed"]
    return {
        "scope": "all_departments" if user.role == "placement_coordinator" else "my_department",
        "total_students": len(analyses),
        "placed_students": sum(item["placed"] for item in analyses),
        "students_with_repeated_failures": sum(item["primary_failure_pattern"]["risk_level"] == "high" for item in analyses),
        "most_failed_round": max(failures, key=failures.get) if failures else None,
    }


@router.get("/coordinator/analysis/students")
def coordinator_student_list(
    department: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    students = accessible_students(db, user)
    if department:
        students = [student for student in students if student.department.lower() == department.lower()]
    if search:
        search_term = search.lower()
        students = [student for student in students if search_term in student.name.lower() or search_term in student.register_number.lower()]
    total = len(students)
    start = (page - 1) * limit
    return {"total": total, "page": page, "limit": limit, "students": [compact_student_analysis(db, student) for student in students[start:start + limit]]}


@router.get("/analysis/students/{student_id}")
def student_failure_pattern(student_id: str, db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    try:
        assert_can_view_student(user, student)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    return analyse_student(db, student_id)


@router.get("/student/my-failure-pattern")
def my_failure_pattern(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    if user.role != "student" or user.student_id is None:
        raise HTTPException(status_code=403, detail="Student access required")
    return analyse_student(db, user.student_id)


@router.get("/coordinator/analysis/department-summary")
def department_summary(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    grouped: dict[str, list[Student]] = {}
    for student in accessible_students(db, user):
        grouped.setdefault(student.department, []).append(student)
    response = []
    for department, students in grouped.items():
        failures: dict[str, int] = {}
        repeated_count = 0
        for student in students:
            analysis = analyse_student(db, student.student_id)
            repeated_count += analysis["primary_failure_pattern"]["risk_level"] == "high"
            for row in analysis["round_failure_summary"]:
                failures[row["round"]] = failures.get(row["round"], 0) + row["failed"]
        response.append({
            "department": department,
            "students": len(students),
            "repeated_failure_students": repeated_count,
            "most_failed_round": max(failures, key=failures.get) if failures else None,
        })
    return response

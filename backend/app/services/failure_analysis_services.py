from collections import Counter, defaultdict
from datetime import date
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from pydantic import BaseModel

app = FastAPI(
    title="Placement Failure Pattern Analysis API",
    version="1.0.0",
    description="Coordinator, mentor, and student views of interview failure patterns.",
)


# ---------------------------------------------------------------------------
# Mock data. In the real project these will be database tables.
# ---------------------------------------------------------------------------

MOCK_USERS = {
    1: {"id": 1, "name": "Priya Coordinator", "role": "placement_coordinator"},
    2: {"id": 2, "name": "Arun CSE Coordinator", "role": "department_coordinator", "department_id": 1},
    3: {"id": 3, "name": "Meena Mentor", "role": "mentor", "student_ids": [101, 103]},
    101: {"id": 101, "name": "Ananya Kumar", "role": "student", "student_id": 101},
    102: {"id": 102, "name": "Bala S", "role": "student", "student_id": 102},
    103: {"id": 103, "name": "Charan R", "role": "student", "student_id": 103},
}

MOCK_STUDENTS = {
    101: {"id": 101, "name": "Ananya Kumar", "register_number": "22CSE104", "department_id": 1, "department": "CSE", "cgpa": 7.8},
    102: {"id": 102, "name": "Bala S", "register_number": "22ECE031", "department_id": 2, "department": "ECE", "cgpa": 8.2},
    103: {"id": 103, "name": "Charan R", "register_number": "22CSE117", "department_id": 1, "department": "CSE", "cgpa": 7.1},
}

# Every item represents one job application and the ordered results of its rounds.
MOCK_APPLICATIONS = [
    {"id": 501, "student_id": 101, "company": "Infosys", "job_role": "Systems Engineer", "applied_on": date(2026, 7, 1), "final_status": "rejected", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "passed", "reason": None},
        {"number": 2, "name": "Coding", "outcome": "failed", "reason": "Could not complete array and SQL questions"},
    ]},
    {"id": 502, "student_id": 101, "company": "TCS", "job_role": "Digital Profile", "applied_on": date(2026, 7, 20), "final_status": "rejected", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "passed", "reason": None},
        {"number": 2, "name": "Coding", "outcome": "failed", "reason": "Low score in data structures section"},
    ]},
    {"id": 503, "student_id": 101, "company": "Wipro", "job_role": "Project Engineer", "applied_on": date(2026, 8, 5), "final_status": "rejected", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "passed", "reason": None},
        {"number": 2, "name": "Technical Interview", "outcome": "failed", "reason": "Weakness in OOP and DBMS fundamentals"},
    ]},
    {"id": 504, "student_id": 102, "company": "Accenture", "job_role": "Associate Software Engineer", "applied_on": date(2026, 7, 12), "final_status": "rejected", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "failed", "reason": "Low quantitative aptitude score"},
    ]},
    {"id": 505, "student_id": 102, "company": "Cognizant", "job_role": "Programmer Analyst", "applied_on": date(2026, 8, 1), "final_status": "rejected", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "failed", "reason": "Time management in aptitude test"},
    ]},
    {"id": 506, "student_id": 103, "company": "Zoho", "job_role": "Software Developer", "applied_on": date(2026, 8, 10), "final_status": "placed", "rounds": [
        {"number": 1, "name": "Aptitude", "outcome": "passed", "reason": None},
        {"number": 2, "name": "Coding", "outcome": "passed", "reason": None},
        {"number": 3, "name": "Technical Interview", "outcome": "passed", "reason": None},
        {"number": 4, "name": "HR", "outcome": "passed", "reason": None},
    ]},
]


class CurrentUser(BaseModel):
    id: int
    name: str
    role: str
    department_id: Optional[int] = None
    student_id: Optional[int] = None
    student_ids: list[int] = []


def current_user(x_user_id: int = Header(..., alias="X-User-Id")) -> CurrentUser:
    """Temporary authentication dependency; replace with decoded JWT later."""
    user = MOCK_USERS.get(x_user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unknown X-User-Id")
    return CurrentUser(**user)


def student_applications(student_id: int) -> list[dict]:
    return [item for item in MOCK_APPLICATIONS if item["student_id"] == student_id]


def assert_can_view_student(user: CurrentUser, student: dict) -> None:
    if user.role == "placement_coordinator":
        return
    if user.role == "department_coordinator" and user.department_id == student["department_id"]:
        return
    if user.role == "mentor" and student["id"] in user.student_ids:
        return
    if user.role == "student" and user.student_id == student["id"]:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this student's analysis")


def accessible_students(user: CurrentUser) -> list[dict]:
    if user.role == "placement_coordinator":
        return list(MOCK_STUDENTS.values())
    if user.role == "department_coordinator":
        return [s for s in MOCK_STUDENTS.values() if s["department_id"] == user.department_id]
    if user.role == "mentor":
        return [MOCK_STUDENTS[sid] for sid in user.student_ids if sid in MOCK_STUDENTS]
    if user.role == "student" and user.student_id in MOCK_STUDENTS:
        return [MOCK_STUDENTS[user.student_id]]
    return []


def recommendation(round_name: str) -> str:
    suggestions = {
        "Aptitude": "Assign timed quantitative aptitude practice and a weekly mock test.",
        "Coding": "Assign DSA, arrays, SQL practice, and a mentor-led coding review.",
        "Technical Interview": "Schedule an OOP, DBMS, and project-explanation mock interview.",
        "HR": "Schedule an HR mock interview focused on communication and confidence.",
    }
    return suggestions.get(round_name, "Schedule a mentor review and targeted practice plan.")


def analyse_student(student_id: int) -> dict:
    student = MOCK_STUDENTS[student_id]
    applications = student_applications(student_id)
    round_stats = defaultdict(lambda: {"attempted": 0, "passed": 0, "failed": 0})
    reasons: list[str] = []

    for application in applications:
        for result in application["rounds"]:
            stats = round_stats[result["name"]]
            stats["attempted"] += 1
            stats[result["outcome"]] += 1
            if result["outcome"] == "failed" and result["reason"]:
                reasons.append(result["reason"])

    summary = [
        {"round": name, **stats, "failure_rate": round(stats["failed"] / stats["attempted"] * 100, 1)}
        for name, stats in sorted(round_stats.items())
    ]
    failed_rounds = [(name, values["failed"]) for name, values in round_stats.items() if values["failed"]]
    primary_round, failure_count = max(failed_rounds, key=lambda item: item[1], default=(None, 0))
    repeated = failure_count >= 2
    risk = "high" if failure_count >= 2 else "medium" if failure_count == 1 else "low"

    return {
        "student": student,
        "total_applications": len(applications),
        "placed": any(item["final_status"] == "placed" for item in applications),
        "round_failure_summary": summary,
        "primary_failure_pattern": {
            "pattern": f"Repeated {primary_round} failure" if repeated else (f"{primary_round} failure" if primary_round else "No failure pattern detected"),
            "evidence": f"Failed {primary_round} in {failure_count} application(s)" if primary_round else "No failed interview rounds found",
            "risk_level": risk,
            "recommended_action": recommendation(primary_round) if primary_round else "Continue regular placement preparation.",
        },
        "recent_failure_reasons": reasons[-5:],
        "applications": applications,
    }


def compact_student_analysis(student: dict) -> dict:
    analysis = analyse_student(student["id"])
    pattern = analysis["primary_failure_pattern"]
    return {
        "student_id": student["id"], "name": student["name"], "register_number": student["register_number"],
        "department": student["department"], "cgpa": student["cgpa"],
        "applications": analysis["total_applications"], "placed": analysis["placed"],
        "primary_failure_pattern": pattern["pattern"], "risk_level": pattern["risk_level"],
    }


@app.get("/coordinator/analysis/overview")
def coordinator_overview(user: CurrentUser = Depends(current_user)):
    students = accessible_students(user)
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    analyses = [analyse_student(student["id"]) for student in students]
    failure_counter = Counter()
    for analysis in analyses:
        for row in analysis["round_failure_summary"]:
            failure_counter[row["round"]] += row["failed"]
    return {
        "scope": "all_departments" if user.role == "placement_coordinator" else "my_department",
        "total_students": len(students),
        "placed_students": sum(item["placed"] for item in analyses),
        "students_with_repeated_failures": sum(item["primary_failure_pattern"]["risk_level"] == "high" for item in analyses),
        "most_failed_round": failure_counter.most_common(1)[0][0] if failure_counter else None,
    }


@app.get("/coordinator/analysis/students")
def coordinator_student_list(
    department: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    user: CurrentUser = Depends(current_user),
):
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    students = accessible_students(user)
    if department:
        students = [s for s in students if s["department"].lower() == department.lower()]
    if search:
        term = search.lower()
        students = [s for s in students if term in s["name"].lower() or term in s["register_number"].lower()]
    total = len(students)
    start = (page - 1) * limit
    return {"total": total, "page": page, "limit": limit, "students": [compact_student_analysis(s) for s in students[start:start + limit]]}


@app.get("/analysis/students/{student_id}")
def student_failure_pattern(student_id: int, user: CurrentUser = Depends(current_user)):
    student = MOCK_STUDENTS.get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    assert_can_view_student(user, student)
    return analyse_student(student_id)


@app.get("/student/my-failure-pattern")
def my_failure_pattern(user: CurrentUser = Depends(current_user)):
    if user.role != "student" or user.student_id is None:
        raise HTTPException(status_code=403, detail="Student access required")
    return analyse_student(user.student_id)


@app.get("/coordinator/analysis/department-summary")
def department_summary(user: CurrentUser = Depends(current_user)):
    if user.role not in {"placement_coordinator", "department_coordinator"}:
        raise HTTPException(status_code=403, detail="Coordinator access required")
    grouped = defaultdict(list)
    for student in accessible_students(user):
        grouped[student["department"]].append(student)
    response = []
    for department, students in grouped.items():
        failures = Counter()
        repeated_count = 0
        for student in students:
            analysis = analyse_student(student["id"])
            repeated_count += analysis["primary_failure_pattern"]["risk_level"] == "high"
            for row in analysis["round_failure_summary"]:
                failures[row["round"]] += row["failed"]
        response.append({
            "department": department,
            "students": len(students),
            "repeated_failure_students": repeated_count,
            "most_failed_round": failures.most_common(1)[0][0] if failures else None,
        })
    return response

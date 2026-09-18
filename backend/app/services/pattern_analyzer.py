from collections import Counter, defaultdict

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.enums import Result
from app.models import (
    Drive, Round, RoundResult, Student, StudentDriveRegistration,
)


def analyze_student_patterns(db: Session, student_id: str) -> dict:
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise ValueError(f"Student {student_id} not found")

    registrations = (
        db.query(StudentDriveRegistration)
        .filter(StudentDriveRegistration.student_id == student_id)
        .all()
    )
    total_attempted = len(registrations)
    total_cleared = sum(1 for r in registrations if r.final_status == "SELECTED")

    results = (
        db.query(RoundResult, Round, Drive)
        .join(Round, RoundResult.round_id == Round.round_id)
        .join(Drive, RoundResult.drive_id == Drive.drive_id)
        .filter(RoundResult.student_id == student_id)
        .order_by(Drive.drive_date, Round.round_number)
        .all()
    )

    failure_by_round: dict[str, dict] = defaultdict(lambda: {"count": 0, "drives": []})
    weakness_counter: Counter = Counter()
    always_pass_rounds: dict[str, list[bool]] = defaultdict(list)
    score_trend: list[float] = []

    for rr, rnd, drv in results:
        rt = rnd.round_type.value
        passed = rr.result == Result.PASSED
        always_pass_rounds[rt].append(passed)

        if not passed:
            failure_by_round[rt]["count"] += 1
            if drv.company_name not in failure_by_round[rt]["drives"]:
                failure_by_round[rt]["drives"].append(drv.company_name)
            if rr.weakness_area:
                weakness_counter[rr.weakness_area] += 1
            if rr.score is not None:
                score_trend.append(rr.score)

    always_clears = [
        rt for rt, outcomes in always_pass_rounds.items()
        if all(outcomes) and len(outcomes) > 0
    ]

    biggest_bottleneck = None
    if failure_by_round:
        biggest_bottleneck = max(failure_by_round, key=lambda k: failure_by_round[k]["count"])

    failure_trend = _compute_trend(score_trend)

    return {
        "student_id": student_id,
        "student_name": student.name,
        "department": student.department,
        "cgpa": student.cgpa,
        "total_drives_attempted": total_attempted,
        "total_drives_cleared": total_cleared,
        "failure_by_round_type": dict(failure_by_round),
        "weakness_areas": dict(weakness_counter),
        "score_trend": score_trend,
        "failure_trend": failure_trend,
        "always_clears": always_clears,
        "biggest_bottleneck": biggest_bottleneck,
    }


def _compute_trend(scores: list[float]) -> str:
    if len(scores) < 2:
        return "INSUFFICIENT_DATA"
    diffs = [scores[i + 1] - scores[i] for i in range(len(scores) - 1)]
    avg_diff = sum(diffs) / len(diffs)
    if avg_diff > 2:
        return "IMPROVING"
    if avg_diff < -2:
        return "WORSENING"
    return "STABLE"


def get_at_risk_students(db: Session, min_failures: int = 2) -> list[dict]:
    failure_counts = (
        db.query(
            RoundResult.student_id,
            func.count(RoundResult.result_id).label("fail_count"),
        )
        .filter(RoundResult.result == Result.FAILED)
        .group_by(RoundResult.student_id)
        .having(func.count(RoundResult.result_id) >= min_failures)
        .all()
    )

    at_risk = []
    for student_id, fail_count in failure_counts:
        has_selection = (
            db.query(StudentDriveRegistration)
            .filter(
                StudentDriveRegistration.student_id == student_id,
                StudentDriveRegistration.final_status == "SELECTED",
            )
            .first()
        )
        if has_selection:
            continue

        student = db.query(Student).filter(Student.student_id == student_id).first()
        at_risk.append({
            "student_id": student_id,
            "student_name": student.name,
            "department": student.department,
            "cgpa": student.cgpa,
            "total_failures": fail_count,
        })

    at_risk.sort(key=lambda s: s["total_failures"], reverse=True)
    return at_risk

import json
from unittest.mock import MagicMock, patch

from app.services.groq_agent import build_prompt, parse_groq_response, compute_priority


def test_build_prompt_includes_student_name():
    patterns = {
        "student_name": "Rahul Sharma",
        "department": "CSE",
        "cgpa": 7.8,
        "total_drives_attempted": 3,
        "total_drives_cleared": 0,
        "failure_by_round_type": {"CODING": {"count": 3, "drives": ["TCS", "Infosys", "Zoho"]}},
        "weakness_areas": {"Dynamic Programming": 3},
        "score_trend": [30, 35, 40],
        "failure_trend": "IMPROVING",
        "always_clears": ["APTITUDE"],
        "biggest_bottleneck": "CODING",
    }
    prompt = build_prompt(patterns)
    assert "Rahul Sharma" in prompt
    assert "CODING" in prompt
    assert "Dynamic Programming" in prompt
    assert "IMPROVING" in prompt


def test_build_prompt_includes_drive_details():
    patterns = {
        "student_name": "Test",
        "department": "IT",
        "cgpa": 6.5,
        "total_drives_attempted": 2,
        "total_drives_cleared": 0,
        "failure_by_round_type": {"APTITUDE": {"count": 2, "drives": ["TCS", "Infosys"]}},
        "weakness_areas": {"Aptitude - Quantitative": 2},
        "score_trend": [35, 40],
        "failure_trend": "IMPROVING",
        "always_clears": [],
        "biggest_bottleneck": "APTITUDE",
    }
    prompt = build_prompt(patterns)
    assert "TCS" in prompt
    assert "Infosys" in prompt


def test_parse_groq_response_extracts_fields():
    raw = json.dumps({
        "analysis": "Student has a clear pattern of failing coding rounds.",
        "recommendations": [
            {
                "title": "Practice DP problems",
                "description": "Solve 30 medium DP problems on LeetCode",
                "action_type": "Practice Set",
                "target_weakness": "Dynamic Programming",
                "priority_order": 1,
                "estimated_days": 14,
                "resources": ["https://leetcode.com/tag/dp"],
            }
        ],
    })
    result = parse_groq_response(raw)
    assert result["analysis"] == "Student has a clear pattern of failing coding rounds."
    assert len(result["recommendations"]) == 1
    assert result["recommendations"][0]["target_weakness"] == "Dynamic Programming"


def test_parse_groq_response_handles_markdown_wrapper():
    raw = '```json\n{"analysis": "test", "recommendations": []}\n```'
    result = parse_groq_response(raw)
    assert result["analysis"] == "test"


def test_compute_priority_critical():
    patterns = {"total_drives_attempted": 4, "total_drives_cleared": 0,
                "failure_by_round_type": {"CODING": {"count": 4}}}
    assert compute_priority(patterns) == "CRITICAL"


def test_compute_priority_high():
    patterns = {"total_drives_attempted": 2, "total_drives_cleared": 0,
                "failure_by_round_type": {"CODING": {"count": 3}}}
    assert compute_priority(patterns) == "HIGH"


def test_compute_priority_medium():
    patterns = {"total_drives_attempted": 2, "total_drives_cleared": 0,
                "failure_by_round_type": {"CODING": {"count": 2}}}
    assert compute_priority(patterns) == "MEDIUM"


def test_compute_priority_low():
    patterns = {"total_drives_attempted": 2, "total_drives_cleared": 1,
                "failure_by_round_type": {"CODING": {"count": 1}}}
    assert compute_priority(patterns) == "LOW"

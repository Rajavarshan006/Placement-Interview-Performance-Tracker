"""Dummy model — replace when Team A builds the real RoundResult entity."""
import uuid
from datetime import date

from sqlalchemy import Date, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import Result


class RoundResult(Base):
    __tablename__ = "round_results"

    result_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.student_id"), nullable=False)
    round_id: Mapped[str] = mapped_column(String(36), ForeignKey("rounds.round_id"), nullable=False)
    drive_id: Mapped[str] = mapped_column(String(36), ForeignKey("drives.drive_id"), nullable=False)
    result: Mapped[Result] = mapped_column(nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    weakness_area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    attempt_date: Mapped[date] = mapped_column(Date, nullable=False)

    student: Mapped["Student"] = relationship(back_populates="round_results")
    round: Mapped["Round"] = relationship(back_populates="results")

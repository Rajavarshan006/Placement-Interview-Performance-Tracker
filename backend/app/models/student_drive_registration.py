"""Dummy model — replace when Team A builds the real Registration entity."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class StudentDriveRegistration(Base):
    __tablename__ = "student_drive_registrations"

    registration_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("students.student_id"), nullable=False)
    drive_id: Mapped[str] = mapped_column(String(36), ForeignKey("drives.drive_id"), nullable=False)
    final_status: Mapped[str] = mapped_column(String(20), nullable=False)
    rounds_cleared: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    registered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    student: Mapped["Student"] = relationship(back_populates="registrations")
    drive: Mapped["Drive"] = relationship(back_populates="registrations")

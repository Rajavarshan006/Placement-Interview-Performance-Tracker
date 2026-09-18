import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InterventionAction(Base):
    __tablename__ = "intervention_actions"

    action_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    intervention_id: Mapped[str] = mapped_column(String(36), ForeignKey("interventions.intervention_id"), nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    target_weakness: Mapped[str] = mapped_column(String(100), nullable=False)
    resources: Mapped[list | None] = mapped_column(JSON, nullable=True)
    assigned_to: Mapped[str | None] = mapped_column(String(36), ForeignKey("mentors.mentor_id"), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    intervention: Mapped["Intervention"] = relationship(back_populates="actions")

"""Dummy model — replace when Team A builds the real Coordinator entity."""
import uuid

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Coordinator(Base):
    __tablename__ = "coordinators"

    coordinator_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    department: Mapped[str | None] = mapped_column(String(50), nullable=True)

    drives: Mapped[list["Drive"]] = relationship(back_populates="coordinator")
    interventions: Mapped[list["Intervention"]] = relationship(back_populates="coordinator")

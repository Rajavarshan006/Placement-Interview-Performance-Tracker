"""Dummy model — replace when Team A builds the real Round entity."""
import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import RoundType


class Round(Base):
    __tablename__ = "rounds"

    round_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    drive_id: Mapped[str] = mapped_column(String(36), ForeignKey("drives.drive_id"), nullable=False)
    round_type: Mapped[RoundType] = mapped_column(nullable=False)
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)
    round_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_appeared: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_passed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    drive: Mapped["Drive"] = relationship(back_populates="rounds")
    results: Mapped[list["RoundResult"]] = relationship(back_populates="round")

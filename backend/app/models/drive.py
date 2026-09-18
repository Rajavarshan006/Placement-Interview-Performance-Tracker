"""Dummy model — replace when Team A builds the real Drive entity."""
import uuid
from datetime import datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import CompanyType, DriveStatus


class Drive(Base):
    __tablename__ = "drives"

    drive_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_name: Mapped[str] = mapped_column(String(100), nullable=False)
    company_type: Mapped[CompanyType] = mapped_column(nullable=False)
    role_title: Mapped[str] = mapped_column(String(100), nullable=False)
    package_lpa: Mapped[float] = mapped_column(Float, nullable=False)
    drive_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    required_cgpa: Mapped[float] = mapped_column(Float, nullable=False)
    required_tenth: Mapped[float] = mapped_column(Float, nullable=False)
    required_twelfth: Mapped[float] = mapped_column(Float, nullable=False)
    total_rounds: Mapped[int] = mapped_column(Integer, nullable=False)
    drive_status: Mapped[DriveStatus] = mapped_column(nullable=False, default=DriveStatus.UPCOMING)
    coordinator_id: Mapped[str] = mapped_column(String(36), ForeignKey("coordinators.coordinator_id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    coordinator: Mapped["Coordinator"] = relationship(back_populates="drives")
    rounds: Mapped[list["Round"]] = relationship(back_populates="drive")
    registrations: Mapped[list["StudentDriveRegistration"]] = relationship(back_populates="drive")

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.enums import AccessStatus


class StudentAccess(Base):
    __tablename__ = "student_access"

    access_id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("students.student_id"), unique=True, nullable=False
    )
    coordinator_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("coordinators.coordinator_id"), nullable=False
    )
    status: Mapped[AccessStatus] = mapped_column(
        nullable=False, default=AccessStatus.NO_ACCESS
    )
    username: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    invitation_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    activated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    student: Mapped["Student"] = relationship()
    coordinator: Mapped["Coordinator"] = relationship()
    history: Mapped[list["AccessHistory"]] = relationship(
        back_populates="student_access", order_by="AccessHistory.timestamp"
    )

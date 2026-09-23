"""Status model for tracking student recruitment progress."""
import uuid

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Status(Base):
    __tablename__ = "status"

    status_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    failed_attempts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    successful_attempts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

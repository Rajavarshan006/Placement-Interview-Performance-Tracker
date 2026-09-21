import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Authenticate(Base):
    __tablename__ = "authenticate"

    gmail: Mapped[str] = mapped_column(String(100), primary_key=True)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

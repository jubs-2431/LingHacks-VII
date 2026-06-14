import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, LargeBinary, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def uuid_string() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    user_id: Mapped[str | None] = mapped_column(String(36), index=True)
    report_id: Mapped[str | None] = mapped_column(String(36), index=True)
    share_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    user: Mapped[User] = relationship(back_populates="refresh_tokens")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    encrypted_filename: Mapped[bytes | None] = mapped_column(LargeBinary)
    document_type: Mapped[str] = mapped_column(String(32), index=True)
    encrypted_text: Mapped[bytes] = mapped_column(LargeBinary)
    encrypted_analysis: Mapped[bytes] = mapped_column(LargeBinary)
    encrypted_pages: Mapped[bytes | None] = mapped_column(LargeBinary)
    finding_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    highest_severity: Mapped[str | None] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)

    owner: Mapped[User] = relationship(back_populates="reports")
    share_links: Mapped[list["ShareLink"]] = relationship(
        back_populates="report", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_reports_owner_active", "owner_id", "deleted_at", "created_at"),
    )


class ShareLink(Base):
    __tablename__ = "share_links"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_string)
    report_id: Mapped[str] = mapped_column(
        ForeignKey("reports.id", ondelete="CASCADE"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    max_accesses: Mapped[int] = mapped_column(Integer, nullable=False)
    access_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    report: Mapped[Report] = relationship(back_populates="share_links")

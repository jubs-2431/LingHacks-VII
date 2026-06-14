"""Create users, reports, refresh tokens, and share links.

Revision ID: 20260614_0001
Revises:
Create Date: 2026-06-14
"""
from typing import Sequence

import sqlalchemy as sa
from alembic import op


revision: str = "20260614_0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "audit_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("report_id", sa.String(length=36), nullable=True),
        sa.Column("share_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_created_at", "audit_events", ["created_at"])
    op.create_index("ix_audit_events_event_type", "audit_events", ["event_type"])
    op.create_index("ix_audit_events_report_id", "audit_events", ["report_id"])
    op.create_index("ix_audit_events_share_id", "audit_events", ["share_id"])
    op.create_index("ix_audit_events_user_id", "audit_events", ["user_id"])

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=512), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        "ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"]
    )
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"])

    op.create_table(
        "reports",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("owner_id", sa.String(length=36), nullable=False),
        sa.Column("encrypted_filename", sa.LargeBinary(), nullable=True),
        sa.Column("document_type", sa.String(length=32), nullable=False),
        sa.Column("encrypted_text", sa.LargeBinary(), nullable=False),
        sa.Column("encrypted_analysis", sa.LargeBinary(), nullable=False),
        sa.Column("encrypted_pages", sa.LargeBinary(), nullable=True),
        sa.Column("finding_count", sa.Integer(), nullable=False),
        sa.Column("highest_severity", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reports_created_at", "reports", ["created_at"])
    op.create_index("ix_reports_deleted_at", "reports", ["deleted_at"])
    op.create_index("ix_reports_document_type", "reports", ["document_type"])
    op.create_index("ix_reports_expires_at", "reports", ["expires_at"])
    op.create_index("ix_reports_owner_id", "reports", ["owner_id"])
    op.create_index(
        "ix_reports_owner_active",
        "reports",
        ["owner_id", "deleted_at", "created_at"],
    )

    op.create_table(
        "share_links",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("report_id", sa.String(length=36), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("max_accesses", sa.Integer(), nullable=False),
        sa.Column("access_count", sa.Integer(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index("ix_share_links_expires_at", "share_links", ["expires_at"])
    op.create_index("ix_share_links_report_id", "share_links", ["report_id"])


def downgrade() -> None:
    op.drop_table("share_links")
    op.drop_table("reports")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
    op.drop_table("audit_events")

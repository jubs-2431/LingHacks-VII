from sqlalchemy import delete, or_

from datetime import timedelta

from app.db.models import AuditEvent, RefreshToken, Report, ShareLink
from app.db.session import SessionLocal
from app.security import utc_now
from app.settings import get_settings


def main() -> None:
    now = utc_now()
    settings = get_settings()
    with SessionLocal() as db:
        db.execute(
            delete(ShareLink).where(
                or_(ShareLink.expires_at <= now, ShareLink.revoked_at.is_not(None))
            )
        )
        db.execute(
            delete(RefreshToken).where(
                or_(
                    RefreshToken.expires_at <= now,
                    RefreshToken.revoked_at.is_not(None),
                )
            )
        )
        db.execute(
            delete(Report).where(
                or_(Report.expires_at <= now, Report.deleted_at.is_not(None))
            )
        )
        db.execute(
            delete(AuditEvent).where(
                AuditEvent.created_at
                <= now - timedelta(days=settings.audit_retention_days)
            )
        )
        db.commit()


if __name__ == "__main__":
    main()

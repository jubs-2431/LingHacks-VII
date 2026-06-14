from sqlalchemy.orm import Session

from app.db.models import AuditEvent


def record_audit(
    db: Session,
    event_type: str,
    *,
    user_id: str | None = None,
    report_id: str | None = None,
    share_id: str | None = None,
) -> None:
    db.add(
        AuditEvent(
            event_type=event_type,
            user_id=user_id,
            report_id=report_id,
            share_id=share_id,
        )
    )

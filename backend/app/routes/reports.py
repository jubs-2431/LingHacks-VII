import secrets
from datetime import timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.db.models import Report, ShareLink, User
from app.db.session import get_db
from app.models.reports import (
    CreateReportRequest,
    CreateShareRequest,
    ReportResponse,
    ReportSummaryResponse,
    ShareResponse,
)
from app.nlp.risk_detector import analyze_document_text
from app.security import (
    decrypt_json,
    decrypt_text,
    encrypt_json,
    encrypt_text,
    get_current_user,
    hash_token,
    utc_now,
)
from app.settings import get_settings


router = APIRouter()
settings = get_settings()


def _active_report_query(report_id: str, owner_id: str | None = None):
    query = select(Report).where(
        Report.id == report_id,
        Report.deleted_at.is_(None),
        Report.expires_at > utc_now(),
    )
    if owner_id is not None:
        query = query.where(Report.owner_id == owner_id)
    return query


def _highest_severity(analysis: dict) -> str | None:
    for severity in ("high", "medium", "low"):
        if analysis["risk_counts"].get(severity, 0):
            return severity
    return None


def _as_utc(value):
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def _summary(report: Report) -> dict:
    return {
        "id": report.id,
        "filename": (
            decrypt_text(report.encrypted_filename)
            if report.encrypted_filename
            else None
        ),
        "document_type": report.document_type,
        "finding_count": report.finding_count,
        "highest_severity": report.highest_severity,
        "created_at": report.created_at,
        "expires_at": report.expires_at,
    }


def _detail(report: Report) -> dict:
    return {
        **_summary(report),
        "text": decrypt_text(report.encrypted_text),
        "analysis": decrypt_json(report.encrypted_analysis),
        "pages": (
            decrypt_json(report.encrypted_pages) if report.encrypted_pages else []
        ),
    }


@router.post("/reports", response_model=ReportResponse, status_code=201)
def create_report(
    payload: CreateReportRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    pages = [page.model_dump() for page in payload.pages]
    analysis = analyze_document_text(
        payload.text,
        payload.document_type,
        page_spans=pages,
    )
    report = Report(
        owner_id=user.id,
        encrypted_filename=encrypt_text(payload.filename) if payload.filename else None,
        document_type=payload.document_type,
        encrypted_text=encrypt_text(payload.text),
        encrypted_analysis=encrypt_json(analysis),
        encrypted_pages=encrypt_json(pages) if pages else None,
        finding_count=analysis["document_stats"]["findings"],
        highest_severity=_highest_severity(analysis),
        expires_at=utc_now() + timedelta(days=settings.report_retention_days),
    )
    db.add(report)
    db.flush()
    record_audit(db, "report.created", user_id=user.id, report_id=report.id)
    db.commit()
    db.refresh(report)
    return _detail(report)


@router.get("/reports", response_model=list[ReportSummaryResponse])
def list_reports(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> list[dict]:
    reports = db.scalars(
        select(Report)
        .where(
            Report.owner_id == user.id,
            Report.deleted_at.is_(None),
            Report.expires_at > utc_now(),
        )
        .order_by(Report.created_at.desc())
    )
    return [_summary(report) for report in reports]


@router.get("/reports/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    report = db.scalar(_active_report_query(report_id, user.id))
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    detail = _detail(report)
    record_audit(db, "report.viewed", user_id=user.id, report_id=report.id)
    db.commit()
    return detail


@router.delete("/reports/{report_id}", status_code=204)
def delete_report(
    report_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    report = db.scalar(_active_report_query(report_id, user.id))
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    now = utc_now()
    report.deleted_at = now
    db.execute(
        update(ShareLink)
        .where(ShareLink.report_id == report.id, ShareLink.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    record_audit(db, "report.deleted", user_id=user.id, report_id=report.id)
    db.commit()


@router.post(
    "/reports/{report_id}/shares",
    response_model=ShareResponse,
    status_code=201,
)
def create_share(
    report_id: str,
    payload: CreateShareRequest,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    report = db.scalar(_active_report_query(report_id, user.id))
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found.")

    raw_token = secrets.token_urlsafe(48)
    expires_at = min(
        _as_utc(report.expires_at),
        utc_now()
        + timedelta(hours=payload.expires_in_hours or settings.share_link_hours),
    )
    share = ShareLink(
        report_id=report.id,
        token_hash=hash_token(raw_token),
        expires_at=expires_at,
        max_accesses=payload.max_accesses or settings.share_link_max_accesses,
    )
    db.add(share)
    db.flush()
    record_audit(
        db,
        "share.created",
        user_id=user.id,
        report_id=report.id,
        share_id=share.id,
    )
    db.commit()
    db.refresh(share)
    return {
        "id": share.id,
        "report_id": report.id,
        "share_url": settings.share_url_template.replace("{token}", raw_token),
        "expires_at": share.expires_at,
        "max_accesses": share.max_accesses,
        "access_count": share.access_count,
        "revoked": False,
    }


@router.delete("/reports/{report_id}/shares/{share_id}", status_code=204)
def revoke_share(
    report_id: str,
    share_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    share = db.scalar(
        select(ShareLink)
        .join(Report)
        .where(
            ShareLink.id == share_id,
            ShareLink.report_id == report_id,
            Report.owner_id == user.id,
            Report.deleted_at.is_(None),
        )
    )
    if share is None:
        raise HTTPException(status_code=404, detail="Share link not found.")
    if share.revoked_at is None:
        share.revoked_at = utc_now()
        record_audit(
            db,
            "share.revoked",
            user_id=user.id,
            report_id=report_id,
            share_id=share.id,
        )
        db.commit()


@router.get("/shares/{token}", response_model=ReportResponse)
def read_shared_report(
    token: str,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    now = utc_now()
    share = db.scalar(
        select(ShareLink)
        .join(Report)
        .where(
            ShareLink.token_hash == hash_token(token),
            ShareLink.revoked_at.is_(None),
            ShareLink.expires_at > now,
            ShareLink.access_count < ShareLink.max_accesses,
            Report.deleted_at.is_(None),
            Report.expires_at > now,
        )
        .with_for_update()
    )
    if share is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link is invalid or expired.",
        )
    share.access_count += 1
    detail = _detail(share.report)
    record_audit(
        db,
        "share.accessed",
        report_id=share.report_id,
        share_id=share.id,
    )
    db.commit()
    return detail

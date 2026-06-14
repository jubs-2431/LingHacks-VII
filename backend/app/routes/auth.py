from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.audit import record_audit
from app.db.models import RefreshToken, User
from app.db.session import get_db
from app.models.auth import (
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.security import (
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    hash_token,
    normalize_email,
    utc_now,
    verify_password,
)


router = APIRouter(prefix="/auth")


def _user_response(user: User) -> dict:
    return {"id": user.id, "email": user.email, "created_at": user.created_at}


def _token_response(db: Session, user: User) -> dict:
    access_token, expires_in = create_access_token(user.id)
    refresh_token, refresh_expires_at = create_refresh_token(db, user.id)
    db.commit()
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
        "refresh_expires_at": refresh_expires_at,
        "user": _user_response(user),
    }


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = User(
        email=normalize_email(str(payload.email)),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from exc
    record_audit(db, "user.registered", user_id=user.id)
    return _token_response(db, user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    user = db.scalar(
        select(User).where(User.email == normalize_email(str(payload.email)))
    )
    if user is None or not user.is_active or not verify_password(
        payload.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    record_audit(db, "user.logged_in", user_id=user.id)
    return _token_response(db, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Annotated[Session, Depends(get_db)]) -> dict:
    now = utc_now()
    stored_token = db.scalar(
        select(RefreshToken)
        .where(RefreshToken.token_hash == hash_token(payload.refresh_token))
        .with_for_update()
    )
    if stored_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )
    if stored_token.revoked_at is not None:
        db.execute(
            update(RefreshToken)
            .where(
                RefreshToken.user_id == stored_token.user_id,
                RefreshToken.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        record_audit(db, "token.reuse_detected", user_id=stored_token.user_id)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )
    active_token = db.scalar(
        select(RefreshToken.id).where(
            RefreshToken.id == stored_token.id,
            RefreshToken.expires_at > now,
        )
    )
    if active_token is None or not stored_token.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )
    stored_token.revoked_at = now
    record_audit(db, "token.refreshed", user_id=stored_token.user_id)
    return _token_response(db, stored_token.user)


@router.post("/logout", status_code=204)
def logout(
    payload: LogoutRequest,
    db: Annotated[Session, Depends(get_db)],
) -> Response:
    stored_token = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_token(payload.refresh_token)
        )
    )
    if stored_token is not None and stored_token.revoked_at is None:
        stored_token.revoked_at = utc_now()
        record_audit(db, "user.logged_out", user_id=stored_token.user_id)
        db.commit()
    return Response(status_code=204)


@router.get("/me", response_model=UserResponse)
def me(user: Annotated[User, Depends(get_current_user)]) -> dict:
    return _user_response(user)

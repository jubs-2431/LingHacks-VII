import base64
import hashlib
import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import RefreshToken, User
from app.db.session import get_db
from app.settings import Settings, get_settings


password_hasher = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    return email.strip().casefold()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _encryption_key(settings: Settings) -> bytes:
    if settings.encryption_key:
        return settings.encryption_key.encode("ascii")
    digest = hashlib.sha256(settings.jwt_secret.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def encrypt_json(value: dict | list, settings: Settings | None = None) -> bytes:
    active_settings = settings or get_settings()
    payload = json.dumps(value, separators=(",", ":"), ensure_ascii=True).encode()
    return Fernet(_encryption_key(active_settings)).encrypt(payload)


def decrypt_json(value: bytes, settings: Settings | None = None) -> dict | list:
    active_settings = settings or get_settings()
    try:
        payload = Fernet(_encryption_key(active_settings)).decrypt(value)
        return json.loads(payload)
    except (InvalidToken, json.JSONDecodeError) as exc:
        raise ValueError("Stored data could not be decrypted.") from exc


def encrypt_text(value: str, settings: Settings | None = None) -> bytes:
    active_settings = settings or get_settings()
    return Fernet(_encryption_key(active_settings)).encrypt(value.encode("utf-8"))


def decrypt_text(value: bytes, settings: Settings | None = None) -> str:
    active_settings = settings or get_settings()
    try:
        return Fernet(_encryption_key(active_settings)).decrypt(value).decode("utf-8")
    except (InvalidToken, UnicodeDecodeError) as exc:
        raise ValueError("Stored data could not be decrypted.") from exc


def create_access_token(user_id: str, settings: Settings | None = None) -> tuple[str, int]:
    active_settings = settings or get_settings()
    now = utc_now()
    expires = now + timedelta(minutes=active_settings.access_token_minutes)
    payload = {
        "sub": user_id,
        "jti": str(uuid.uuid4()),
        "type": "access",
        "iat": now,
        "exp": expires,
        "iss": active_settings.jwt_issuer,
        "aud": active_settings.jwt_audience,
    }
    token = jwt.encode(
        payload,
        active_settings.jwt_secret,
        algorithm=active_settings.jwt_algorithm,
    )
    return token, int((expires - now).total_seconds())


def create_refresh_token(
    db: Session,
    user_id: str,
    settings: Settings | None = None,
) -> tuple[str, datetime]:
    active_settings = settings or get_settings()
    raw_token = secrets.token_urlsafe(48)
    expires_at = utc_now() + timedelta(days=active_settings.refresh_token_days)
    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_token(raw_token),
            expires_at=expires_at,
        )
    )
    return raw_token, expires_at


def decode_access_token(token: str, settings: Settings | None = None) -> str:
    active_settings = settings or get_settings()
    try:
        payload = jwt.decode(
            token,
            active_settings.jwt_secret,
            algorithms=[active_settings.jwt_algorithm],
            issuer=active_settings.jwt_issuer,
            audience=active_settings.jwt_audience,
        )
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    if payload.get("type") != "access" or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return str(payload["sub"])


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user_id = decode_access_token(token)
    user = db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is unavailable.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

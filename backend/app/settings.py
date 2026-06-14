from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from cryptography.fernet import Fernet


Environment = Literal["development", "test", "staging", "production"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: Environment = "development"
    app_name: str = "ElderShield API"
    app_version: str = "3.0.0"
    debug: bool = False
    log_level: str = "INFO"
    api_allowed_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000"
    )
    public_web_url: str = "http://localhost:3000"
    share_url_template: str = "http://localhost:8000/api/shares/{token}"
    database_url: str = "sqlite:///./eldershield.db"
    redis_url: str | None = None
    auto_create_schema: bool = True

    jwt_secret: str = "development-only-change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "eldershield-api"
    jwt_audience: str = "eldershield-client"
    access_token_minutes: int = Field(default=15, ge=5, le=60)
    refresh_token_days: int = Field(default=30, ge=1, le=90)
    encryption_key: str | None = None

    report_retention_days: int = Field(default=30, ge=1, le=365)
    audit_retention_days: int = Field(default=365, ge=30, le=2555)
    share_link_hours: int = Field(default=72, ge=1, le=720)
    share_link_max_accesses: int = Field(default=20, ge=1, le=1000)

    max_text_characters: int = Field(default=200_000, ge=1_000, le=2_000_000)
    max_upload_bytes: int = Field(
        default=10 * 1024 * 1024,
        ge=1024,
        le=50 * 1024 * 1024,
    )
    max_document_pages: int = Field(default=200, ge=1, le=2000)
    max_ocr_pages: int = Field(default=50, ge=1, le=500)
    max_image_pixels: int = Field(default=40_000_000, ge=1_000_000)
    ocr_timeout_seconds: int = Field(default=30, ge=5, le=300)
    rate_limit_requests: int = Field(default=120, ge=0, le=10_000)
    rate_limit_window_seconds: int = Field(default=60, ge=1, le=3600)
    auth_rate_limit_requests: int = Field(default=20, ge=1, le=1000)
    trust_proxy_headers: bool = False

    metrics_bearer_token: str | None = None
    sentry_dsn: str | None = None
    sentry_traces_sample_rate: float = Field(default=0.05, ge=0, le=1)

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.api_allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        if not self.is_production:
            return self

        errors: list[str] = []
        if len(self.jwt_secret) < 32 or "development-only" in self.jwt_secret:
            errors.append("JWT_SECRET must be a unique value of at least 32 characters")
        if not self.encryption_key:
            errors.append("ENCRYPTION_KEY must be configured")
        else:
            try:
                Fernet(self.encryption_key.encode("ascii"))
            except (ValueError, TypeError):
                errors.append("ENCRYPTION_KEY must be a valid Fernet key")
        if not self.database_url.startswith(("postgresql://", "postgresql+psycopg://")):
            errors.append("DATABASE_URL must use PostgreSQL")
        if not self.redis_url:
            errors.append("REDIS_URL must be configured")
        if self.auto_create_schema:
            errors.append("AUTO_CREATE_SCHEMA must be false; run Alembic migrations")
        if not self.allowed_origins:
            errors.append("API_ALLOWED_ORIGINS must contain at least one origin")
        if any(
            origin == "*" or "localhost" in origin or "127.0.0.1" in origin
            for origin in self.allowed_origins
        ):
            errors.append("API_ALLOWED_ORIGINS must contain only production origins")
        if self.public_web_url.startswith(("http://", "https://localhost")):
            errors.append("PUBLIC_WEB_URL must use the production HTTPS origin")
        if not self.public_web_url.startswith("https://"):
            errors.append("PUBLIC_WEB_URL must use HTTPS")
        if "{token}" not in self.share_url_template:
            errors.append("SHARE_URL_TEMPLATE must contain {token}")
        if not self.share_url_template.startswith("https://"):
            errors.append("SHARE_URL_TEMPLATE must use HTTPS")
        if not self.metrics_bearer_token or len(self.metrics_bearer_token) < 32:
            errors.append("METRICS_BEARER_TOKEN must be at least 32 characters")

        if errors:
            raise ValueError("Invalid production configuration: " + "; ".join(errors))
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Compatibility constants for modules that validate payload sizes at import time.
_settings = get_settings()
API_ALLOWED_ORIGINS = _settings.allowed_origins
MAX_TEXT_CHARACTERS = _settings.max_text_characters
MAX_UPLOAD_BYTES = _settings.max_upload_bytes
MAX_DOCUMENT_PAGES = _settings.max_document_pages
MAX_OCR_PAGES = _settings.max_ocr_pages
MAX_IMAGE_PIXELS = _settings.max_image_pixels
OCR_TIMEOUT_SECONDS = _settings.ocr_timeout_seconds
RATE_LIMIT_REQUESTS = _settings.rate_limit_requests
RATE_LIMIT_WINDOW_SECONDS = _settings.rate_limit_window_seconds

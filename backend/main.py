import hmac
import logging
import os
import shutil
import time
import uuid
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from redis.asyncio import Redis
from sqlalchemy import text

from app.db.models import Base
from app.db.session import SessionLocal, engine
from app.logging_config import configure_logging
from app.observability import HTTP_DURATION, HTTP_REQUESTS, RATE_LIMITED
from app.rate_limit import RateLimiter
from app.routes.analyze import router as analyze_router
from app.routes.auth import router as auth_router
from app.routes.reports import router as reports_router
from app.settings import Settings, get_settings


logger = logging.getLogger("eldershield.api")


def _client_ip(request: Request, settings: Settings) -> str:
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _request_id(request: Request) -> str:
    candidate = request.headers.get("X-Request-ID", "")
    if candidate and len(candidate) <= 128 and candidate.isascii():
        return candidate
    return uuid.uuid4().hex


def _path_group(path: str) -> str:
    if path.startswith("/api/auth/"):
        return "auth"
    if path.startswith("/api/shares/"):
        return "share"
    return "api"


def _safe_request_path(request: Request) -> str:
    route = getattr(request.scope.get("route"), "path", None)
    if route:
        return route
    if request.url.path.startswith("/api/shares/"):
        return "/api/shares/{token}"
    return request.url.path


def create_app(settings: Settings | None = None) -> FastAPI:
    active_settings = settings or get_settings()
    configure_logging(active_settings.log_level)

    if active_settings.sentry_dsn:
        sentry_sdk.init(
            dsn=active_settings.sentry_dsn,
            environment=active_settings.app_env,
            release=active_settings.app_version,
            traces_sample_rate=active_settings.sentry_traces_sample_rate,
            send_default_pii=False,
        )

    rate_limiter = RateLimiter(active_settings)

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if active_settings.auto_create_schema:
            Base.metadata.create_all(bind=engine)

        redis_client: Redis | None = None
        if active_settings.redis_url:
            redis_client = Redis.from_url(
                active_settings.redis_url,
                decode_responses=False,
                socket_connect_timeout=3,
                socket_timeout=3,
            )
            try:
                await redis_client.ping()
            except Exception:
                await redis_client.aclose()
                if active_settings.is_production:
                    raise RuntimeError("Redis is required but unavailable.")
                logger.exception("Redis unavailable; using process-local rate limiting")
                redis_client = None
        rate_limiter.set_redis(redis_client)
        application.state.redis = redis_client
        yield
        if redis_client is not None:
            await redis_client.aclose()

    application = FastAPI(
        title=active_settings.app_name,
        description=(
            "Structured linguistic risk extraction for legal and official documents"
        ),
        version=active_settings.app_version,
        debug=active_settings.debug,
        docs_url=None if active_settings.is_production else "/docs",
        redoc_url=None if active_settings.is_production else "/redoc",
        lifespan=lifespan,
    )
    application.state.settings = active_settings
    application.state.redis = None
    application.state.rate_limiter = rate_limiter

    application.add_middleware(
        CORSMiddleware,
        allow_origins=active_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=[
            "X-Request-ID",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
        ],
    )

    @application.middleware("http")
    async def request_controls(request: Request, call_next):
        request_id = _request_id(request)
        client_ip = _client_ip(request, active_settings)
        request.state.request_id = request_id
        started = time.perf_counter()

        if request.method != "OPTIONS" and request.url.path.startswith("/api/"):
            group = _path_group(request.url.path)
            limit = (
                active_settings.auth_rate_limit_requests
                if group == "auth"
                else active_settings.rate_limit_requests
            )
            try:
                rate = await rate_limiter.check(f"{group}:{client_ip}", limit)
            except Exception:
                logger.exception(
                    "Distributed rate limiter unavailable",
                    extra={"request_id": request_id, "path": _safe_request_path(request)},
                )
                return JSONResponse(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    content={"detail": "Request controls are temporarily unavailable."},
                    headers={"X-Request-ID": request_id, "Retry-After": "5"},
                )
            if not rate.allowed:
                RATE_LIMITED.labels(path_group=group).inc()
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Too many requests. Please wait and try again."},
                    headers={
                        "X-Request-ID": request_id,
                        "Retry-After": str(rate.retry_after),
                        "X-RateLimit-Limit": str(rate.limit),
                        "X-RateLimit-Remaining": "0",
                    },
                )
        else:
            rate = None

        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "Unhandled request error",
                extra={"request_id": request_id, "path": _safe_request_path(request)},
            )
            response = JSONResponse(
                status_code=500,
                content={"detail": "The request could not be completed."},
            )

        elapsed = time.perf_counter() - started
        route = _safe_request_path(request)
        HTTP_REQUESTS.labels(
            method=request.method,
            route=route,
            status=str(response.status_code),
        ).inc()
        HTTP_DURATION.labels(method=request.method, route=route).observe(elapsed)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        response.headers["Permissions-Policy"] = (
            "camera=(), geolocation=(), microphone=()"
        )
        if active_settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )
        if rate is not None:
            response.headers["X-RateLimit-Limit"] = str(rate.limit)
            response.headers["X-RateLimit-Remaining"] = str(rate.remaining)

        logger.info(
            "HTTP request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": route,
                "status_code": response.status_code,
                "duration_ms": round(elapsed * 1000, 1),
                "client_ip": client_ip,
            },
        )
        return response

    @application.get("/")
    def read_root():
        return {
            "status": "healthy",
            "service": active_settings.app_name,
            "version": active_settings.app_version,
            "docs": application.docs_url,
        }

    @application.get("/health/live")
    def liveness():
        return {"status": "healthy", "version": active_settings.app_version}

    @application.get("/health/ready")
    async def readiness():
        components: dict[str, str] = {}
        try:
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
            components["database"] = "ready"
        except Exception:
            components["database"] = "unavailable"

        if active_settings.redis_url:
            try:
                redis_client = application.state.redis
                if redis_client is None:
                    raise RuntimeError("Redis was not initialized.")
                await redis_client.ping()
                components["redis"] = "ready"
            except Exception:
                components["redis"] = "unavailable"
        else:
            components["redis"] = "not_configured"

        components["ocr"] = (
            "ready" if shutil.which("tesseract") else "not_configured"
        )
        required = ["database"]
        if active_settings.is_production:
            required.append("redis")
        ready = all(components[name] == "ready" for name in required)
        if not ready:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"status": "not_ready", "components": components},
            )
        return {"status": "ready", "components": components}

    @application.get("/health")
    def health():
        return {"status": "healthy", "version": active_settings.app_version}

    @application.get("/metrics", include_in_schema=False)
    def metrics(request: Request):
        configured_token = active_settings.metrics_bearer_token
        if configured_token:
            authorization = request.headers.get("Authorization", "")
            supplied = (
                authorization.removeprefix("Bearer ").strip()
                if authorization.startswith("Bearer ")
                else ""
            )
            if not hmac.compare_digest(supplied, configured_token):
                raise HTTPException(status_code=404, detail="Not found.")
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

    application.include_router(analyze_router, prefix="/api", tags=["Analysis"])
    application.include_router(auth_router, prefix="/api", tags=["Authentication"])
    application.include_router(reports_router, prefix="/api", tags=["Reports"])
    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=get_settings().app_env == "development",
        access_log=False,
    )

import pytest
from pydantic import ValidationError

from app.rate_limit import RateLimiter
from app.settings import Settings


def test_production_configuration_rejects_unsafe_defaults():
    with pytest.raises(ValidationError, match="Invalid production configuration"):
        Settings(app_env="production")


def test_production_configuration_accepts_required_controls():
    settings = Settings(
        app_env="production",
        jwt_secret="a-production-jwt-secret-that-is-long-and-unique",
        encryption_key="MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=",
        database_url="postgresql+psycopg://user:pass@db/app",
        redis_url="redis://redis:6379/0",
        auto_create_schema=False,
        api_allowed_origins="https://app.example.com",
        public_web_url="https://app.example.com",
        share_url_template="https://api.example.com/api/shares/{token}",
        metrics_bearer_token="a-long-production-metrics-token-123456",
    )

    assert settings.is_production


@pytest.mark.asyncio
async def test_memory_rate_limiter_enforces_limit():
    settings = Settings(
        app_env="test",
        rate_limit_window_seconds=60,
        rate_limit_requests=2,
    )
    limiter = RateLimiter(settings)
    assert (await limiter.check("client", 2)).allowed
    assert (await limiter.check("client", 2)).allowed
    blocked = await limiter.check("client", 2)
    assert not blocked.allowed
    assert blocked.remaining == 0

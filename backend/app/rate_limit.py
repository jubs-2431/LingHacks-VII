import asyncio
import time
from collections import defaultdict, deque
from dataclasses import dataclass

from redis.asyncio import Redis

from app.settings import Settings


_FIXED_WINDOW_SCRIPT = """
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return {current, ttl}
"""


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    limit: int
    remaining: int
    retry_after: int


class RateLimiter:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.redis: Redis | None = None
        self._memory: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    def set_redis(self, redis: Redis | None) -> None:
        self.redis = redis

    async def check(self, key: str, limit: int) -> RateLimitResult:
        if limit <= 0:
            return RateLimitResult(True, 0, 0, 0)
        if self.redis is not None:
            try:
                return await self._check_redis(key, limit)
            except Exception:
                if self.settings.is_production:
                    raise
        return await self._check_memory(key, limit)

    async def _check_redis(self, key: str, limit: int) -> RateLimitResult:
        window = self.settings.rate_limit_window_seconds
        bucket = int(time.time() // window)
        redis_key = f"eldershield:rate:{bucket}:{key}"
        current, ttl = await self.redis.eval(
            _FIXED_WINDOW_SCRIPT,
            1,
            redis_key,
            window + 1,
        )
        current = int(current)
        ttl = max(int(ttl), 1)
        return RateLimitResult(
            allowed=current <= limit,
            limit=limit,
            remaining=max(0, limit - current),
            retry_after=ttl,
        )

    async def _check_memory(self, key: str, limit: int) -> RateLimitResult:
        now = time.monotonic()
        window = self.settings.rate_limit_window_seconds
        async with self._lock:
            timestamps = self._memory[key]
            cutoff = now - window
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()
            allowed = len(timestamps) < limit
            if allowed:
                timestamps.append(now)
            retry_after = (
                max(1, int(window - (now - timestamps[0])))
                if timestamps
                else window
            )
            return RateLimitResult(
                allowed=allowed,
                limit=limit,
                remaining=max(0, limit - len(timestamps)),
                retry_after=retry_after,
            )

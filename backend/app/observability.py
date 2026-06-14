from prometheus_client import Counter, Histogram


HTTP_REQUESTS = Counter(
    "eldershield_http_requests_total",
    "HTTP requests processed by the API.",
    ("method", "route", "status"),
)
HTTP_DURATION = Histogram(
    "eldershield_http_request_duration_seconds",
    "HTTP request latency.",
    ("method", "route"),
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30),
)
RATE_LIMITED = Counter(
    "eldershield_rate_limited_total",
    "Requests rejected by the API rate limiter.",
    ("path_group",),
)

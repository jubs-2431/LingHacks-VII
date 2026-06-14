# Production Deployment

## Runtime Contract

Use Python 3.12, PostgreSQL, Redis, and Tesseract. Run Alembic before starting
API workers. The container entrypoint does this automatically.

Production configuration fails at startup unless:

- `JWT_SECRET` is unique and at least 32 characters;
- `ENCRYPTION_KEY` is a valid Fernet key;
- `DATABASE_URL` uses PostgreSQL;
- `REDIS_URL` is configured;
- `AUTO_CREATE_SCHEMA=false`;
- CORS contains only real production origins;
- `PUBLIC_WEB_URL` is HTTPS.
- `SHARE_URL_TEMPLATE` is HTTPS and contains `{token}`;
- `METRICS_BEARER_TOKEN` is at least 32 characters.

Generate secrets outside the repository:

```bash
openssl rand -hex 32
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Store them in a managed secret service. Rotating `ENCRYPTION_KEY` requires a
data re-encryption migration; changing it directly makes saved reports
unreadable.

Set `SHARE_URL_TEMPLATE` to the deployed frontend route, for example
`https://app.example.com/shared/{token}`. The frontend exchanges the token
with the API and displays the report in the normal results layout. Its origin
must match `PUBLIC_WEB_URL`.

## Deployment Order

1. Provision encrypted PostgreSQL and Redis with private networking.
2. Configure TLS at the load balancer or ingress.
3. Set the environment variables from `.env.example`.
4. Run `alembic upgrade head`.
5. Start the API and verify `/health/live` and `/health/ready`.
6. Restrict `/metrics` with `METRICS_BEARER_TOKEN` and network policy.
7. Schedule `python -m scripts.cleanup_expired` at least daily.
8. Enable encrypted backups and test restore procedures.

Set `TRUST_PROXY_HEADERS=true` only when direct access to the API is blocked
and the forwarding proxy overwrites client-IP headers.

## Operational Signals

- JSON logs contain request IDs, route templates, status, latency, and client
  IP. They never include document text.
- `/metrics` exports request rate, latency, and throttling counters.
- Sentry is optional through `SENTRY_DSN`; default PII collection is disabled.
- Readiness checks PostgreSQL and, in production, Redis.

Alert on sustained 5xx responses, readiness failures, high p95 latency,
repeated 429s, migration failures, cleanup failures, and backup failures.

## Data Handling

Public `/api/analyze` and extraction routes remain stateless. A document is
persisted only when an authenticated user explicitly calls `/api/reports`.
Saved filenames, text, analysis JSON, and page maps are encrypted before
database writes.
Reports and share links expire, can be revoked, and are removed by the cleanup
job.

The browser keeps access and refresh tokens in tab-scoped session storage.
They are cleared when the tab session ends; production deployments should
maintain a restrictive Content Security Policy and avoid third-party scripts.

The application does not upload document content to Kaggle, Sentry, an LLM, or
another third party.

## Release Requirements Outside Code

Production launch still requires:

- legal review of risk wording, category mappings, and jurisdiction claims;
- a privacy policy, terms, retention policy, and incident-response owner;
- an accessibility audit with target users;
- load testing sized to the chosen infrastructure;
- cloud IAM, firewall, backup, and disaster-recovery review;
- notification/email provider decisions if those features are added.

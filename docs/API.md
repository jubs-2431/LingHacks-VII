# Backend API

## Stateless Analysis

- `POST /api/analyze`: analyze text and optional page spans.
- `POST /api/extract-text`: extract text and page spans from PDF or image.
- `POST /api/analyze-document`: extract and analyze in one multipart request.
- `POST /api/simplify-clause`: explain one clause.

These routes do not persist document content.

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Passwords use Argon2. Access tokens are short-lived signed JWTs. Refresh tokens
are random opaque values stored only as SHA-256 hashes and rotated on use.

## Encrypted Reports

- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/{report_id}`
- `DELETE /api/reports/{report_id}`
- `POST /api/reports/{report_id}/shares`
- `DELETE /api/reports/{report_id}/shares/{share_id}`
- `GET /api/shares/{token}`

Report routes require a bearer access token except the final share-link route.
Share tokens are random, hashed at rest, expiring, access-limited, and
revocable.

Interactive OpenAPI documentation is available at `/docs` outside production.

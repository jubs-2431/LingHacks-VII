# ElderShield

ElderShield is an educational document-risk explainer for older adults, caregivers, and anyone who needs help finding burdens hidden in legal or official language.

It does not decide whether a document is legally valid and does not provide legal advice.

## Current Product

ElderShield accepts pasted text, PDFs, PNGs, and JPEGs. It:

- preserves exact source offsets and highlights matched phrases;
- detects multiple findings in the same clause;
- distinguishes obligations, prohibitions, and common negated statements;
- detects rights waivers, money risks, deadlines, proof burdens, ambiguity, data sharing, pressure language, and document-specific risks;
- extracts amounts, deadlines, actors, actions, and consequences when present;
- assigns severity and pattern confidence separately;
- provides a plain-language explanation and a question to ask for every finding;
- generates a printable checklist and downloadable text report;
- uses browser-native sharing for caregiver handoff without storing a cloud copy;
- supports text-to-speech and Elder Mode;
- performs OCR when Tesseract is installed.
- preserves PDF page provenance for every finding;
- supports authenticated, encrypted report retention with expiring,
  access-limited, revocable share links.

Document-specific rules currently cover leases, insurance forms, medical consent, financial agreements, and terms/privacy documents.

## Architecture

```text
Upload or pasted text
        |
Validated document extraction and optional OCR
        |
Offset-preserving sentence and clause segmentation
        |
Generic rules + document-specific rules
        |
Negation filtering and multi-label findings
        |
Structured detail extraction
        |
Severity + confidence + grounded explanation
        |
Exact phrase highlights, checklist, report, and sharing
```

Public analysis remains stateless. Uploaded files are never stored. An
authenticated user can explicitly save an encrypted report; retention and
sharing are controlled by expiration and revocation.

## Run Locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt
python3 main.py
```

The API runs at `http://localhost:8000`; Swagger is available at `http://localhost:8000/docs`.

For scanned PDFs and images, install Tesseract:

```bash
brew install tesseract
```

The server still works without Tesseract, but image OCR is unavailable and scanned PDF pages produce a warning.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

The app runs at `http://localhost:3000`.

### Docker

Docker includes PostgreSQL, Redis, Tesseract, automatic migrations, the API,
and the frontend:

```bash
docker compose up --build
```

## Verification

```bash
cd backend
pytest -q
alembic check
ruff check .
pip-audit -r requirements.txt

cd ../frontend
npm run lint
npm run typecheck
npm run build
npm audit
```

GitHub Actions runs these checks on pushes and pull requests.

## Configuration

Copy `.env.example` values into your deployment environment. Important settings:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `API_ALLOWED_ORIGINS`
- `MAX_UPLOAD_BYTES`
- `MAX_TEXT_CHARACTERS`
- `RATE_LIMIT_REQUESTS`
- `RATE_LIMIT_WINDOW_SECONDS`
- `NEXT_PUBLIC_API_URL`

## Safety and Limitations

- Findings are linguistic indicators, not legal conclusions.
- Pattern confidence measures match specificity, not the chance that a court would enforce a clause.
- Rules can still miss unusual wording or produce false positives.
- “No supported patterns detected” never means “safe to sign.”
- Saving is opt-in; public analysis does not persist content.
- Share links expose the report to anyone holding the token until the link
  expires, reaches its access limit, or is revoked.
- Any future LLM integration must be opt-in, receive only the minimum necessary clause text, remain grounded in deterministic findings, and never invent legal conclusions.

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md), [docs/API.md](docs/API.md),
[docs/PRODUCTION.md](docs/PRODUCTION.md), and
[docs/EVALUATION.md](docs/EVALUATION.md).

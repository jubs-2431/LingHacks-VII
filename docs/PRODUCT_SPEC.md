# ElderShield Product Specification

## Product Goal

Help a user identify language that may create an obligation, cost, deadline, loss of rights, privacy consequence, or practical burden before signing an official document.

The product should produce evidence-backed questions, not legal conclusions.

## Primary Users

- Older adults reviewing documents independently.
- Caregivers helping a family member prepare questions.
- People with low legal literacy, limited vision, or reading fatigue.

## Required Workflow

1. The user selects a document type.
2. The user pastes text or uploads a supported document.
3. The system reports extraction limitations before analysis.
4. The system highlights exact trigger phrases.
5. A clause can produce more than one finding.
6. Every finding includes category, severity, pattern confidence, plain meaning, rationale, and a question.
7. The user can print, download, listen to, or explicitly share the report.

## Functional Requirements

### Ingestion

- Accept text, PDF, PNG, and JPEG input.
- Reject empty, unsupported, spoofed, and oversized input.
- Use OCR for image-only content when available.
- Never silently omit unreadable pages.

### Linguistic Analysis

- Preserve source character offsets.
- Detect positive obligations and prohibitions.
- Suppress common negated risk statements.
- Return all applicable categories for a clause.
- Use document-specific rules where context changes meaning.
- Extract amounts, deadlines, actors, actions, and consequences when supported by text.

### Result Safety

- Separate severity from confidence.
- Avoid claiming a document is safe.
- Explain what text triggered each finding.
- Generate questions from extracted evidence when possible.
- Display limitations in normal and printed reports.

### Privacy and Security

- Do not persist uploaded files or public analysis requests.
- Persist a report only after an authenticated, explicit save action.
- Encrypt saved text, analysis, and page maps at the application layer.
- Expire and revoke saved reports and share links.
- Do not log document contents.
- Limit upload and text sizes.
- Restrict production CORS origins.
- Rate-limit public API routes.
- Send no content to third parties without an explicit user action.

## Non-Goals

- Predicting court outcomes.
- Replacing an attorney.
- Automatically signing, negotiating, or submitting documents.
- Sending sensitive documents through unconfigured email or public links.
- Using an LLM as an ungrounded legal classifier.

## Success Measures

- High recall on severe rights, housing, medical, and financial examples.
- Low false-positive rate on common negations.
- Every displayed highlight maps exactly to source text.
- No result path uses “safe” or equivalent reassurance.
- All supported document types have regression examples.
- CI blocks changes that break API contracts, lint, types, or production builds.

## Next Product Work

1. Complete legal review of the labeled evaluation corpus and CUAD mapping.
2. Establish measured release thresholds by document type.
3. Add jurisdiction-aware rule packs after legal review.
4. Integrate authenticated report workflows into the product UI.
5. Add an opt-in grounded explanation model only after deterministic accuracy targets are met.

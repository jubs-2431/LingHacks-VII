# Analysis Evaluation Plan

## Why Evaluation Is Required

Rule count is not an accuracy metric. ElderShield needs a labeled corpus that measures both missed risks and false alarms before its language can be described as reliable.

## Corpus Structure

Maintain examples for:

- rights waivers and explicit retention of rights;
- fees, refunds, renewals, and “no fee” statements;
- deadlines with days, dates, renewal windows, and grace periods;
- obligations, permissions, prohibitions, and negated obligations;
- privacy consent and explicit non-sharing promises;
- leases, insurance, medical consent, financial agreements, and online terms;
- clauses containing several simultaneous risks;
- scanned and digitally generated documents.

Each example should include:

- document type;
- expected categories;
- expected severity range;
- exact trigger offsets;
- expected structured details;
- reviewer notes.

## Metrics

- Category precision, recall, and F1.
- High-severity recall.
- Negation false-positive rate.
- Trigger-span exact match and overlap.
- Structured amount and deadline extraction accuracy.
- OCR page success rate.
- Explanation faithfulness: every statement must be supported by the source clause.

## Release Gates

- No known false reassurance wording.
- All regression tests pass.
- Severe-category recall is reviewed manually.
- No unresolved high or critical dependency vulnerabilities.
- Changes to rules include positive, negative, and multi-risk tests.

## External Corpus

CUAD is available through the configured Kaggle account for offline diagnostic
evaluation. Its CC BY 4.0 provenance and limitations are recorded in
`backend/evaluation/manifest.json`. CUAD labels do not directly equal
ElderShield risk categories, so mapped-span recall is not a release gate until
the mapping is reviewed by legal subject-matter experts.

# Evaluation Data

Evaluation corpora are downloaded locally and excluded from Git.

## CUAD

`manifest.json` records the source, license, retrieval date, and limitations.
The Kaggle mirror is CC BY 4.0 and points to the canonical Zenodo release.

```bash
cd backend
python -m evaluation.download_cuad
python -m evaluation.evaluate_cuad --limit 25
```

The CUAD adapter reports overlap recall only for a conservative subset of
labels. It is diagnostic because CUAD reviews commercial-contract provisions,
while ElderShield identifies user-facing burdens. A legal reviewer must approve
the mapping before any metric becomes a release gate.

`cuad_baseline.json` records the reproducible 25-document engineering baseline
for analysis version 2.1.0. It measures mapped-span recall only, not precision
or legal correctness.

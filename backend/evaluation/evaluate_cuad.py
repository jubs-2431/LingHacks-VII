import argparse
import json
import re
from pathlib import Path

from app.nlp.risk_detector import analyze_document_text


ROOT = Path(__file__).resolve().parent
DEFAULT_DATASET = ROOT / "data" / "cuad" / "CUAD_v1.json"
CATEGORY_PATTERN = re.compile(r'related to "([^"]+)"')

# This is intentionally conservative. These CUAD labels have a defensible
# relationship to ElderShield's user-facing linguistic categories.
CATEGORY_MAP = {
    "Anti-Assignment": {"Rights Waiver", "Obligation Burden"},
    "Audit Rights": {"Proof Burden", "Obligation Burden"},
    "Change Of Control": {"Rights Waiver", "Obligation Burden"},
    "Data Privacy": {"Permission/Data Sharing"},
    "Exclusivity": {"Rights Waiver", "Obligation Burden"},
    "Insurance": {"Proof Burden", "Obligation Burden", "Money Risk"},
    "Liquidated Damages": {"Money Risk"},
    "Minimum Commitment": {"Money Risk", "Obligation Burden"},
    "Most Favored Nation": {"Money Risk", "Obligation Burden"},
    "No-Solicit Of Customers": {"Rights Waiver", "Obligation Burden"},
    "No-Solicit Of Employees": {"Rights Waiver", "Obligation Burden"},
    "Non-Compete": {"Rights Waiver", "Obligation Burden"},
    "Notice Period To Terminate Renewal": {"Deadline Burden"},
    "Payment Terms": {"Money Risk", "Deadline Burden"},
    "Post-Termination Services": {"Obligation Burden"},
    "Price Restrictions": {"Money Risk"},
    "Renewal Term": {"Deadline Burden", "Obligation Burden"},
    "Revenue/Profit Sharing": {"Money Risk"},
    "Termination For Convenience": {"Rights Waiver"},
    "Uncapped Liability": {"Money Risk", "Rights Waiver"},
}


def overlaps(start: int, end: int, finding: dict) -> bool:
    return start < finding["end_offset"] and end > finding["start_offset"]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Measure diagnostic ElderShield overlap recall on mapped CUAD spans."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--limit", type=int, default=25)
    args = parser.parse_args()

    payload = json.loads(args.dataset.read_text())
    documents = payload["data"][: args.limit if args.limit > 0 else None]
    expected_spans = 0
    matched_spans = 0
    category_counts: dict[str, dict[str, int]] = {}

    for document in documents:
        paragraph = document["paragraphs"][0]
        context = paragraph["context"]
        findings = analyze_document_text(context)["clauses"]
        for qa in paragraph["qas"]:
            match = CATEGORY_PATTERN.search(qa["question"])
            cuad_category = match.group(1) if match else None
            expected_categories = CATEGORY_MAP.get(cuad_category or "")
            if not expected_categories:
                continue
            stats = category_counts.setdefault(
                cuad_category,
                {"expected": 0, "matched": 0},
            )
            for answer in qa["answers"]:
                start = int(answer["answer_start"])
                end = start + len(answer["text"])
                expected_spans += 1
                stats["expected"] += 1
                if any(
                    finding["risk_type"] in expected_categories
                    and overlaps(start, end, finding)
                    for finding in findings
                ):
                    matched_spans += 1
                    stats["matched"] += 1

    result = {
        "documents": len(documents),
        "mapped_expected_spans": expected_spans,
        "mapped_matched_spans": matched_spans,
        "mapped_span_recall": (
            round(matched_spans / expected_spans, 4) if expected_spans else None
        ),
        "categories": category_counts,
        "warning": (
            "Diagnostic only. CUAD label semantics and ElderShield categories differ."
        ),
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

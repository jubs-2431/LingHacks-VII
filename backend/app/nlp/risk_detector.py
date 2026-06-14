import hashlib
import re
from collections import defaultdict
from dataclasses import dataclass

from app.nlp.clause_splitter import ClauseSpan, split_into_clause_spans
from app.nlp.explanations import get_explanation
from app.nlp.risk_patterns import ALL_RULES, RiskRule
from app.nlp.severity import SEVERITY_RANK, highest_severity, score_clause


ANALYSIS_VERSION = "2.1.0"
DISCLAIMER = (
    "ElderShield identifies language patterns for educational purposes. "
    "It does not determine legal validity or provide legal advice."
)


@dataclass(frozen=True)
class RuleMatch:
    rule: RiskRule
    text: str
    start: int
    end: int


_NEGATION_BEFORE = re.compile(
    r"(?:\bno\s+|\bnever\s+|\bwithout\s+|\bnot\s+(?:\w+\s+){0,3}|"
    r"\b(?:does|do|did|will|shall|is|are|was|were)\s+not\s+(?:\w+\s+){0,3})$",
    re.IGNORECASE,
)
_AMOUNT_PATTERN = re.compile(
    r"(?:\$\s*\d[\d,]*(?:\.\d{1,2})?|\b\d+(?:\.\d+)?\s*(?:%|percent)\b)",
    re.IGNORECASE,
)
_DEADLINE_PATTERN = re.compile(
    r"\b(?:within\s+\d+\s+(?:business\s+|calendar\s+)?(?:days?|weeks?|months?)|"
    r"at\s+least\s+\d+\s+(?:business\s+|calendar\s+)?(?:days?|weeks?|months?)\s+before[^,.;]*|"
    r"no\s+later\s+than[^,.;]*|by\s+(?:[A-Z][a-z]+\s+\d{1,2}(?:,\s+\d{4})?|\d{1,2}/\d{1,2}/\d{2,4}))",
    re.IGNORECASE,
)
_MODAL_ACTION_PATTERN = re.compile(
    r"(?P<actor>you|we|the\s+(?:tenant|landlord|patient|borrower|lender|customer|"
    r"user|provider|insurer|member|applicant|company|organization|resident))\s+"
    r"(?P<modal>must|shall|may\s+not|must\s+not|shall\s+not|cannot|"
    r"is\s+required\s+to|are\s+required\s+to|agrees?\s+to|is\s+responsible\s+for)\s+"
    r"(?P<action>[^.;]{2,160})",
    re.IGNORECASE,
)
_CONSEQUENCE_PATTERN = re.compile(
    r"\b(?:may|will|can)\s+(?:result\s+in|lead\s+to|cause)\s+([^.;]{2,140})|"
    r"\bfailure\s+to\s+[^.;]{2,100}?\s+(?:may|will)\s+([^.;]{2,140})",
    re.IGNORECASE,
)


def _unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        clean = re.sub(r"\s+", " ", value).strip()
        key = clean.casefold()
        if clean and key not in seen:
            seen.add(key)
            result.append(clean)
    return result


def _is_negated(clause: str, match: re.Match[str], rule: RiskRule) -> bool:
    if not rule.negation_sensitive:
        return False
    before = clause[max(0, match.start() - 70):match.start()]
    return _NEGATION_BEFORE.search(before) is not None


def _rules_for(document_type: str) -> tuple[RiskRule, ...]:
    return tuple(
        rule
        for rule in ALL_RULES
        if not rule.document_types or document_type in rule.document_types
    )


def _find_rule_matches(clause: ClauseSpan, document_type: str) -> list[RuleMatch]:
    matches: list[RuleMatch] = []
    for rule in _rules_for(document_type):
        for match in re.finditer(rule.pattern, clause.text, flags=re.IGNORECASE):
            if _is_negated(clause.text, match, rule):
                continue
            matches.append(
                RuleMatch(
                    rule=rule,
                    text=match.group(0),
                    start=clause.start + match.start(),
                    end=clause.start + match.end(),
                )
            )
    return matches


def extract_structured_details(clause: str) -> dict[str, list[str]]:
    details: dict[str, list[str]] = {}

    amounts = _unique(match.group(0) for match in _AMOUNT_PATTERN.finditer(clause))
    deadlines = _unique(match.group(0) for match in _DEADLINE_PATTERN.finditer(clause))

    actors: list[str] = []
    actions: list[str] = []
    for match in _MODAL_ACTION_PATTERN.finditer(clause):
        actors.append(match.group("actor"))
        actions.append(f"{match.group('modal')} {match.group('action')}")

    consequences: list[str] = []
    for match in _CONSEQUENCE_PATTERN.finditer(clause):
        consequence = match.group(1) or match.group(2)
        if consequence:
            consequences.append(consequence)

    for key, values in (
        ("amounts", amounts),
        ("deadlines", deadlines),
        ("actors", _unique(actors)),
        ("actions", _unique(actions)),
        ("consequences", _unique(consequences)),
    ):
        if values:
            details[key] = values

    return details


def _finding_id(
    clause: ClauseSpan,
    category: str,
    trigger_spans: list[dict[str, int | str]],
) -> str:
    fingerprint = "|".join(
        [str(clause.start), str(clause.end), category]
        + [f"{span['start']}:{span['end']}" for span in trigger_spans]
    )
    return f"finding_{hashlib.sha256(fingerprint.encode()).hexdigest()[:12]}"


def _analyze_clause(clause: ClauseSpan, document_type: str) -> list[dict]:
    by_category: dict[str, list[RuleMatch]] = defaultdict(list)
    for match in _find_rule_matches(clause, document_type):
        by_category[match.rule.category].append(match)

    details = extract_structured_details(clause.text)
    findings: list[dict] = []

    for category, matches in by_category.items():
        ordered = sorted(matches, key=lambda item: (item.start, item.end))
        trigger_spans: list[dict[str, int | str]] = []
        seen_spans: set[tuple[int, int]] = set()
        for match in ordered:
            key = (match.start, match.end)
            if key in seen_spans:
                continue
            seen_spans.add(key)
            trigger_spans.append(
                {"start": match.start, "end": match.end, "text": match.text}
            )

        trigger_terms = _unique([match.text for match in ordered])
        base_severity = highest_severity([match.rule.severity for match in ordered])
        severity = score_clause(clause.text, category, trigger_terms, base_severity)
        confidence = round(max(match.rule.confidence for match in ordered), 2)
        explanation = get_explanation(category, trigger_terms, details)

        findings.append(
            {
                "id": _finding_id(clause, category, trigger_spans),
                "text": clause.text,
                "start_offset": clause.start,
                "end_offset": clause.end,
                "risk_type": category,
                "severity": severity,
                "confidence": confidence,
                "trigger_terms": trigger_terms,
                "trigger_spans": trigger_spans,
                "plain_english": explanation["plain"],
                "why_it_matters": explanation["why"],
                "question_to_ask": explanation["question"],
                "details": details,
            }
        )

    return sorted(
        findings,
        key=lambda item: (-SEVERITY_RANK[item["severity"]], -item["confidence"], item["risk_type"]),
    )


def _summary(risk_counts: dict[str, int], findings: list[dict]) -> str:
    total = len(findings)
    if not total:
        return (
            "No supported risk patterns were detected. This does not mean the "
            "document is risk-free; unsupported or unusual language may still matter."
        )

    category_stats: dict[str, tuple[int, int]] = {}
    for finding in findings:
        category = finding["risk_type"]
        current_rank, current_count = category_stats.get(category, (0, 0))
        category_stats[category] = (
            max(current_rank, SEVERITY_RANK[finding["severity"]]),
            current_count + 1,
        )
    categories = sorted(
        category_stats,
        key=lambda category: (
            -category_stats[category][0],
            -category_stats[category][1],
            category,
        ),
    )
    category_text = ", ".join(categories[:3])
    if len(categories) > 3:
        category_text += f", and {len(categories) - 3} more"

    return (
        f"ElderShield found {total} potential risk finding{'s' if total != 1 else ''}: "
        f"{risk_counts['high']} high, {risk_counts['medium']} medium, and "
        f"{risk_counts['low']} low. Main areas include {category_text}."
    )


def analyze_document_text(
    text: str,
    document_type: str = "other",
    warnings: list[str] | None = None,
    page_spans: list[dict] | None = None,
) -> dict:
    clause_spans = split_into_clause_spans(text)
    findings: list[dict] = []
    for clause in clause_spans:
        findings.extend(_analyze_clause(clause, document_type))

    findings.sort(
        key=lambda item: (
            item["start_offset"],
            -SEVERITY_RANK[item["severity"]],
            item["risk_type"],
        )
    )

    risk_counts = {"high": 0, "medium": 0, "low": 0}
    category_counts: dict[str, int] = defaultdict(int)
    checklist: list[str] = []
    seen_questions: set[str] = set()

    for finding in findings:
        finding["page_numbers"] = [
            int(page["page_number"])
            for page in (page_spans or [])
            if finding["start_offset"] < int(page["end"])
            and finding["end_offset"] > int(page["start"])
        ]
        risk_counts[finding["severity"]] += 1
        category_counts[finding["risk_type"]] += 1
        question = finding["question_to_ask"]
        if question not in seen_questions:
            seen_questions.add(question)
            checklist.append(question)

    return {
        "analysis_version": ANALYSIS_VERSION,
        "document_type": document_type,
        "summary": _summary(risk_counts, findings),
        "risk_counts": risk_counts,
        "category_counts": dict(category_counts),
        "clauses": findings,
        "checklist": checklist,
        "warnings": warnings or [],
        "disclaimer": DISCLAIMER,
        "document_stats": {
            "characters": len(text),
            "words": len(re.findall(r"\b\w+\b", text)),
            "clauses_reviewed": len(clause_spans),
            "findings": len(findings),
        },
    }

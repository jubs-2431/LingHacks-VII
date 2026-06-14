import re


SEVERITY_RANK = {"low": 1, "medium": 2, "high": 3}


def highest_severity(values: list[str]) -> str:
    if not values:
        return "low"
    return max(values, key=lambda value: SEVERITY_RANK[value])


def score_clause(
    clause: str,
    risk_type: str,
    matches: list[str],
    base_severity: str = "low",
) -> str:
    """Apply transparent consequence-based adjustments to a rule's base score."""
    score = SEVERITY_RANK.get(base_severity, 1)
    text = clause.lower()

    if risk_type in {"Rights Waiver", "Housing Stability", "Medical Consent", "Financial Liability"}:
        score = max(score, 3)

    severe_consequences = (
        "eviction",
        "termination",
        "collections",
        "lien",
        "garnishment",
        "loss of coverage",
        "non-refundable",
        "personal guarantee",
    )
    if any(term in text for term in severe_consequences):
        score = 3

    amounts = [
        float(raw.replace(",", ""))
        for raw in re.findall(r"\$\s*([0-9][0-9,]*(?:\.\d{1,2})?)", clause)
    ]
    if risk_type in {"Money Risk", "Financial Liability"} and amounts and max(amounts) >= 1000:
        score = min(3, score + 1)

    if risk_type == "Ambiguity Burden" and not any(
        phrase in text for phrase in ("sole discretion", "at our discretion", "at its discretion")
    ):
        score = min(score, 1)

    return {rank: label for label, rank in SEVERITY_RANK.items()}[score]

def score_clause(clause: str, risk_type: str, matches: list[str]) -> str:
    high_terms = [
        "waive", "waiver", "binding arbitration", "arbitration", "class action",
        "eviction", "termination", "non-refundable", "non refundable", "lien",
        "collections", "disclose personal information", "sell your data", "jury trial",
        "right to sue", "hold harmless", "release from liability",
    ]
    medium_terms = [
        "fee", "fees", "penalty", "penalties", "charged", "charge", "within",
        "days", "deadline", "prior to", "documentation", "evidence", "proof",
        "subject to review", "authorize", "auto-renew", "auto renew",
        "automatic renewal", "automatically renew", "due date", "expiration",
        "third party", "third-party", "personal information",
    ]

    text = clause.lower()
    matched_text = " ".join(match.lower() for match in matches)
    combined = f"{matched_text} {text}"

    if any(term in combined for term in high_terms):
        return "high"
    if any(term in combined for term in medium_terms):
        return "medium"

    if risk_type in {"Rights Waiver", "Money Risk"}:
        return "medium"

    return "low"

def score_clause(clause: str, risk_type: str, matches: list[str]) -> str:
    # Key legal vocabulary indicating severity
    high_terms = [
        "waive", "binding arbitration", "class action", "eviction", 
        "termination", "non-refundable", "lien", "collections", 
        "disclose personal information", "sell your data", "jury trial",
        "right to sue", "hold harmless", "release from liability"
    ]
    medium_terms = [
        "fee", "penalty", "charged", "within", "days", "deadline", 
        "prior to", "documentation", "evidence", "proof", "subject to review", 
        "authorize", "auto-renew", "due date", "expiration"
    ]

    text = clause.lower()

    # First check matches
    for match in matches:
        m = match.lower()
        if any(term in m for term in high_terms):
            return "high"
        if any(term in m for term in medium_terms):
            return "medium"

    # Then check the clause text
    if any(term in text for term in high_terms):
        return "high"
    if any(term in text for term in medium_terms):
        return "medium"
        
    return "low"

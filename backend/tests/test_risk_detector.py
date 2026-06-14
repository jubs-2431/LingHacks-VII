from app.nlp.risk_detector import analyze_document_text


SAMPLE_TEXT = (
    "By signing this agreement, you agree to resolve all disputes through "
    "binding arbitration and waive your right to participate in any class action. "
    "This agreement will automatically renew unless cancelled in writing at least "
    "30 days before the renewal date. Failure to submit payment within 10 business "
    "days may result in late fees. We may share your information with third-party "
    "service providers as needed. Additional documentation may be required at our "
    "discretion."
)


def categories(result: dict) -> set[str]:
    return {finding["risk_type"] for finding in result["clauses"]}


def test_readme_sample_covers_claimed_risk_types():
    result = analyze_document_text(SAMPLE_TEXT, "terms")

    assert {
        "Rights Waiver",
        "Money Risk",
        "Deadline Burden",
        "Proof Burden",
        "Ambiguity Burden",
        "Permission/Data Sharing",
        "Pressure Language",
        "Obligation Burden",
    }.issubset(categories(result))
    assert result["risk_counts"]["high"] >= 1
    assert result["document_stats"]["findings"] == len(result["clauses"])


def test_negated_risk_language_is_not_flagged():
    result = analyze_document_text(
        "You do not waive your right to sue. There is no fee for cancellation. "
        "We will not share your personal information with third parties."
    )

    assert result["clauses"] == []
    assert "does not mean the document is risk-free" in result["summary"]


def test_modality_and_prohibition_are_detected():
    result = analyze_document_text(
        "You must submit the form. You may not cancel the service."
    )

    obligations = [
        finding for finding in result["clauses"]
        if finding["risk_type"] == "Obligation Burden"
    ]
    assert len(obligations) == 2
    assert {term for finding in obligations for term in finding["trigger_terms"]} == {
        "must",
        "may not",
    }


def test_one_clause_can_have_multiple_findings():
    result = analyze_document_text(
        "You waive your right to sue and must pay a $1,500 penalty within 10 business days."
    )

    assert {
        "Rights Waiver",
        "Money Risk",
        "Deadline Burden",
        "Obligation Burden",
    }.issubset(categories(result))
    assert any(
        finding["details"].get("amounts") == ["$1,500"]
        for finding in result["clauses"]
    )


def test_offsets_point_to_exact_trigger_text():
    text = "  Intro text. You must pay a fee within 10 days.  "
    result = analyze_document_text(text)

    for finding in result["clauses"]:
        assert text[finding["start_offset"]:finding["end_offset"]] == finding["text"]
        for span in finding["trigger_spans"]:
            assert text[span["start"]:span["end"]] == span["text"]


def test_document_type_enables_domain_rules():
    text = "The landlord may terminate the tenancy and evict the tenant."

    lease_result = analyze_document_text(text, "lease")
    generic_result = analyze_document_text(text, "other")

    assert "Housing Stability" in categories(lease_result)
    assert "Housing Stability" not in categories(generic_result)


def test_finding_ids_are_stable():
    text = "You must pay a $50 fee within 10 days."
    first = analyze_document_text(text, "financial")
    second = analyze_document_text(text, "financial")

    assert [finding["id"] for finding in first["clauses"]] == [
        finding["id"] for finding in second["clauses"]
    ]


def test_findings_include_source_page_numbers():
    text = "No concerns on page one.\n\nYou must pay a $50 fee within 10 days."
    page_two_start = text.index("You must")
    result = analyze_document_text(
        text,
        "financial",
        page_spans=[
            {
                "page_number": 1,
                "start": 0,
                "end": page_two_start - 2,
                "used_ocr": False,
            },
            {
                "page_number": 2,
                "start": page_two_start,
                "end": len(text),
                "used_ocr": False,
            },
        ],
    )

    assert result["clauses"]
    assert all(finding["page_numbers"] == [2] for finding in result["clauses"])


def test_commercial_restrictions_and_audit_burdens_are_detected():
    result = analyze_document_text(
        "Distributor will not solicit any customer or hire any employee for "
        "twelve months. The company may audit relevant records to confirm "
        "compliance. Nothing shall limit the distributor's liability for fraud."
    )

    assert {"Rights Waiver", "Proof Burden", "Financial Liability"}.issubset(
        categories(result)
    )


def test_general_nonsharing_promise_is_not_treated_as_prohibition():
    result = analyze_document_text(
        "We will not share your personal information with third parties."
    )

    assert result["clauses"] == []

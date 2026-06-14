from collections.abc import Mapping


EXPLANATION_TEMPLATES = {
    "Rights Waiver": {
        "plain": "This may limit a legal right or change how you can bring a dispute.",
        "why": "Rights waivers can restrict court access, group claims, appeals, or recovery if something goes wrong.",
        "question": "Which rights am I giving up, and is there a written way to opt out?",
    },
    "Money Risk": {
        "plain": "This creates or may create a payment, fee, renewal, or refund obligation.",
        "why": "The clause may increase what you owe or continue charges unless you take action.",
        "question": "What is the total possible cost, and exactly how can I avoid or cancel it?",
    },
    "Deadline Burden": {
        "plain": "This requires action within a stated period or before a deadline.",
        "why": "Missing the deadline may affect money, coverage, services, or other rights.",
        "question": "What is the exact deadline, how is it calculated, and what happens if I miss it?",
    },
    "Proof Burden": {
        "plain": "This requires records, evidence, or verification from you.",
        "why": "Your request or eligibility may depend on producing specific paperwork in an accepted format.",
        "question": "Which exact documents are accepted, and when and how must I submit them?",
    },
    "Ambiguity Burden": {
        "plain": "This uses an open-ended standard or gives another party discretion.",
        "why": "The requirement may be applied or changed without a precise, objective rule.",
        "question": "Can the conditions and limits be stated specifically in writing?",
    },
    "Permission/Data Sharing": {
        "plain": "This permits collection, use, release, or sharing of personal information.",
        "why": "Your information may move beyond the organization you gave it to or be used for additional purposes.",
        "question": "What information is involved, who receives it, why, and can I opt out?",
    },
    "Pressure Language": {
        "plain": "This uses urgency or a threatened consequence to push quick action.",
        "why": "Pressure can make it harder to verify the request or understand available choices.",
        "question": "Can I verify this request independently, and is there a review or grace period?",
    },
    "Obligation Burden": {
        "plain": "This states something you are required or forbidden to do.",
        "why": "A mandatory action or prohibition can create consequences if you do not comply.",
        "question": "What exactly must I do, by when, and what happens if I cannot comply?",
    },
    "Housing Stability": {
        "plain": "This may affect whether you can remain in the property.",
        "why": "Termination or eviction language can put housing stability at risk.",
        "question": "What notice, cure period, and appeal rights apply before the tenancy can end?",
    },
    "Property Access": {
        "plain": "This describes when another party may enter or access the property.",
        "why": "Broad access rights may reduce privacy or provide limited advance notice.",
        "question": "How much notice is required, for which reasons, and are emergencies treated differently?",
    },
    "Coverage Limitation": {
        "plain": "This may exclude, delay, or condition insurance coverage.",
        "why": "A service or claim may not be paid unless specific coverage rules are met.",
        "question": "What is excluded, what approval is required, and how can a denial be appealed?",
    },
    "Medical Consent": {
        "plain": "This asks for consent to medical treatment or a procedure.",
        "why": "Consent should identify the procedure, important risks, alternatives, and the ability to withdraw.",
        "question": "What are the material risks, alternatives, and limits of this consent?",
    },
    "Financial Liability": {
        "plain": "This may put your assets or personal finances at risk.",
        "why": "Collateral, guarantees, or acceleration terms can extend liability beyond regular payments.",
        "question": "Which assets are at risk, what triggers liability, and is there a cap?",
    },
    "Unilateral Change": {
        "plain": "This may let the other party change terms without a new agreement.",
        "why": "Important obligations, prices, or rights could change after you initially accept.",
        "question": "How will I be notified, and can I reject a change without penalty?",
    },
}


TERM_SPECIFIC_TEMPLATES = {
    "binding arbitration": {
        "plain": "Disputes may have to go through private arbitration instead of court.",
        "why": "Arbitration can limit a public trial, jury access, discovery, appeal rights, or group claims.",
        "question": "Is arbitration mandatory, who selects and pays the arbitrator, and can I opt out?",
    },
    "automatic renewal": {
        "plain": "The agreement may renew and continue charges unless you cancel correctly and on time.",
        "why": "You may owe another term's payment if the cancellation method or deadline is missed.",
        "question": "What is the renewal date, price, cancellation deadline, and required cancellation method?",
    },
    "automatically renew": {
        "plain": "The agreement may renew and continue charges unless you cancel correctly and on time.",
        "why": "You may owe another term's payment if the cancellation method or deadline is missed.",
        "question": "What is the renewal date, price, cancellation deadline, and required cancellation method?",
    },
    "auto-renew": {
        "plain": "The agreement may renew and continue charges unless you cancel correctly and on time.",
        "why": "You may owe another term's payment if the cancellation method or deadline is missed.",
        "question": "What is the renewal date, price, cancellation deadline, and required cancellation method?",
    },
    "personal guarantee": {
        "plain": "You may be personally responsible for a debt even if another person or business borrowed it.",
        "why": "The creditor may pursue your personal income or assets after a default.",
        "question": "What is the maximum personal liability, and when does the guarantee end?",
    },
}


def _first(details: Mapping[str, list[str]], key: str) -> str | None:
    values = details.get(key, [])
    return values[0] if values else None


def get_explanation(
    risk_type: str,
    matches: list[str],
    details: Mapping[str, list[str]] | None = None,
) -> dict[str, str]:
    details = details or {}
    for match in matches:
        lower_match = match.lower()
        for term, template in TERM_SPECIFIC_TEMPLATES.items():
            if term in lower_match:
                return dict(template)

    template = dict(
        EXPLANATION_TEMPLATES.get(
            risk_type,
            {
                "plain": "This language may create a legal, financial, or practical burden.",
                "why": "The clause should be clarified before you rely on or accept it.",
                "question": "What does this require, and can the requirement be stated more clearly?",
            },
        )
    )

    amount = _first(details, "amounts")
    deadline = _first(details, "deadlines")
    action = _first(details, "actions")

    if risk_type == "Money Risk" and amount:
        template["question"] = f"Under what conditions would I owe {amount}, and is that the maximum charge?"
    elif risk_type == "Deadline Burden" and deadline:
        template["question"] = f"How is '{deadline}' calculated, and what happens if I miss it?"
    elif risk_type == "Obligation Burden" and action:
        template["question"] = f"What happens if I cannot complete this requirement: '{action}'?"

    return template

EXPLANATION_TEMPLATES = {
    "Rights Waiver": {
        "plain": "This says you are giving up standard legal rights, like going to court or joining group lawsuits.",
        "why": "If you sign this, you cannot sue the company in court. You must resolve disputes through private arbitration instead.",
        "question": "Can I opt out of the binding arbitration or class action waiver?"
    },
    "Money Risk": {
        "plain": "This clause indicates potential costs, fees, auto-renewals, or payment penalties.",
        "why": "You could be charged extra fees, automatically renewed into a subscription, or lose refunds if you cancel.",
        "question": "What are the exact fees, and when does the auto-renewal occur?"
    },
    "Deadline Burden": {
        "plain": "This sets a strict timeframe or deadline for you to act.",
        "why": "If you miss this time limit, you might lose your rights, face additional charges, or have services cancelled.",
        "question": "What happens if I miss this deadline, and does it include weekends or holidays?"
    },
    "Proof Burden": {
        "plain": "This requires you to provide documents, evidence, or records.",
        "why": "You must collect and submit paperwork to prove your case or verify eligibility, which can be hard and time-consuming.",
        "question": "What exact documents do I need to submit to verify this?"
    },
    "Ambiguity Burden": {
        "plain": "This uses vague or open-ended phrases that give the other party full discretion.",
        "why": "Phrases like 'as needed' or 'at our discretion' mean they can change terms or require things from you without a clear rule.",
        "question": "Can we define specific conditions instead of leaving this 'at your discretion'?"
    },
    "Permission/Data Sharing": {
        "plain": "This gives the company permission to share or sell your information.",
        "why": "Your personal details, habits, or records might be shared with third parties or advertising partners.",
        "question": "Who gets access to my personal data, and can I opt out of sharing it?"
    },
    "Pressure Language": {
        "plain": "This uses urgent language to press you into acting or responding immediately.",
        "why": "Urgent warnings or threat of immediate action can be a sign of scam-like pressure or high-stress sales tactics.",
        "question": "Is there a grace period or more information available before I must make a decision?"
    }
}

# Specific term overrides for even better explanation accuracy
TERM_SPECIFIC_TEMPLATES = {
    "binding arbitration": {
        "plain": "This says you must use private arbitration instead of a court of law.",
        "why": "If you have a dispute, you cannot sue in public court with a judge or jury. An arbitrator's decision is final and hard to appeal.",
        "question": "Can I opt out of the binding arbitration clause?"
    },
    "class action": {
        "plain": "This waives your right to join a group lawsuit.",
        "why": "You cannot join other customers or users in a lawsuit. You must handle your claim individually, which is much more expensive.",
        "question": "Am I required to waive class action lawsuits to use this service?"
    },
    "auto-renew": {
        "plain": "This contract automatically renews itself.",
        "why": "You will be charged again automatically unless you cancel in writing before a specific deadline.",
        "question": "How and when do I cancel the auto-renewal to avoid being charged?"
    }
}

def get_explanation(risk_type: str, matches: list[str]) -> dict:
    # Check term overrides first
    for match in matches:
        m = match.lower()
        for term, template in TERM_SPECIFIC_TEMPLATES.items():
            if term in m:
                return template
                
    # Fallback to category templates
    return EXPLANATION_TEMPLATES.get(
        risk_type,
        {
            "plain": "This clause has been flagged as containing potential legal or financial risk.",
            "why": "The phrasing used here may impose hidden burdens or liabilities on you.",
            "question": "What am I agreeing to in this section, and can we change it?"
        }
    )

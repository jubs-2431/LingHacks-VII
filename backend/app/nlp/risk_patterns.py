RISK_PATTERNS = {
    "Rights Waiver": [
        r"\bwaive\b",
        r"\bwaives?\b",
        r"\bwaiver\b",
        r"\bbinding arbitration\b",
        r"\barbitration\b",
        r"\bclass action\b",
        r"\bright to sue\b",
        r"\bjury trial\b",
        r"\bdisclaim\b",
        r"\brelease from liability\b",
        r"\bhold harmless\b"
    ],
    "Money Risk": [
        r"\bfees?\b",
        r"\bpenalt(y|ies)\b",
        r"\bcharged\b",
        r"\bcharges?\b",
        r"\bauto[- ]?renew\b",
        r"\bautomatic(?:ally)? renew(?:al|s|ed)?\b",
        r"\bnon[- ]?refundable\b",
        r"\bpayment obligations?\b",
        r"\badditional costs?\b",
        r"\bbillable\b",
        r"\blate fees?\b"
    ],
    "Deadline Burden": [
        r"\bwithin \d+ (business )?days\b",
        r"\bat least \d+ (business )?days\b",
        r"\bno later than\b",
        r"\bdeadline\b",
        r"\bprior to\b",
        r"\bdue date\b",
        r"\bexpiration\b",
        r"\brenewal date\b"
    ],
    "Ambiguity Burden": [
        r"\bmay be required\b",
        r"\bas needed\b",
        r"\bsubject to review\b",
        r"\bat our discretion\b",
        r"\badequate\b",
        r"\breasonable\b",
        r"\bsole discretion\b",
        r"\bas necessary\b"
    ],
    "Proof Burden": [
        r"\bdocumentation\b",
        r"\bevidence\b",
        r"\bproof\b",
        r"\bverify\b",
        r"\bsupporting materials\b",
        r"\bprovide records\b"
    ],
    "Permission/Data Sharing": [
        r"\bauthorize\b",
        r"\bconsent to\b",
        r"\bdisclose\b",
        r"\bshare your information\b",
        r"\bthird[- ]part(y|ies)\b",
        r"\bmarketing partners\b",
        r"\btrack\b",
        r"\bpersonal information\b"
    ],
    "Pressure Language": [
        r"\bimmediate action\b",
        r"\bfinal notice\b",
        r"\burgent\b",
        r"\bact now\b",
        r"\bfailure to respond\b",
        r"\blose access\b",
        r"\bconsequences\b"
    ]
}

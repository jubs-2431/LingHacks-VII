from dataclasses import dataclass
from typing import Literal


Severity = Literal["low", "medium", "high"]


@dataclass(frozen=True)
class RiskRule:
    key: str
    category: str
    pattern: str
    severity: Severity
    confidence: float
    document_types: tuple[str, ...] = ()
    negation_sensitive: bool = True


GENERIC_RULES = [
    RiskRule(
        "binding_arbitration",
        "Rights Waiver",
        r"\b(?:binding|mandatory)\s+arbitration\b",
        "high",
        0.98,
    ),
    RiskRule(
        "rights_waiver",
        "Rights Waiver",
        r"\b(?:waiv(?:e|es|er|ing)|give\s+up|relinquish|forfeit)\b.{0,80}?\b(?:right|rights|sue|court|jury\s+trial|class\s+action)\b",
        "high",
        0.97,
    ),
    RiskRule(
        "class_action_waiver",
        "Rights Waiver",
        r"\b(?:class\s+action\s+waiver|waiver\s+of\s+(?:the\s+)?right\s+to\s+participate\s+in\s+(?:a\s+)?class\s+action)\b",
        "high",
        0.99,
    ),
    RiskRule(
        "cannot_sue",
        "Rights Waiver",
        r"\b(?:may\s+not|cannot|will\s+not)\s+(?:bring\s+(?:a\s+)?claim|sue|commence\s+(?:a\s+)?lawsuit)\b",
        "high",
        0.96,
        negation_sensitive=False,
    ),
    RiskRule(
        "liability_release",
        "Rights Waiver",
        r"\b(?:release(?:d)?\s+from\s+liability|hold\s+harmless|indemnif(?:y|ies|ication)|disclaim(?:er)?\s+of\s+liability)\b",
        "high",
        0.94,
    ),
    RiskRule(
        "uncapped_liability",
        "Financial Liability",
        r"\b(?:unlimited|uncapped)\s+liability\b|"
        r"\bliability\b.{0,80}?\b(?:shall|will)\s+not\s+be\s+(?:excluded|limited|capped)\b|"
        r"\bnothing\b.{0,80}?\b(?:exclude|limit|cap)\b.{0,50}?\bliability\b",
        "high",
        0.94,
        negation_sensitive=False,
    ),
    RiskRule(
        "exclusivity_restriction",
        "Rights Waiver",
        r"\b(?:exclusive|exclusivity|non[-\s]?compete|not\s+compete)\b|"
        r"\b(?:shall|must|agrees?\s+to)\s+not\b.{0,100}?\b(?:compete|competitive)\b",
        "high",
        0.9,
        negation_sensitive=False,
    ),
    RiskRule(
        "non_solicitation",
        "Rights Waiver",
        r"\b(?:shall|must|will|agrees?\s+to)\s+not\b.{0,120}?\b"
        r"(?:solicit|hire|interfere\s+with)\b.{0,100}?\b"
        r"(?:customers?|employees?|contractors?|business\s+relations?)\b|"
        r"\bnon[-\s]?solicitation\b",
        "high",
        0.93,
        negation_sensitive=False,
    ),
    RiskRule(
        "fees",
        "Money Risk",
        r"\b(?:late\s+fees?|cancellation\s+fees?|service\s+fees?|additional\s+fees?|fees?|penalt(?:y|ies)|charges?|surcharges?)\b",
        "medium",
        0.86,
    ),
    RiskRule(
        "automatic_renewal",
        "Money Risk",
        r"\b(?:auto(?:matic(?:ally)?)?[-\s]?renew(?:al|s|ed)?|renews?\s+automatically)\b",
        "medium",
        0.96,
    ),
    RiskRule(
        "non_refundable",
        "Money Risk",
        r"\b(?:non[-\s]?refundable|no\s+refunds?|forfeit(?:ed|ure)?\s+(?:the\s+)?deposit)\b",
        "high",
        0.96,
        negation_sensitive=False,
    ),
    RiskRule(
        "collections",
        "Money Risk",
        r"\b(?:collections?|lien|garnish(?:ment)?|accelerat(?:e|ion)\s+(?:the\s+)?(?:balance|debt|loan))\b",
        "high",
        0.92,
    ),
    RiskRule(
        "payment_obligation",
        "Money Risk",
        r"\b(?:must|shall|required\s+to|agree\s+to)\s+(?:pay|reimburse|repay|remit)\b",
        "medium",
        0.91,
    ),
    RiskRule(
        "price_adjustment",
        "Money Risk",
        r"\b(?:increase|decrease|adjust(?:ment|ed)?|change)\b.{0,80}?\b"
        r"(?:price|prices|rate|rates|cost|costs)\b|"
        r"\b(?:price|prices|rate|rates|cost|costs)\b.{0,80}?\b"
        r"(?:increase|decrease|adjust(?:ment|ed)?|change)\b",
        "medium",
        0.84,
    ),
    RiskRule(
        "deadline_days",
        "Deadline Burden",
        r"\b(?:within|at\s+least)\s+\d+\s+(?:business\s+|calendar\s+)?(?:days?|weeks?|months?)\b",
        "medium",
        0.96,
    ),
    RiskRule(
        "deadline_phrase",
        "Deadline Burden",
        r"\b(?:no\s+later\s+than|deadline|due\s+date|prior\s+to|before\s+the\s+renewal|expires?\s+on|expiration\s+date)\b",
        "medium",
        0.88,
        negation_sensitive=False,
    ),
    RiskRule(
        "proof_requirement",
        "Proof Burden",
        r"\b(?:documentation|documentary\s+evidence|proof|supporting\s+materials?|provide\s+(?:your\s+)?records?|verify\s+(?:your\s+)?eligibility)\b",
        "medium",
        0.88,
    ),
    RiskRule(
        "audit_records",
        "Proof Burden",
        r"\b(?:audit|inspect|examine)\b.{0,100}?\b"
        r"(?:books|records?|documents?|premises|compliance)\b|"
        r"\b(?:books|records?)\b.{0,100}?\b(?:audit|inspection|examination)\b",
        "medium",
        0.92,
    ),
    RiskRule(
        "insurance_requirement",
        "Proof Burden",
        r"\b(?:shall|must|will|required\s+to)\b.{0,100}?\b"
        r"(?:maintain|carry|procure|obtain|provide)\b.{0,80}?\b"
        r"(?:insurance|coverage|insured)\b",
        "medium",
        0.9,
    ),
    RiskRule(
        "discretion",
        "Ambiguity Burden",
        r"\b(?:at\s+(?:our|its|their|the\s+\w+'s)\s+(?:sole\s+)?discretion|sole\s+discretion|as\s+(?:needed|necessary)|subject\s+to\s+review|may\s+be\s+required)\b",
        "low",
        0.91,
    ),
    RiskRule(
        "vague_standard",
        "Ambiguity Burden",
        r"\b(?:reasonable|adequate|appropriate)\b",
        "low",
        0.62,
    ),
    RiskRule(
        "data_share",
        "Permission/Data Sharing",
        r"\b(?:share|disclose|transfer|sell)\s+(?:your|personal|medical|financial)\s+(?:information|data|records?)\b",
        "medium",
        0.95,
    ),
    RiskRule(
        "third_party_data",
        "Permission/Data Sharing",
        r"\b(?:share|disclose|transfer|sell|provide)\b.{0,100}?\b(?:third[-\s]part(?:y|ies)|marketing\s+partners?)\b",
        "medium",
        0.9,
    ),
    RiskRule(
        "data_consent",
        "Permission/Data Sharing",
        r"\b(?:authorize|consent\s+to)\b.{0,80}?\b(?:share|disclos|release|use|track)\w*\b",
        "medium",
        0.92,
    ),
    RiskRule(
        "urgent_pressure",
        "Pressure Language",
        r"\b(?:immediate\s+action|final\s+notice|urgent|act\s+now|respond\s+immediately)\b",
        "medium",
        0.93,
    ),
    RiskRule(
        "failure_consequence",
        "Pressure Language",
        r"\b(?:failure\s+to\s+(?:respond|comply|act|submit|pay|provide)|lose\s+access|immediate\s+consequences?)\b",
        "medium",
        0.88,
        negation_sensitive=False,
    ),
    RiskRule(
        "positive_obligation",
        "Obligation Burden",
        r"\b(?:must|shall|is\s+required\s+to|are\s+required\s+to|agrees?\s+to|is\s+responsible\s+for)\b",
        "medium",
        0.82,
    ),
    RiskRule(
        "prohibition",
        "Obligation Burden",
        r"\b(?:may\s+not|must\s+not|shall\s+not|cannot|is\s+prohibited\s+from|are\s+prohibited\s+from)\b",
        "medium",
        0.92,
        negation_sensitive=False,
    ),
]


DOCUMENT_RULES = [
    RiskRule(
        "lease_eviction",
        "Housing Stability",
        r"\b(?:evict(?:ion|ed)?|terminate\s+(?:the\s+)?tenancy|notice\s+to\s+quit|unlawful\s+detainer)\b",
        "high",
        0.97,
        ("lease",),
    ),
    RiskRule(
        "lease_entry",
        "Property Access",
        r"\b(?:enter|access)\s+(?:the\s+)?(?:premises|unit|property)\b.{0,60}?\b(?:without\s+notice|at\s+any\s+time|reasonable\s+times?)\b",
        "medium",
        0.9,
        ("lease",),
        negation_sensitive=False,
    ),
    RiskRule(
        "insurance_exclusion",
        "Coverage Limitation",
        r"\b(?:not\s+covered|excluded\s+from\s+coverage|coverage\s+exclusion|pre[-\s]?authorization|required\s+referral)\b",
        "high",
        0.94,
        ("insurance",),
        negation_sensitive=False,
    ),
    RiskRule(
        "insurance_cost_share",
        "Money Risk",
        r"\b(?:deductible|co[-\s]?pay|coinsurance|out[-\s]of[-\s]pocket)\b",
        "medium",
        0.94,
        ("insurance",),
    ),
    RiskRule(
        "medical_procedure_consent",
        "Medical Consent",
        r"\b(?:consent\s+to\s+(?:treatment|procedure|surgery)|experimental\s+(?:treatment|procedure)|informed\s+consent)\b",
        "high",
        0.93,
        ("medical",),
    ),
    RiskRule(
        "medical_records_release",
        "Permission/Data Sharing",
        r"\b(?:release|disclose|share)\s+(?:my|your|the\s+patient's)\s+(?:medical|health)\s+(?:records?|information)\b",
        "medium",
        0.97,
        ("medical",),
    ),
    RiskRule(
        "financial_apr",
        "Money Risk",
        r"\b(?:annual\s+percentage\s+rate|APR|variable\s+(?:interest\s+)?rate|default\s+interest)\b",
        "high",
        0.96,
        ("financial",),
    ),
    RiskRule(
        "financial_security",
        "Financial Liability",
        r"\b(?:personal\s+guarantee|security\s+interest|collateral|cross[-\s]?default|acceleration\s+clause)\b",
        "high",
        0.96,
        ("financial",),
    ),
    RiskRule(
        "terms_change",
        "Unilateral Change",
        r"\b(?:change|modify|amend)\s+(?:these\s+)?terms\b.{0,60}?\b(?:at\s+any\s+time|without\s+(?:prior\s+)?notice|sole\s+discretion)\b",
        "medium",
        0.94,
        ("terms",),
        negation_sensitive=False,
    ),
    RiskRule(
        "content_license",
        "Rights Waiver",
        r"\b(?:perpetual|irrevocable|worldwide|royalty[-\s]?free)\b.{0,80}?\blicen[cs]e\b",
        "high",
        0.92,
        ("terms",),
    ),
]


ALL_RULES = tuple(GENERIC_RULES + DOCUMENT_RULES)

# Compatibility view for older imports and documentation.
RISK_PATTERNS: dict[str, list[str]] = {}
for rule in ALL_RULES:
    RISK_PATTERNS.setdefault(rule.category, []).append(rule.pattern)

from pydantic import BaseModel
from typing import List, Dict

class AnalyzeRequest(BaseModel):
    text: str
    document_type: str = "other"

class RiskClauseSchema(BaseModel):
    id: str
    text: str
    risk_type: str
    severity: str
    trigger_terms: List[str]
    plain_english: str
    why_it_matters: str
    question_to_ask: str

class AnalyzeResponse(BaseModel):
    summary: str
    risk_counts: Dict[str, int]
    category_counts: Dict[str, int]
    clauses: List[RiskClauseSchema]
    checklist: List[str]

class SimplifyRequest(BaseModel):
    clause: str

class SimplifyResponse(BaseModel):
    plain_english: str
    risk_type: str
    severity: str

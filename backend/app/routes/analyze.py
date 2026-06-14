import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import (
    AnalyzeRequest, 
    AnalyzeResponse, 
    SimplifyRequest, 
    SimplifyResponse
)
from app.nlp.risk_detector import analyze_document_text
from app.nlp.risk_patterns import RISK_PATTERNS
from app.nlp.severity import score_clause
from app.nlp.explanations import get_explanation
from app.utils.pdf_extract import extract_text_from_pdf

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    try:
        results = analyze_document_text(payload.text)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    # Standard check for file types
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        content = await file.read()
        text = extract_text_from_pdf(content)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simplify-clause", response_model=SimplifyResponse)
def simplify_clause(payload: SimplifyRequest):
    clause = payload.clause
    
    # Run detector on a single clause
    detected_risks = []
    for risk_type, patterns in RISK_PATTERNS.items():
        matched_terms = []
        for pattern in patterns:
            matches = re.findall(pattern, clause, flags=re.IGNORECASE)
            if matches:
                for match in matches:
                    if isinstance(match, tuple):
                        matched_terms.append(" ".join(match))
                    else:
                        matched_terms.append(match)
        if matched_terms:
            detected_risks.append((risk_type, list(set(matched_terms))))
            
    if detected_risks:
        risk_type, trigger_terms = detected_risks[0]
        severity = score_clause(clause, risk_type, trigger_terms)
        explanation = get_explanation(risk_type, trigger_terms)
        return SimplifyResponse(
            plain_english=explanation["plain"],
            risk_type=risk_type,
            severity=severity
        )
    else:
        # Fallback if no specific rule matched
        return SimplifyResponse(
            plain_english="This clause has standard phrasing and no high-risk patterns detected.",
            risk_type="No Risk Detected",
            severity="low"
        )

import re
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    SimplifyRequest,
    SimplifyResponse,
)
from app.nlp.risk_detector import analyze_document_text
from app.nlp.risk_patterns import RISK_PATTERNS
from app.nlp.severity import score_clause
from app.nlp.explanations import get_explanation
from app.utils.pdf_extract import extract_text_from_pdf

router = APIRouter()

MAX_TEXT_CHARS = 120_000
MAX_PDF_BYTES = 10 * 1024 * 1024

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please provide document text to analyze.")
    if len(text) > MAX_TEXT_CHARS:
        raise HTTPException(status_code=413, detail="Document is too long for the demo. Please shorten it and try again.")

    try:
        return analyze_document_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")
        if len(content) > MAX_PDF_BYTES:
            raise HTTPException(status_code=413, detail="PDF is too large for the demo. Please upload a file under 10 MB.")

        text = extract_text_from_pdf(content)
        if not text.strip():
            raise HTTPException(status_code=422, detail="No readable text was found. This may be a scanned PDF; paste the text directly instead.")
        return {"text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")

@router.post("/simplify-clause", response_model=SimplifyResponse)
def simplify_clause(payload: SimplifyRequest):
    clause = payload.clause.strip()
    if not clause:
        raise HTTPException(status_code=400, detail="Please provide a clause to simplify.")

    detected_risks = []
    for risk_type, patterns in RISK_PATTERNS.items():
        matched_terms = []
        for pattern in patterns:
            matches = re.findall(pattern, clause, flags=re.IGNORECASE)
            if matches:
                for match in matches:
                    matched_terms.append(" ".join(match) if isinstance(match, tuple) else match)
        if matched_terms:
            detected_risks.append((risk_type, sorted(set(matched_terms))))

    if detected_risks:
        risk_type, trigger_terms = detected_risks[0]
        severity = score_clause(clause, risk_type, trigger_terms)
        explanation = get_explanation(risk_type, trigger_terms)
        return SimplifyResponse(
            plain_english=explanation["plain"],
            risk_type=risk_type,
            severity=severity,
        )

    return SimplifyResponse(
        plain_english="This clause has standard phrasing and no high-risk patterns detected.",
        risk_type="No Risk Detected",
        severity="low",
    )

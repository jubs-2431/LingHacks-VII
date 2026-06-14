import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.models.schemas import (
    AnalyzeRequest,
    AnalyzeDocumentResponse,
    AnalyzeResponse,
    DocumentType,
    ExtractTextResponse,
    SimplifyRequest,
    SimplifyResponse,
)
from app.nlp.risk_detector import analyze_document_text
from app.settings import MAX_TEXT_CHARACTERS, MAX_UPLOAD_BYTES
from app.utils.pdf_extract import (
    UnsupportedDocumentError,
    UnreadableDocumentError,
    extract_text_from_document,
)


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest) -> dict:
    return analyze_document_text(
        payload.text,
        payload.document_type,
        page_spans=[page.model_dump() for page in payload.pages],
    )


@router.post("/extract-text", response_model=ExtractTextResponse)
async def extract_text(file: UploadFile = File(...)) -> dict:
    filename = file.filename or "uploaded-document"
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()

    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    try:
        result = extract_text_from_document(content, filename, file.content_type)
    except UnsupportedDocumentError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except UnreadableDocumentError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected document extraction failure")
        raise HTTPException(
            status_code=500,
            detail="The document could not be processed safely.",
        ) from exc

    if len(result.text) > MAX_TEXT_CHARACTERS:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                "Extracted text exceeds the "
                f"{MAX_TEXT_CHARACTERS:,}-character limit."
            ),
        )

    return {
        "text": result.text,
        "filename": filename,
        "page_count": result.page_count,
        "used_ocr": result.used_ocr,
        "warnings": result.warnings,
        "pages": [
            {
                "page_number": page.page_number,
                "start": page.start,
                "end": page.end,
                "used_ocr": page.used_ocr,
            }
            for page in result.pages
        ],
    }


@router.post("/analyze-document", response_model=AnalyzeDocumentResponse)
async def analyze_document(
    file: UploadFile = File(...),
    document_type: DocumentType = Form("other"),
) -> dict:
    extraction = await extract_text(file)
    analysis = analyze_document_text(
        extraction["text"],
        document_type,
        warnings=extraction["warnings"],
        page_spans=extraction["pages"],
    )
    return {"extraction": extraction, "analysis": analysis}


@router.post("/simplify-clause", response_model=SimplifyResponse)
def simplify_clause(payload: SimplifyRequest) -> dict:
    result = analyze_document_text(payload.clause, payload.document_type)
    findings = result["clauses"]

    if findings:
        primary = findings[0]
        return {
            "plain_english": primary["plain_english"],
            "risk_type": primary["risk_type"],
            "severity": primary["severity"],
            "confidence": primary["confidence"],
            "findings": findings,
        }

    return {
        "plain_english": (
            "No supported risk pattern was detected in this clause. "
            "That does not establish that the clause is harmless."
        ),
        "risk_type": "No Supported Pattern",
        "severity": "low",
        "confidence": 0.0,
        "findings": [],
    }

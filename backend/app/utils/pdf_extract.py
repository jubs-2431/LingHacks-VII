import io
import shutil
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from PIL import Image, UnidentifiedImageError

from app.settings import (
    MAX_DOCUMENT_PAGES,
    MAX_IMAGE_PIXELS,
    MAX_OCR_PAGES,
    OCR_TIMEOUT_SECONDS,
)


SUPPORTED_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg"}
SUPPORTED_IMAGE_TYPES = {"image/png", "image/jpeg"}


class UnsupportedDocumentError(ValueError):
    pass


class UnreadableDocumentError(ValueError):
    pass


@dataclass(frozen=True)
class ExtractionResult:
    text: str
    page_count: int
    used_ocr: bool
    warnings: list[str]
    pages: list["PageSpan"]


@dataclass(frozen=True)
class PageSpan:
    page_number: int
    start: int
    end: int
    used_ocr: bool


def _join_pages(
    page_text: list[str],
    ocr_pages: set[int] | None = None,
) -> tuple[str, list[PageSpan]]:
    parts: list[str] = []
    spans: list[PageSpan] = []
    cursor = 0
    ocr_pages = ocr_pages or set()

    for index, content in enumerate(page_text):
        clean = content.strip()
        if clean and parts:
            parts.append("\n\n")
            cursor += 2
        start = cursor
        if clean:
            parts.append(clean)
            cursor += len(clean)
        spans.append(
            PageSpan(
                page_number=index + 1,
                start=start,
                end=cursor,
                used_ocr=index in ocr_pages,
            )
        )
    return "".join(parts), spans


def _ocr_available() -> bool:
    return shutil.which("tesseract") is not None


def _ocr_image(image: Image.Image) -> str:
    if not _ocr_available():
        raise UnreadableDocumentError(
            "This file needs OCR, but OCR is not available on the server."
        )
    import pytesseract

    try:
        return pytesseract.image_to_string(image, timeout=OCR_TIMEOUT_SECONDS)
    except RuntimeError as exc:
        raise UnreadableDocumentError("OCR timed out while reading the document.") from exc


def _ocr_pdf_pages(pdf_bytes: bytes, page_numbers: list[int]) -> dict[int, str]:
    if not page_numbers or not _ocr_available():
        return {}

    import pypdfium2

    document = pypdfium2.PdfDocument(pdf_bytes)
    results: dict[int, str] = {}
    try:
        for page_number in page_numbers:
            page = document[page_number]
            bitmap = None
            image = None
            try:
                bitmap = page.render(scale=2.5)
                image = bitmap.to_pil()
                if image.width * image.height > MAX_IMAGE_PIXELS:
                    raise UnreadableDocumentError(
                        f"An OCR page exceeds the {MAX_IMAGE_PIXELS:,}-pixel limit."
                    )
                results[page_number] = _ocr_image(image).strip()
            finally:
                if image is not None:
                    image.close()
                if bitmap is not None:
                    bitmap.close()
                page.close()
    finally:
        document.close()
    return results


def extract_text_from_pdf(pdf_bytes: bytes) -> ExtractionResult:
    page_text: list[str] = []
    missing_pages: list[int] = []
    warnings: list[str] = []

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            page_count = len(pdf.pages)
            if page_count == 0:
                raise UnreadableDocumentError("The PDF has no pages.")
            if page_count > MAX_DOCUMENT_PAGES:
                raise UnreadableDocumentError(
                    f"The PDF exceeds the {MAX_DOCUMENT_PAGES}-page limit."
                )

            for index, page in enumerate(pdf.pages):
                content = (page.extract_text() or "").strip()
                page_text.append(content)
                if len(content) < 20:
                    missing_pages.append(index)
    except UnreadableDocumentError:
        raise
    except Exception as exc:
        raise UnreadableDocumentError("The PDF could not be parsed.") from exc

    used_ocr = False
    ocr_pages: set[int] = set()
    if missing_pages:
        if len(missing_pages) > MAX_OCR_PAGES:
            raise UnreadableDocumentError(
                "The PDF has too many scanned or unreadable pages. "
                f"Split it into documents with at most {MAX_OCR_PAGES} OCR pages."
            )
        if _ocr_available():
            ocr_results = _ocr_pdf_pages(pdf_bytes, missing_pages)
            for page_number, content in ocr_results.items():
                if content:
                    page_text[page_number] = content
                    used_ocr = True
                    ocr_pages.add(page_number)
            unresolved = [number + 1 for number in missing_pages if not page_text[number]]
            if unresolved:
                warnings.append(
                    "No readable text was found on page(s): "
                    + ", ".join(map(str, unresolved))
                    + "."
                )
        else:
            warnings.append(
                "Some pages appear scanned. OCR is unavailable, so those pages may be missing."
            )

    text, pages = _join_pages(page_text, ocr_pages)
    if not text:
        raise UnreadableDocumentError(
            "No readable text was found. Install Tesseract OCR for scanned documents."
        )

    return ExtractionResult(
        text=text,
        page_count=page_count,
        used_ocr=used_ocr,
        warnings=warnings,
        pages=pages,
    )


def extract_text_from_image(image_bytes: bytes) -> ExtractionResult:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise UnreadableDocumentError("The image could not be parsed.") from exc

    if image.width * image.height > MAX_IMAGE_PIXELS:
        image.close()
        raise UnreadableDocumentError(
            f"The image exceeds the {MAX_IMAGE_PIXELS:,}-pixel limit."
        )

    try:
        text = _ocr_image(image).strip()
    finally:
        image.close()

    if not text:
        raise UnreadableDocumentError("OCR did not find readable text in the image.")

    return ExtractionResult(
        text=text,
        page_count=1,
        used_ocr=True,
        warnings=[],
        pages=[PageSpan(page_number=1, start=0, end=len(text), used_ocr=True)],
    )


def extract_text_from_document(
    content: bytes,
    filename: str,
    content_type: str | None,
) -> ExtractionResult:
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf" or content_type == "application/pdf":
        if not content.startswith(b"%PDF-"):
            raise UnsupportedDocumentError("The uploaded file is not a valid PDF.")
        return extract_text_from_pdf(content)

    if suffix in SUPPORTED_IMAGE_SUFFIXES or content_type in SUPPORTED_IMAGE_TYPES:
        return extract_text_from_image(content)

    raise UnsupportedDocumentError("Only PDF, PNG, and JPEG files are supported.")

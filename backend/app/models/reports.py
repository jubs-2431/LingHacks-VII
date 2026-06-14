from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, model_validator

from app.models.schemas import (
    AnalyzeResponse,
    DocumentType,
    NonEmptyText,
    PageSpanSchema,
    validate_page_spans,
)


class CreateReportRequest(BaseModel):
    text: NonEmptyText
    document_type: DocumentType = "other"
    filename: Annotated[str, StringConstraints(max_length=255)] | None = None
    pages: list[PageSpanSchema] = Field(default_factory=list, max_length=10_000)
    warnings: list[
        Annotated[str, StringConstraints(min_length=1, max_length=500)]
    ] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def page_spans_must_match_text(self) -> "CreateReportRequest":
        validate_page_spans(self.text, self.pages)
        return self


class ReportSummaryResponse(BaseModel):
    id: str
    filename: str | None
    document_type: DocumentType
    finding_count: int
    highest_severity: str | None
    created_at: datetime
    expires_at: datetime


class ReportResponse(ReportSummaryResponse):
    text: str
    analysis: AnalyzeResponse
    pages: list[PageSpanSchema]


class CreateShareRequest(BaseModel):
    expires_in_hours: int | None = Field(default=None, ge=1, le=720)
    max_accesses: int | None = Field(default=None, ge=1, le=1000)


class ShareResponse(BaseModel):
    id: str
    report_id: str
    share_url: str
    expires_at: datetime
    max_accesses: int
    access_count: int
    revoked: bool

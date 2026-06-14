from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints, field_validator, model_validator

from app.settings import MAX_TEXT_CHARACTERS


DocumentType = Literal["lease", "insurance", "medical", "financial", "terms", "other"]
Severity = Literal["low", "medium", "high"]
NonEmptyText = Annotated[
    str,
    StringConstraints(min_length=1, max_length=MAX_TEXT_CHARACTERS),
]


class AnalyzeRequest(BaseModel):
    text: NonEmptyText
    document_type: DocumentType = "other"
    pages: list["PageSpanSchema"] = Field(default_factory=list, max_length=10_000)

    @field_validator("text")
    @classmethod
    def text_must_contain_non_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Document text cannot be blank.")
        return value


class TextSpanSchema(BaseModel):
    start: int = Field(ge=0)
    end: int = Field(gt=0)
    text: str

    @field_validator("end")
    @classmethod
    def end_must_be_positive(cls, value: int) -> int:
        return value


class RiskClauseSchema(BaseModel):
    id: str
    text: str
    start_offset: int = Field(ge=0)
    end_offset: int = Field(gt=0)
    risk_type: str
    severity: Severity
    confidence: float = Field(ge=0, le=1)
    trigger_terms: list[str]
    trigger_spans: list[TextSpanSchema]
    plain_english: str
    why_it_matters: str
    question_to_ask: str
    details: dict[str, list[str]] = Field(default_factory=dict)
    page_numbers: list[int] = Field(default_factory=list)


class DocumentStatsSchema(BaseModel):
    characters: int = Field(ge=0)
    words: int = Field(ge=0)
    clauses_reviewed: int = Field(ge=0)
    findings: int = Field(ge=0)


class AnalyzeResponse(BaseModel):
    analysis_version: str
    document_type: DocumentType
    summary: str
    risk_counts: dict[str, int]
    category_counts: dict[str, int]
    clauses: list[RiskClauseSchema]
    checklist: list[str]
    warnings: list[str]
    disclaimer: str
    document_stats: DocumentStatsSchema


class ExtractTextResponse(BaseModel):
    text: str
    filename: str
    page_count: int = Field(ge=1)
    used_ocr: bool
    warnings: list[str]
    pages: list["PageSpanSchema"]


class PageSpanSchema(BaseModel):
    page_number: int = Field(ge=1)
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    used_ocr: bool = False

    @model_validator(mode="after")
    def end_must_not_precede_start(self) -> "PageSpanSchema":
        if self.end < self.start:
            raise ValueError("Page end offset cannot precede its start offset.")
        return self


class AnalyzeDocumentResponse(BaseModel):
    extraction: ExtractTextResponse
    analysis: AnalyzeResponse


class SimplifyRequest(BaseModel):
    clause: Annotated[
        str,
        StringConstraints(min_length=1, max_length=10_000),
    ]
    document_type: DocumentType = "other"

    @field_validator("clause")
    @classmethod
    def clause_must_contain_non_whitespace(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Clause text cannot be blank.")
        return value


class SimplifyResponse(BaseModel):
    plain_english: str
    risk_type: str
    severity: Severity
    confidence: float
    findings: list[RiskClauseSchema]

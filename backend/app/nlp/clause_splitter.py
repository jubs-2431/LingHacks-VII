import re
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class ClauseSpan:
    text: str
    start: int
    end: int


@lru_cache(maxsize=1)
def _sentence_pipeline():
    import spacy

    nlp = spacy.blank("en")
    nlp.add_pipe("sentencizer")
    return nlp


_INTERNAL_BOUNDARY = re.compile(r";|(?:\r?\n){2,}")


def _trimmed_span(text: str, start: int, end: int) -> ClauseSpan | None:
    raw = text[start:end]
    leading = len(raw) - len(raw.lstrip())
    trailing = len(raw) - len(raw.rstrip())
    clean_start = start + leading
    clean_end = end - trailing
    if clean_end <= clean_start:
        return None

    clean_text = text[clean_start:clean_end]
    if len(clean_text) < 8:
        return None
    return ClauseSpan(text=clean_text, start=clean_start, end=clean_end)


def split_into_clause_spans(text: str) -> list[ClauseSpan]:
    """Split text without deleting legally meaningful connector words."""
    if not text or not text.strip():
        return []

    doc = _sentence_pipeline()(text)
    clauses: list[ClauseSpan] = []

    for sentence in doc.sents:
        sentence_start = sentence.start_char
        sentence_end = sentence.end_char
        cursor = sentence_start

        for boundary in _INTERNAL_BOUNDARY.finditer(text, sentence_start, sentence_end):
            span = _trimmed_span(text, cursor, boundary.start())
            if span:
                clauses.append(span)
            cursor = boundary.end()

        span = _trimmed_span(text, cursor, sentence_end)
        if span:
            clauses.append(span)

    return clauses


def split_into_clauses(text: str) -> list[str]:
    """Compatibility wrapper for callers that only need clause text."""
    return [span.text for span in split_into_clause_spans(text)]

import re
import spacy

try:
    # Attempt to load standard model
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback to blank model with sentencizer
    nlp = spacy.blank("en")
    nlp.add_pipe("sentencizer")

def split_into_clauses(text: str) -> list[str]:
    if not text or not text.strip():
        return []
    
    doc = nlp(text)
    clauses = []
    
    # Split regex on connectors/punctuation
    split_pattern = re.compile(
        r";|\bprovided that\b|\bsubject to\b|\bunless\b|\bnotwithstanding\b|\bin the event that\b|\bfailure to\b",
        flags=re.IGNORECASE
    )
    
    for sent in doc.sents:
        # Split individual sentence by the legal connectors
        parts = split_pattern.split(sent.text)
        for part in parts:
            cleaned = part.strip()
            # Clean up extra spacing, newlines, etc.
            cleaned = re.sub(r"\s+", " ", cleaned)
            # Retain fragments that are at least 15 characters long
            if len(cleaned) > 15:
                clauses.append(cleaned)
                
    return clauses

import re
import uuid
from app.nlp.clause_splitter import split_into_clauses
from app.nlp.risk_patterns import RISK_PATTERNS
from app.nlp.severity import score_clause
from app.nlp.explanations import get_explanation

def analyze_document_text(text: str) -> dict:
    clauses = split_into_clauses(text)
    
    analyzed_clauses = []
    checklist = []
    seen_questions = set()
    
    risk_counts = {
        "high": 0,
        "medium": 0,
        "low": 0
    }
    
    category_counts = {
        "Rights Waiver": 0,
        "Money Risk": 0,
        "Deadline Burden": 0,
        "Proof Burden": 0,
        "Ambiguity Burden": 0,
        "Permission/Data Sharing": 0,
        "Pressure Language": 0
    }
    
    for idx, clause in enumerate(clauses):
        detected_risks = []
        
        # Check against all pattern groups
        for risk_type, patterns in RISK_PATTERNS.items():
            matched_terms = []
            for pattern in patterns:
                matches = re.findall(pattern, clause, flags=re.IGNORECASE)
                if matches:
                    # Collect matches (if group matches, extract string)
                    for match in matches:
                        if isinstance(match, tuple):
                            # In case regex contains multiple groups, merge them
                            matched_terms.append(" ".join(match))
                        else:
                            matched_terms.append(match)
                            
            if matched_terms:
                # Remove duplicates in matches
                matched_terms = list(set(matched_terms))
                detected_risks.append((risk_type, matched_terms))
                
        # If any risks were detected, process the primary one
        # (For simplicity, we take the first matched risk type, or we could list multiple.
        # Let's take the first one or process them. Taking the first one makes it a clean 1-to-1 mapping)
        if detected_risks:
            # Sort by severity or just pick the first. Let's pick the first matched risk type.
            risk_type, trigger_terms = detected_risks[0]
            severity = score_clause(clause, risk_type, trigger_terms)
            explanation = get_explanation(risk_type, trigger_terms)
            
            # Increment counts
            risk_counts[severity] += 1
            if risk_type in category_counts:
                category_counts[risk_type] += 1
                
            clause_id = f"clause_{idx}_{uuid.uuid4().hex[:6]}"
            
            analyzed_clauses.append({
                "id": clause_id,
                "text": clause,
                "risk_type": risk_type,
                "severity": severity,
                "trigger_terms": trigger_terms,
                "plain_english": explanation["plain"],
                "why_it_matters": explanation["why"],
                "question_to_ask": explanation["question"]
            })
            
            # Add question to checklist if not already present
            q = explanation["question"]
            if q not in seen_questions:
                seen_questions.add(q)
                checklist.append(q)
                
    # Generate overall summary text
    high = risk_counts["high"]
    medium = risk_counts["medium"]
    low = risk_counts["low"]
    
    if high > 0:
        summary = f"This document contains {high} High Risk and {medium} Medium Risk clauses. Please review rights waivers and payment penalties carefully before signing."
    elif medium > 0:
        summary = f"This document contains {medium} Medium Risk clauses. We identified some deadline, fee, or documentation burdens."
    elif low > 0:
        summary = f"This document contains {low} Low Risk clauses. The document is mostly standard, but has minor ambiguities."
    else:
        summary = "No significant legal or financial risks were detected. However, please always review contracts thoroughly."
        
    return {
        "summary": summary,
        "risk_counts": risk_counts,
        "category_counts": category_counts,
        "clauses": analyzed_clauses,
        "checklist": checklist
    }

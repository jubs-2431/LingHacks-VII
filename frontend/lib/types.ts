export type Severity = "low" | "medium" | "high";
export type DocumentType =
  | "lease"
  | "insurance"
  | "medical"
  | "financial"
  | "terms"
  | "other";

export interface TextSpan {
  start: number;
  end: number;
  text: string;
}

export interface PageSpan {
  page_number: number;
  start: number;
  end: number;
  used_ocr: boolean;
}

export interface RiskClause {
  id: string;
  text: string;
  start_offset: number;
  end_offset: number;
  risk_type: string;
  severity: Severity;
  confidence: number;
  trigger_terms: string[];
  trigger_spans: TextSpan[];
  plain_english: string;
  why_it_matters: string;
  question_to_ask: string;
  details: Record<string, string[]>;
  page_numbers: number[];
}

export interface AnalysisResult {
  analysis_version: string;
  document_type: DocumentType;
  summary: string;
  risk_counts: Record<Severity, number>;
  category_counts: Record<string, number>;
  clauses: RiskClause[];
  checklist: string[];
  warnings: string[];
  disclaimer: string;
  document_stats: {
    characters: number;
    words: number;
    clauses_reviewed: number;
    findings: number;
  };
}

export interface ExtractedDocument {
  text: string;
  filename: string;
  page_count: number;
  used_ocr: boolean;
  warnings: string[];
  pages: PageSpan[];
}

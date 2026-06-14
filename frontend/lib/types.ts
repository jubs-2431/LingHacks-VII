export interface RiskClause {
  id: string;
  text: string;
  risk_type: string;
  severity: "low" | "medium" | "high";
  trigger_terms: string[];
  plain_english: string;
  why_it_matters: string;
  question_to_ask: string;
}

export interface AnalysisResult {
  summary: string;
  risk_counts: {
    high: number;
    medium: number;
    low: number;
  };
  category_counts: {
    [key: string]: number;
  };
  clauses: RiskClause[];
  checklist: string[];
}

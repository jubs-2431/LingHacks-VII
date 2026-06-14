import {
  AnalysisResult,
  DocumentType,
  ExtractedDocument,
  PageSpan,
  RiskClause,
  Severity,
} from "./types";


const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 30_000;


async function apiError(response: Response, fallback: string): Promise<Error> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.detail === "string") {
    return new Error(data.detail);
  }
  if (data && Array.isArray(data.detail) && data.detail[0]?.msg) {
    return new Error(data.detail[0].msg);
  }
  return new Error(fallback);
}


export async function analyzeText(
  text: string,
  documentType: DocumentType = "other",
  pages: PageSpan[] = [],
): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, document_type: documentType, pages }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await apiError(response, "Failed to analyze document.");
  }
  return response.json();
}


export async function extractTextFromDocument(file: File): Promise<ExtractedDocument> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/extract-text`, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await apiError(response, "Failed to extract text from the document.");
  }
  return response.json();
}


export async function simplifyClause(
  clause: string,
  documentType: DocumentType = "other",
): Promise<{
  plain_english: string;
  risk_type: string;
  severity: Severity;
  confidence: number;
  findings: RiskClause[];
}> {
  const response = await fetch(`${API_BASE_URL}/simplify-clause`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clause, document_type: documentType }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await apiError(response, "Failed to simplify clause.");
  }
  return response.json();
}

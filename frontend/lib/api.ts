import { AnalysisResult } from "./types";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

async function parseError(response: Response, fallback: string): Promise<string> {
  const errorData = await response.json().catch(() => null);
  if (errorData && typeof errorData.detail === "string") {
    return errorData.detail;
  }
  return fallback;
}

export async function analyzeText(text: string, documentType: string = "other"): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, document_type: documentType }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to analyze document."));
  }

  return response.json();
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/extract-text`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to extract text from PDF."));
  }

  const data = await response.json();
  return typeof data.text === "string" ? data.text : "";
}

export async function simplifyClause(clause: string): Promise<{ plain_english: string; risk_type: string; severity: string }> {
  const response = await fetch(`${API_BASE_URL}/simplify-clause`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clause }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to simplify clause."));
  }

  return response.json();
}

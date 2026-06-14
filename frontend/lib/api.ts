import {
  AnalysisResult,
  AuthSession,
  DocumentType,
  ExtractedDocument,
  PageSpan,
  RiskClause,
  SavedReport,
  Severity,
} from "./types";


const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 30_000;
const EXTRACTION_TIMEOUT_MS = 120_000;


export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}


async function errorMessage(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => null);
  if (data && typeof data.detail === "string") {
    return data.detail;
  }
  if (data && Array.isArray(data.detail) && data.detail[0]?.msg) {
    return data.detail[0].msg;
  }
  return fallback;
}


export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: init.signal || AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError(
      await errorMessage(response, "The request could not be completed."),
      response.status,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}


export async function analyzeText(
  text: string,
  documentType: DocumentType = "other",
  pages: PageSpan[] = [],
): Promise<AnalysisResult> {
  return apiRequest<AnalysisResult>("/analyze", {
    method: "POST",
    body: JSON.stringify({ text, document_type: documentType, pages }),
  });
}


export async function extractTextFromDocument(file: File): Promise<ExtractedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<ExtractedDocument>(
    "/extract-text",
    { method: "POST", body: formData },
    undefined,
    EXTRACTION_TIMEOUT_MS,
  );
}


export async function authenticate(
  mode: "login" | "register",
  email: string,
  password: string,
): Promise<AuthSession> {
  return apiRequest<AuthSession>(`/auth/${mode}`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}


export async function refreshAuthentication(refreshToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
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
  return apiRequest("/simplify-clause", {
    method: "POST",
    body: JSON.stringify({ clause, document_type: documentType }),
  });
}


export async function getSharedReport(token: string): Promise<SavedReport> {
  return apiRequest<SavedReport>(`/shares/${encodeURIComponent(token)}`);
}

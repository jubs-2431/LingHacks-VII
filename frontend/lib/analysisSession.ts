import { AnalysisResult, PageSpan } from "./types";


const STORAGE_KEY = "eldershield.analysis";

export interface AnalysisSession {
  text: string;
  results: AnalysisResult;
  extractionWarnings: string[];
  pages: PageSpan[];
  filename: string | null;
  reportId: string | null;
}


export function saveAnalysisSession(value: AnalysisSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}


export function loadAnalysisSession(): AnalysisSession | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    const parsed = JSON.parse(stored) as Partial<AnalysisSession>;
    if (
      typeof parsed.text !== "string" ||
      !parsed.results ||
      !Array.isArray(parsed.extractionWarnings) ||
      !Array.isArray(parsed.pages)
    ) {
      return null;
    }
    return {
      text: parsed.text,
      results: parsed.results,
      extractionWarnings: parsed.extractionWarnings.filter(
        (warning): warning is string => typeof warning === "string",
      ),
      pages: parsed.pages,
      filename: typeof parsed.filename === "string" ? parsed.filename : null,
      reportId: typeof parsed.reportId === "string" ? parsed.reportId : null,
    };
  } catch {
    return null;
  }
}


export function clearAnalysisSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

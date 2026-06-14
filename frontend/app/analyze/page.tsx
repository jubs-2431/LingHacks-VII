"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccessibility } from "../../lib/AccessibilityContext";
import SiteHeader from "../../components/SiteHeader";
import { SiteFooter } from "../page";
import UploadBox from "../../components/UploadBox";
import { analyzeText } from "../../lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const { elderMode } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, documentType: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await analyzeText(text, documentType);
      sessionStorage.setItem("document_text", text);
      sessionStorage.setItem("analysis_results", JSON.stringify(results));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't connect to the analysis engine. Please make sure the FastAPI backend is running on http://localhost:8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="no-print">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 font-medium text-shield transition-colors hover:text-shield-dark ${
                elderMode ? "text-xl" : "text-sm"
              }`}
            >
              <ArrowLeft className={`keep-color ${elderMode ? "h-6 w-6" : "h-4 w-4"}`} />
              <span>Back to home</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-medium tracking-[-0.01em] text-ink">
              Check a document
            </h1>
            <p className={`text-muted ${elderMode ? "text-xl text-ink" : "text-lg"}`}>
              Paste text or upload a PDF. ElderShield will find obligations,
              financial risks, deadlines, and rights waivers — and explain them.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-5 text-red-800">
              <AlertCircle className="keep-color mt-0.5 h-6 w-6 shrink-0 text-red-600" />
              <div className="space-y-1">
                <h4 className="font-semibold">Connection error</h4>
                <p className={elderMode ? "text-lg" : "text-sm"}>{error}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
            <UploadBox onAnalyze={handleAnalyze} isLoading={loading} />
          </div>
        </div>
      </main>

      <SiteFooter elderMode={elderMode} />
    </div>
  );
}

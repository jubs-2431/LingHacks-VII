"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccessibility } from "../../lib/AccessibilityContext";
import ElderModeToggle from "../../components/ElderModeToggle";
import UploadBox from "../../components/UploadBox";
import { analyzeText } from "../../lib/api";
import { ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

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
      
      // Save data for results page
      sessionStorage.setItem("document_text", text);
      sessionStorage.setItem("analysis_results", JSON.stringify(results));
      
      // Navigate to results
      router.push("/results");
    } catch (err: any) {
      console.error(err);
      setError("We couldn't connect to the analysis engine. Please make sure the FastAPI backend is running on http://localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className={`border-b ${
        elderMode 
          ? "border-slate-900 bg-white py-6" 
          : "border-slate-800 bg-slate-900/50 backdrop-blur py-4"
      } px-6 md:px-12 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <ShieldCheck className={`text-amber-500 ${elderMode ? "w-10 h-10" : "w-8 h-8"}`} />
            <span className={`font-extrabold tracking-tight ${
              elderMode ? "text-3xl text-slate-950" : "text-xl text-white"
            }`}>
              ElderShield
            </span>
          </Link>
          <ElderModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 py-10 px-6 md:px-12 ${
        elderMode ? "bg-white text-slate-950" : "bg-slate-950"
      }`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back button */}
          <div className="no-print">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 font-semibold transition-all ${
                elderMode 
                  ? "text-slate-950 text-xl border-b-2 border-black pb-1 hover:opacity-85" 
                  : "text-slate-400 hover:text-slate-200 text-sm"
              }`}
            >
              <ArrowLeft className={elderMode ? "w-6 h-6" : "w-4 h-4"} />
              <span>Back to home</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className={`font-black tracking-tight ${
              elderMode ? "text-4xl text-slate-950" : "text-3xl text-white"
            }`}>
              Submit a Document
            </h1>
            <p className={`text-slate-400 ${elderMode ? "text-xl text-slate-800 font-semibold" : "text-sm"}`}>
              Paste text or upload a PDF to extract obligations, financial risks, and rights waivers.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/40 p-5 rounded-xl text-red-300">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold">Connection Error</h4>
                <p className={elderMode ? "text-lg" : "text-sm"}>{error}</p>
              </div>
            </div>
          )}

          {/* Upload panel */}
          <div className={`rounded-2xl border p-6 md:p-8 ${
            elderMode 
              ? "border-slate-950 bg-white" 
              : "border-slate-800 bg-slate-900/10"
          }`}>
            <UploadBox onAnalyze={handleAnalyze} isLoading={loading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 md:px-12 text-center text-slate-500 text-xs ${
        elderMode ? "border-slate-900 bg-white text-slate-900" : "border-slate-900 bg-slate-950"
      }`}>
        <p className={elderMode ? "text-lg font-bold" : ""}>
          © 2026 ElderShield. Educational tool. Not legal advice.
        </p>
      </footer>
    </div>
  );
}

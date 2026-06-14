"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccessibility } from "../../lib/AccessibilityContext";
import ElderModeToggle from "../../components/ElderModeToggle";
import ClauseHighlighter from "../../components/ClauseHighlighter";
import RiskCard from "../../components/RiskCard";
import Checklist from "../../components/Checklist";
import { AnalysisResult, RiskClause } from "../../lib/types";
import { 
  ShieldCheck, 
  ArrowLeft, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Layers,
  DollarSign,
  Clock,
  Unlock
} from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const { elderMode } = useAccessibility();
  const [text, setText] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [selectedClause, setSelectedClause] = useState<RiskClause | null>(null);

  useEffect(() => {
    // Read from sessionStorage
    const storedText = sessionStorage.getItem("document_text");
    const storedResults = sessionStorage.getItem("analysis_results");

    if (!storedText || !storedResults) {
      // If no data, redirect to analyze page
      router.push("/analyze");
      return;
    }

    setText(storedText);
    const parsedResults = JSON.parse(storedResults) as AnalysisResult;
    setResults(parsedResults);

    // Auto-select first high-risk clause, or first medium, or first low
    if (parsedResults.clauses && parsedResults.clauses.length > 0) {
      const sorted = [...parsedResults.clauses].sort((a, b) => {
        const severityWeight = { high: 3, medium: 2, low: 1 };
        return severityWeight[b.severity] - severityWeight[a.severity];
      });
      setSelectedClause(sorted[0]);
    }
  }, [router]);

  if (!text || !results) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-slate-400 text-sm font-medium">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  const handleSelectClause = (clause: RiskClause) => {
    setSelectedClause(clause);
    // Smooth scroll to explanation panel on mobile
    const explanationEl = document.getElementById("explanation-panel");
    if (explanationEl) {
      explanationEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  // Extract counts for display
  const highCount = results.risk_counts.high || 0;
  const mediumCount = results.risk_counts.medium || 0;
  const lowCount = results.risk_counts.low || 0;

  // Key category statistics
  const rightsCount = results.category_counts["Rights Waiver"] || 0;
  const moneyCount = results.category_counts["Money Risk"] || 0;
  const deadlineCount = results.category_counts["Deadline Burden"] || 0;
  const proofCount = results.category_counts["Proof Burden"] || 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className={`border-b no-print ${
        elderMode 
          ? "border-slate-900 bg-white py-6" 
          : "border-slate-800 bg-slate-900/50 backdrop-blur py-4"
      } px-6 md:px-12 sticky top-0 z-50 transition-colors`}>
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
      <main className={`flex-1 py-8 px-6 md:px-12 ${
        elderMode ? "bg-white text-slate-950" : "bg-slate-950"
      }`}>
        <div className="max-w-7xl mx-auto space-y-8 print-container">
          {/* Back button */}
          <div className="no-print">
            <Link
              href="/analyze"
              className={`inline-flex items-center gap-2 font-semibold transition-all ${
                elderMode 
                  ? "text-slate-955 text-xl border-b-2 border-black pb-1 hover:opacity-85" 
                  : "text-slate-400 hover:text-slate-200 text-sm"
              }`}
            >
              <ArrowLeft className={elderMode ? "w-6 h-6" : "w-4 h-4"} />
              <span>Analyze another document</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className={`font-black tracking-tight ${
              elderMode ? "text-4xl text-slate-950" : "text-3xl text-white"
            }`}>
              Analysis Results Dashboard
            </h1>
            <p className={`text-slate-400 ${elderMode ? "text-xl text-slate-850 font-semibold" : "text-sm"}`}>
              {results.summary}
            </p>
          </div>

          {/* Stat Cards Row */}
          <section className="grid grid-cols-2 lg:grid-cols-6 gap-4 no-print">
            {/* High Risks */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-red-100 text-slate-950" 
                : "border-red-500/20 bg-red-500/[0.02]"
            }`}>
              <div className="flex items-center justify-between gap-2 text-red-500">
                <ShieldAlert className="w-5 h-5" />
                <span className={`font-bold ${elderMode ? "text-lg" : "text-xs uppercase"}`}>High Risk</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl text-red-700" : "text-3xl text-red-400"}`}>
                {highCount}
              </span>
            </div>

            {/* Medium Risks */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-orange-100 text-slate-950" 
                : "border-orange-500/20 bg-orange-500/[0.02]"
            }`}>
              <div className="flex items-center justify-between gap-2 text-orange-500">
                <AlertTriangle className="w-5 h-5" />
                <span className={`font-bold ${elderMode ? "text-lg" : "text-xs uppercase"}`}>Med Risk</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl text-orange-700" : "text-3xl text-orange-450"}`}>
                {mediumCount}
              </span>
            </div>

            {/* Rights Waivers */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-slate-100 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <Unlock className="w-5 h-5 text-purple-400" />
                <span className={`font-bold ${elderMode ? "text-lg text-slate-700" : "text-xs uppercase"}`}>Waivers</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl" : "text-3xl text-slate-200"}`}>
                {rightsCount}
              </span>
            </div>

            {/* Money Risks */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-slate-100 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className={`font-bold ${elderMode ? "text-lg text-slate-700" : "text-xs uppercase"}`}>Money</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl" : "text-3xl text-slate-200"}`}>
                {moneyCount}
              </span>
            </div>

            {/* Deadline Burdens */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-slate-100 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className={`font-bold ${elderMode ? "text-lg text-slate-700" : "text-xs uppercase"}`}>Deadlines</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl" : "text-3xl text-slate-200"}`}>
                {deadlineCount}
              </span>
            </div>

            {/* Proof Burdens */}
            <div className={`border rounded-xl p-4 flex flex-col justify-between gap-2 ${
              elderMode 
                ? "border-slate-950 bg-slate-100 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <div className="flex items-center justify-between gap-2 text-slate-400">
                <Layers className="w-5 h-5 text-yellow-400" />
                <span className={`font-bold ${elderMode ? "text-lg text-slate-700" : "text-xs uppercase"}`}>Proof reqs</span>
              </div>
              <span className={`font-black ${elderMode ? "text-4xl" : "text-3xl text-slate-200"}`}>
                {proofCount}
              </span>
            </div>
          </section>

          {/* Double Column Grid: Highlighter & Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Highlighter (8 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className={`font-bold ${elderMode ? "text-2xl text-slate-900" : "text-lg text-slate-200"}`}>
                Highlighted Original Text
              </h3>
              
              <div className={`p-1.5 rounded-2xl border ${
                elderMode ? "border-slate-950" : "border-slate-800 bg-slate-900/10"
              }`}>
                <ClauseHighlighter
                  fullText={text}
                  clauses={results.clauses}
                  selectedClauseId={selectedClause ? selectedClause.id : null}
                  onSelectClause={handleSelectClause}
                />
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg no-print ${
                elderMode ? "bg-blue-50 border border-slate-950" : "bg-slate-900/30 border border-slate-850"
              }`}>
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <p className={`text-slate-400 ${elderMode ? "text-md text-slate-900" : "text-xs"}`}>
                  Click on any highlighted phrase above to view its simple explanation on the right.
                </p>
              </div>
            </div>

            {/* Right Column: Detailed Explanation & Checklist (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Selected clause explanation card */}
              <div id="explanation-panel" className="space-y-4 scroll-mt-24">
                <h3 className={`font-bold ${elderMode ? "text-2xl text-slate-900" : "text-lg text-slate-200"}`}>
                  Linguistic Risk Explanation
                </h3>

                {selectedClause ? (
                  <div className={`p-1.5 rounded-2xl border ${
                    elderMode ? "border-slate-950" : "border-slate-800 bg-slate-900/10"
                  }`}>
                    <RiskCard clause={selectedClause} isSelected={true} />
                  </div>
                ) : (
                  <div className={`text-center py-16 px-6 border border-dashed rounded-2xl ${
                    elderMode ? "border-slate-950 text-slate-800 font-semibold" : "border-slate-800 text-slate-400"
                  }`}>
                    <p className={elderMode ? "text-xl" : "text-sm"}>
                      No highlighted clauses selected. Click a highlighted text fragment in the document to view.
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="no-print">
                <Checklist items={results.checklist} />
              </div>

            </div>
          </div>

          {/* Printable Checklist only layout section for printing */}
          <div className="hidden print:block space-y-8 pt-8">
            <h2 className="text-3xl font-extrabold text-black border-b-2 border-black pb-2">
              ElderShield — Before You Sign Checklist
            </h2>
            <p className="text-lg text-black leading-relaxed font-semibold">
              These questions were generated from the analysis of your document. Make sure to discuss them before signing.
            </p>
            <div className="border border-black rounded-lg p-6 bg-slate-50">
              <ul className="space-y-6">
                {results.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-xl text-black">
                    <span className="border-2 border-black w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold">
                      [ ]
                    </span>
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-700 italic pt-8 border-t border-gray-400">
              Disclaimer: ElderShield provides linguistic analysis for educational purposes. It is not legal advice.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 px-6 md:px-12 text-center text-slate-500 text-xs no-print ${
        elderMode ? "border-slate-900 bg-white text-slate-900" : "border-slate-900 bg-slate-950"
      }`}>
        <p className={elderMode ? "text-lg font-bold" : ""}>
          © 2026 ElderShield. Educational tool. Not legal advice.
        </p>
      </footer>
    </div>
  );
}

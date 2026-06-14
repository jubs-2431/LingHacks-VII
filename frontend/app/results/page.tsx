"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccessibility } from "../../lib/AccessibilityContext";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ClauseHighlighter from "../../components/ClauseHighlighter";
import RiskCard from "../../components/RiskCard";
import Checklist from "../../components/Checklist";
import ReportActions from "../../components/ReportActions";
import { AnalysisResult, RiskClause } from "../../lib/types";
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  DollarSign,
  Clock,
  Unlock,
} from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const { elderMode } = useAccessibility();
  const [text, setText] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [selectedClause, setSelectedClause] = useState<RiskClause | null>(null);

  useEffect(() => {
    const storedText = sessionStorage.getItem("document_text");
    const storedResults = sessionStorage.getItem("analysis_results");
    const storedWarnings = sessionStorage.getItem("extraction_warnings");

    if (!storedText || !storedResults) {
      router.push("/analyze");
      return;
    }

    try {
      queueMicrotask(() => {
        const parsedResults = JSON.parse(storedResults) as AnalysisResult;
        setText(storedText);
        setResults(parsedResults);
        if (storedWarnings) {
          const parsedWarnings = JSON.parse(storedWarnings);
          setExtractionWarnings(
            Array.isArray(parsedWarnings)
              ? parsedWarnings.filter((item) => typeof item === "string")
              : [],
          );
        }

        if (parsedResults.clauses && parsedResults.clauses.length > 0) {
          const sorted = [...parsedResults.clauses].sort((a, b) => {
            const severityWeight = { high: 3, medium: 2, low: 1 };
            return severityWeight[b.severity] - severityWeight[a.severity];
          });
          setSelectedClause(sorted[0]);
        }
      });
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem("analysis_results");
      router.push("/analyze");
    }
  }, [router]);

  if (!text || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-shield" />
          <p className="text-sm font-medium text-muted">Loading your analysis…</p>
        </div>
      </div>
    );
  }

  const handleSelectClause = (clause: RiskClause) => {
    setSelectedClause(clause);
    const explanationEl = document.getElementById("explanation-panel");
    if (explanationEl) {
      explanationEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const highCount = results.risk_counts.high || 0;
  const mediumCount = results.risk_counts.medium || 0;
  const rightsCount = results.category_counts["Rights Waiver"] || 0;
  const moneyCount = results.category_counts["Money Risk"] || 0;
  const deadlineCount = results.category_counts["Deadline Burden"] || 0;
  const proofCount = results.category_counts["Proof Burden"] || 0;
  const warnings = [...new Set([...extractionWarnings, ...results.warnings])];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteHeader />

      <main className="flex-1 px-6 py-8 md:px-12">
        <div className="print-container mx-auto max-w-7xl space-y-8">
          <div className="no-print">
            <Link
              href="/analyze"
              className={`inline-flex items-center gap-2 font-medium text-shield transition-colors hover:text-shield-dark ${
                elderMode ? "text-xl" : "text-sm"
              }`}
            >
              <ArrowLeft className={`keep-color ${elderMode ? "h-6 w-6" : "h-4 w-4"}`} />
              <span>Check another document</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-medium tracking-[-0.01em] text-ink">
              What we found
            </h1>
            <p className={`max-w-3xl text-muted ${elderMode ? "text-xl text-ink" : "text-lg"}`}>
              {results.summary}
            </p>
            <p className="text-xs text-faint">
              Reviewed {results.document_stats.clauses_reviewed} clauses and{" "}
              {results.document_stats.words.toLocaleString()} words using analysis
              version {results.analysis_version}.
            </p>
          </div>

          {warnings.map((warning) => (
            <div
              key={warning}
              className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 no-print"
            >
              <AlertTriangle className="keep-color mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className={elderMode ? "text-lg" : "text-sm"}>{warning}</p>
            </div>
          ))}

          <section className="grid grid-cols-2 gap-3 no-print lg:grid-cols-6">
            <StatCard icon={ShieldAlert} tone="red" label="High risk" value={highCount} elderMode={elderMode} />
            <StatCard icon={AlertTriangle} tone="amber" label="Medium" value={mediumCount} elderMode={elderMode} />
            <StatCard icon={Unlock} tone="neutral" label="Waivers" value={rightsCount} elderMode={elderMode} />
            <StatCard icon={DollarSign} tone="neutral" label="Money" value={moneyCount} elderMode={elderMode} />
            <StatCard icon={Clock} tone="neutral" label="Deadlines" value={deadlineCount} elderMode={elderMode} />
            <StatCard icon={Layers} tone="neutral" label="Proof reqs" value={proofCount} elderMode={elderMode} />
          </section>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-xl"}`}>
                Your document, highlighted
              </h3>
              <ClauseHighlighter
                fullText={text}
                clauses={results.clauses}
                selectedClauseId={selectedClause ? selectedClause.id : null}
                onSelectClause={handleSelectClause}
              />
              <div className="flex items-center gap-2.5 rounded-xl border border-shield/15 bg-shield-soft/50 p-3 no-print">
                <Info className="keep-color h-4 w-4 shrink-0 text-shield" />
                <p className={`text-shield-dark ${elderMode ? "text-base" : "text-sm"}`}>
                  Tap any highlighted phrase to see what it means on the right.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="features-side-card space-y-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
                <div id="explanation-panel" className="scroll-mt-24 space-y-4">
                  <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-xl"}`}>
                    Plain-English explanation
                  </h3>
                  {selectedClause ? (
                    <div className={elderMode ? "rounded-2xl border-2 border-slate-950 bg-white p-1.5" : ""}>
                      <RiskCard clause={selectedClause} isSelected={true} />
                    </div>
                  ) : (
                    <div
                      className={`rounded-2xl border border-dashed px-6 py-16 text-center ${
                        elderMode
                          ? "border-2 border-slate-950 bg-white text-slate-950"
                          : "border-line bg-surface text-muted"
                      }`}
                    >
                      <p className={elderMode ? "text-xl font-semibold" : "text-base"}>
                        Click a highlighted phrase in the document to see its explanation here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="no-print">
                  <Checklist items={results.checklist} />
                </div>
                <ReportActions results={results} />
              </div>
            </div>
          </div>

          <div className="hidden space-y-8 pt-8 print:block">
            <h2 className="border-b-2 border-black pb-2 text-3xl font-extrabold text-black">
              ElderShield — Before You Sign Checklist
            </h2>
            <p className="text-lg font-semibold leading-relaxed text-black">
              These questions were generated from the analysis of your document. Discuss them before signing.
            </p>
            <div className="rounded-lg border border-black p-6">
              <ul className="space-y-6">
                {results.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-xl text-black">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border-2 border-black font-bold">
                      [ ]
                    </span>
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="border-t border-gray-400 pt-8 text-sm italic text-gray-700">
              Disclaimer: ElderShield provides linguistic analysis for educational purposes. It is not legal advice.
            </p>
          </div>
        </div>
      </main>

      <div className="no-print">
        <SiteFooter elderMode={elderMode} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  elderMode,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "red" | "amber" | "neutral";
  label: string;
  value: number;
  elderMode: boolean;
}) {
  const styles =
    tone === "red"
      ? { card: "border-red-200 bg-red-50", icon: "text-red-600", value: "text-red-700" }
      : tone === "amber"
        ? { card: "border-amber-200 bg-amber-50", icon: "text-amber-600", value: "text-amber-700" }
        : { card: "border-line bg-surface", icon: "text-shield", value: "text-ink" };

  return (
    <div className={`flex flex-col justify-between gap-2 rounded-xl border p-4 ${styles.card}`}>
      <div className="flex items-center justify-between gap-2">
        <Icon className={`keep-color h-5 w-5 ${styles.icon}`} />
        <span className={`font-semibold uppercase tracking-wide text-muted ${elderMode ? "text-sm" : "text-[11px]"}`}>
          {label}
        </span>
      </div>
      <span className={`keep-color font-serif font-medium tabular-nums ${styles.value} ${elderMode ? "text-4xl" : "text-3xl"}`}>
        {value}
      </span>
    </div>
  );
}

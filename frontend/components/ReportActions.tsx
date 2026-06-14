"use client";

import React, { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { AnalysisResult } from "../lib/types";
import { useAccessibility } from "../lib/AccessibilityContext";


function buildTextReport(results: AnalysisResult): string {
  const findings = results.clauses
    .map(
      (finding, index) =>
        [
          `${index + 1}. ${finding.risk_type} (${finding.severity} risk, ${Math.round(finding.confidence * 100)}% pattern confidence)`,
          `Clause: ${finding.text}`,
          `Plain meaning: ${finding.plain_english}`,
          `Why it matters: ${finding.why_it_matters}`,
          `Question: ${finding.question_to_ask}`,
        ].join("\n"),
    )
    .join("\n\n");

  const checklist = results.checklist
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  return [
    "ElderShield Analysis Report",
    `Document type: ${results.document_type}`,
    `Analysis version: ${results.analysis_version}`,
    "",
    results.summary,
    "",
    "Findings",
    findings || "No supported patterns were detected.",
    "",
    "Before-you-sign checklist",
    checklist || "No checklist items were generated.",
    "",
    results.disclaimer,
  ].join("\n");
}

export default function ReportActions({ results }: { results: AnalysisResult }) {
  const { elderMode } = useAccessibility();
  const [status, setStatus] = useState<string | null>(null);
  const report = buildTextReport(results);

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "eldershield-analysis.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Report downloaded to this device.");
  };

  const shareReport = async () => {
    if (!navigator.share) {
      setStatus("System sharing is not supported in this browser. Download the report instead.");
      return;
    }
    try {
      await navigator.share({
        title: "ElderShield analysis",
        text: report,
      });
      setStatus("Report shared.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("The report could not be shared. Download it instead.");
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 no-print">
      <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-xl"}`}>
        Take the report with you
      </h3>
      <p className={`mt-2 text-muted ${elderMode ? "text-lg" : "text-sm"}`}>
        Nothing is uploaded for sharing. Your browser sends the report only after you choose an app or person.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadReport}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 font-semibold text-ink hover:border-shield hover:text-shield"
        >
          <Download className="keep-color h-4 w-4" />
          Download report
        </button>
        <button
          type="button"
          onClick={shareReport}
          className="inline-flex items-center gap-2 rounded-lg bg-shield px-4 py-2 font-semibold text-white hover:bg-shield-dark"
        >
          <Share2 className="keep-color h-4 w-4" />
          Share with caregiver
        </button>
      </div>
      {status && <p role="status" className="mt-3 text-sm font-medium text-muted">{status}</p>}
    </div>
  );
}

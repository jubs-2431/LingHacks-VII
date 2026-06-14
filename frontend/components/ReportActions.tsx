"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Download, Link2, LoaderCircle, Save, Share2 } from "lucide-react";
import { loadAnalysisSession, saveAnalysisSession } from "../lib/analysisSession";
import { useAccessibility } from "../lib/AccessibilityContext";
import { useAuth } from "../lib/AuthContext";
import {
  AnalysisResult,
  PageSpan,
  SavedReport,
  ShareLink,
} from "../lib/types";


function buildTextReport(results: AnalysisResult, warnings: string[]): string {
  const findings = results.clauses
    .map(
      (finding, index) =>
        [
          `${index + 1}. ${finding.risk_type} (${finding.severity} risk, ${Math.round(finding.confidence * 100)}% pattern confidence)`,
          finding.page_numbers.length
            ? `Page${finding.page_numbers.length > 1 ? "s" : ""}: ${finding.page_numbers.join(", ")}`
            : null,
          `Clause: ${finding.text}`,
          `Plain meaning: ${finding.plain_english}`,
          `Why it matters: ${finding.why_it_matters}`,
          `Question: ${finding.question_to_ask}`,
        ]
          .filter(Boolean)
          .join("\n"),
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
    warnings.length ? `Limitations:\n${warnings.join("\n")}` : null,
    results.disclaimer,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}


export default function ReportActions({
  results,
  text,
  pages,
  filename,
  initialReportId,
  warnings,
}: {
  results: AnalysisResult;
  text: string;
  pages: PageSpan[];
  filename: string | null;
  initialReportId: string | null;
  warnings: string[];
}) {
  const { elderMode } = useAccessibility();
  const { session, authorizedRequest } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(initialReportId);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [busyAction, setBusyAction] = useState<"save" | "share" | null>(null);
  const report = buildTextReport(results, warnings);

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

  const shareLocalReport = async () => {
    if (!navigator.share) {
      setStatus("System sharing is not supported in this browser. Download the report instead.");
      return;
    }
    try {
      await navigator.share({ title: "ElderShield analysis", text: report });
      setStatus("Report shared from this device.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("The report could not be shared. Download it instead.");
    }
  };

  const persistReport = async (): Promise<string> => {
    if (savedReportId) return savedReportId;
    const saved = await authorizedRequest<SavedReport>("/reports", {
      method: "POST",
      body: JSON.stringify({
        text,
        document_type: results.document_type,
        filename,
        pages,
        warnings,
      }),
    });
    setSavedReportId(saved.id);
    const current = loadAnalysisSession();
    if (current) {
      saveAnalysisSession({ ...current, reportId: saved.id });
    }
    return saved.id;
  };

  const saveEncryptedReport = async () => {
    setBusyAction("save");
    setStatus(null);
    try {
      await persistReport();
      setStatus("Encrypted report saved to your account.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The report could not be saved.");
    } finally {
      setBusyAction(null);
    }
  };

  const createProtectedLink = async () => {
    setBusyAction("share");
    setStatus(null);
    try {
      const reportId = await persistReport();
      const created = await authorizedRequest<ShareLink>(
        `/reports/${encodeURIComponent(reportId)}/shares`,
        {
          method: "POST",
          body: JSON.stringify({ expires_in_hours: 72, max_accesses: 20 }),
        },
      );
      setShareLink(created);
      try {
        await navigator.clipboard.writeText(created.share_url);
        setStatus("Protected link copied. It expires in 72 hours or after 20 opens.");
      } catch {
        setStatus("Protected link created. Copy it below.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "A protected link could not be created.");
    } finally {
      setBusyAction(null);
    }
  };

  const copyProtectedLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.share_url);
      setStatus("Protected link copied.");
    } catch {
      setStatus("Select and copy the link manually.");
    }
  };

  const revokeProtectedLink = async () => {
    if (!shareLink || !savedReportId) return;
    setBusyAction("share");
    setStatus(null);
    try {
      await authorizedRequest<void>(
        `/reports/${encodeURIComponent(savedReportId)}/shares/${encodeURIComponent(shareLink.id)}`,
        { method: "DELETE" },
      );
      setShareLink(null);
      setStatus("Protected link revoked.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The protected link could not be revoked.");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 no-print">
      <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-xl"}`}>
        Take the report with you
      </h3>
      <p className={`mt-2 text-muted ${elderMode ? "text-lg" : "text-sm"}`}>
        Downloading and system sharing stay on this device. Account saving is explicit and stores an encrypted copy for the retention period.
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
          onClick={shareLocalReport}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 font-semibold text-ink hover:border-shield hover:text-shield"
        >
          <Share2 className="keep-color h-4 w-4" />
          Share from device
        </button>

        {session ? (
          <>
            <button
              type="button"
              onClick={saveEncryptedReport}
              disabled={Boolean(savedReportId) || busyAction !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-shield px-4 py-2 font-semibold text-white hover:bg-shield-dark disabled:cursor-not-allowed disabled:bg-faint"
            >
              {busyAction === "save" ? (
                <LoaderCircle className="keep-color h-4 w-4 animate-spin" />
              ) : (
                <Save className="keep-color h-4 w-4" />
              )}
              {savedReportId ? "Saved securely" : "Save encrypted report"}
            </button>
            <button
              type="button"
              onClick={createProtectedLink}
              disabled={busyAction !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-shield px-4 py-2 font-semibold text-white hover:bg-shield-dark disabled:cursor-not-allowed disabled:bg-faint"
            >
              {busyAction === "share" ? (
                <LoaderCircle className="keep-color h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="keep-color h-4 w-4" />
              )}
              Create protected link
            </button>
          </>
        ) : (
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-shield px-4 py-2 font-semibold text-white hover:bg-shield-dark"
          >
            <Save className="keep-color h-4 w-4" />
            Sign in to save
          </Link>
        )}
      </div>

      {shareLink && (
        <div className="mt-4 rounded-xl border border-shield/20 bg-shield-soft/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-shield-dark">
            Protected caregiver link
          </p>
          <div className="mt-2 flex gap-2">
            <input
              readOnly
              value={shareLink.share_url}
              aria-label="Protected caregiver link"
              className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
            />
            <button
              type="button"
              onClick={copyProtectedLink}
              className="rounded-lg border border-shield/30 bg-white px-3 text-shield-dark hover:border-shield"
              aria-label="Copy protected caregiver link"
            >
              <Copy className="keep-color h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={revokeProtectedLink}
            disabled={busyAction !== null}
            className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
          >
            Revoke this link
          </button>
        </div>
      )}

      {status && (
        <p role="status" className="mt-3 text-sm font-medium text-muted">
          {status}
        </p>
      )}
    </div>
  );
}

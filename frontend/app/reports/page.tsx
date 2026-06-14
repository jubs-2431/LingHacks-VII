"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import AccountAccess from "../../components/AccountAccess";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { saveAnalysisSession } from "../../lib/analysisSession";
import { useAccessibility } from "../../lib/AccessibilityContext";
import { useAuth } from "../../lib/AuthContext";
import { SavedReport, SavedReportSummary } from "../../lib/types";


export default function ReportsPage() {
  const router = useRouter();
  const { elderMode } = useAccessibility();
  const { session, ready, logout, authorizedRequest } = useAuth();
  const [reports, setReports] = useState<SavedReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    if (!session) {
      setReports([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setReports(await authorizedRequest<SavedReportSummary[]>("/reports?limit=100"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saved reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [authorizedRequest, session]);

  useEffect(() => {
    queueMicrotask(() => void loadReports());
  }, [loadReports]);

  const openReport = async (reportId: string) => {
    setBusyId(reportId);
    setError(null);
    try {
      const report = await authorizedRequest<SavedReport>(
        `/reports/${encodeURIComponent(reportId)}`,
      );
      saveAnalysisSession({
        text: report.text,
        results: report.analysis,
        extractionWarnings: [],
        pages: report.pages,
        filename: report.filename,
        reportId: report.id,
      });
      router.push("/results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The report could not be opened.");
      setBusyId(null);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!window.confirm("Delete this saved report and revoke its active share links?")) {
      return;
    }
    setBusyId(reportId);
    setError(null);
    try {
      await authorizedRequest<void>(`/reports/${encodeURIComponent(reportId)}`, {
        method: "DELETE",
      });
      setReports((current) => current.filter((report) => report.id !== reportId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The report could not be deleted.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="keep-color h-7 w-7 text-shield" />
              <p className="font-semibold uppercase tracking-[0.2em] text-shield">
                Private report library
              </p>
            </div>
            <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">
              Saved reports
            </h1>
            <p className={`max-w-3xl text-muted ${elderMode ? "text-xl" : "text-base"}`}>
              Reopen encrypted reports during their retention period, or delete one to revoke its active share links.
            </p>
          </div>

          {!ready ? (
            <div className="flex justify-center py-16">
              <LoaderCircle className="keep-color h-8 w-8 animate-spin text-shield" />
            </div>
          ) : !session ? (
            <AccountAccess />
          ) : (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
                <p className="text-sm text-muted">
                  Signed in as <strong className="text-ink">{session.user.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 font-semibold text-ink hover:border-shield hover:text-shield"
                >
                  <LogOut className="keep-color h-4 w-4" />
                  Sign out
                </button>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
                  {error}
                </p>
              )}

              {loading ? (
                <div className="flex justify-center py-16">
                  <LoaderCircle className="keep-color h-8 w-8 animate-spin text-shield" />
                </div>
              ) : reports.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
                  <FileText className="keep-color mx-auto h-10 w-10 text-faint" />
                  <h2 className="mt-4 font-serif text-2xl">No saved reports yet</h2>
                  <p className="mt-2 text-muted">
                    Analyze a document, then choose “Save encrypted report” on the results page.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-2xl border border-line bg-surface p-5"
                    >
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div className="min-w-0">
                          <h2 className="truncate font-serif text-2xl font-medium">
                            {report.filename || `${report.document_type} document`}
                          </h2>
                          <p className="mt-1 text-sm text-muted">
                            {report.finding_count} findings
                            {report.highest_severity
                              ? ` · Highest risk: ${report.highest_severity}`
                              : ""}
                            {" · "}
                            Saved {new Date(report.created_at).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-xs text-faint">
                            Expires {new Date(report.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => void openReport(report.id)}
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-2 rounded-lg bg-shield px-4 py-2 font-semibold text-white hover:bg-shield-dark disabled:bg-faint"
                          >
                            {busyId === report.id ? (
                              <LoaderCircle className="keep-color h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="keep-color h-4 w-4" />
                            )}
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteReport(report.id)}
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:border-red-400 disabled:opacity-50"
                          >
                            <Trash2 className="keep-color h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <SiteFooter elderMode={elderMode} />
    </div>
  );
}

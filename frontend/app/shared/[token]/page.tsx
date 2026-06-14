"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, LoaderCircle, ShieldCheck } from "lucide-react";
import { saveAnalysisSession } from "../../../lib/analysisSession";
import { getSharedReport } from "../../../lib/api";


export default function SharedReportPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.token;
    if (!token) {
      queueMicrotask(() => setError("This protected link is invalid."));
      return;
    }
    void getSharedReport(token)
      .then((report) => {
        saveAnalysisSession({
          text: report.text,
          results: report.analysis,
          extractionWarnings: [],
          pages: report.pages,
          filename: report.filename,
          reportId: null,
        });
        router.replace("/results");
      })
      .catch((caught) => {
        setError(
          caught instanceof Error
            ? caught.message
            : "This protected link is unavailable.",
        );
      });
  }, [params.token, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
        {error ? (
          <>
            <AlertTriangle className="keep-color mx-auto h-10 w-10 text-amber-600" />
            <h1 className="mt-4 font-serif text-3xl">Report unavailable</h1>
            <p role="alert" className="mt-3 text-muted">
              {error}
            </p>
            <Link
              href="/analyze"
              className="mt-6 inline-flex rounded-lg bg-shield px-5 py-3 font-semibold text-white hover:bg-shield-dark"
            >
              Analyze another document
            </Link>
          </>
        ) : (
          <>
            <ShieldCheck className="keep-color mx-auto h-10 w-10 text-shield" />
            <h1 className="mt-4 font-serif text-3xl">Opening protected report</h1>
            <p className="mt-3 text-muted">
              The link is being verified and the encrypted report is being loaded.
            </p>
            <LoaderCircle className="keep-color mx-auto mt-6 h-7 w-7 animate-spin text-shield" />
          </>
        )}
      </div>
    </main>
  );
}

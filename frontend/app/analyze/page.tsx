"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccessibility } from "../../lib/AccessibilityContext";
import ElderModeToggle from "../../components/ElderModeToggle";
import UploadBox from "../../components/UploadBox";
import { analyzeText } from "../../lib/api";
import { saveAnalysisSession } from "../../lib/analysisSession";
import { DocumentType, PageSpan } from "../../lib/types";
import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function AnalyzePage() {
  const router = useRouter();
  const { elderMode } = useAccessibility();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (
    text: string,
    documentType: DocumentType,
    extractionWarnings: string[],
    pages: PageSpan[],
    filename: string | null,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const results = await analyzeText(text, documentType, pages);
      saveAnalysisSession({
        text,
        results,
        extractionWarnings,
        pages,
        filename,
        reportId: null,
      });
      router.push("/results");
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't connect to the analysis engine. Please make sure the FastAPI backend is running on http://localhost:8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const holdVideoOnFinalFrame = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.pause();
    video.currentTime = Math.max(0, video.duration - 0.08);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-white">
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 h-[130vh] w-full object-cover opacity-20"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={holdVideoOnFinalFrame}
      >
        <source src={VIDEO_SRC} />
      </video>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_20%_15%,rgba(170,220,255,0.18),transparent_32%),linear-gradient(180deg,rgba(0,8,13,0.62),rgba(0,8,13,0.92))]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-black/20" />

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <Link href="/" className="keep-color text-3xl tracking-tight text-white" style={{ fontFamily: "var(--font-display), serif" }}>
          ElderShield<sup className="text-xs">®</sup>
        </Link>
        <div className="flex items-center gap-3">
          <ElderModeToggle />
          <Link href="/" className="liquid-glass keep-color rounded-full px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]">
            Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 px-6 pb-20 pt-32 md:px-12 md:pt-36">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <section className="keep-color space-y-8 text-white">
            <Link
              href="/"
              className={`liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white transition-transform hover:scale-[1.03] ${
                elderMode ? "text-xl" : "text-sm"
              }`}
            >
              <ArrowLeft className={`keep-color ${elderMode ? "h-6 w-6" : "h-4 w-4"}`} />
              <span>Back to story</span>
            </Link>

            <div className="space-y-5">
              <p className="keep-color text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
                Document analyzer
              </p>
              <h1 className="keep-color max-w-3xl font-serif text-5xl leading-[0.94] tracking-[-0.03em] text-white md:text-7xl">
                Drop in the fine print. Get the risks back in plain English.
              </h1>
              <p className={`keep-color max-w-2xl leading-8 text-slate-200 ${elderMode ? "text-2xl" : "text-lg"}`}>
                Upload a PDF or paste legal text. ElderShield highlights risky language, explains what it means, and turns it into a before-you-sign checklist.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Find risks"],
                ["02", "Trace source"],
                ["03", "Ask clearly"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <span className="keep-color text-xs font-semibold tracking-[0.28em] text-slate-300">{number}</span>
                  <p className={`keep-color mt-5 font-serif leading-none text-white ${elderMode ? "text-3xl" : "text-2xl"}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/20 bg-white/10 p-2 shadow-[0_50px_160px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="rounded-[1.6rem] border border-white/20 bg-slate-900/60 p-6 text-white shadow-inner md:p-8">
              <div className="mb-6 flex items-start gap-3 border-b border-white/10 pb-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-500">
                  <ShieldCheck className="keep-color h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-medium tracking-[-0.01em] text-white">
                    Check a document
                  </h2>
                  <p className={`mt-1 text-slate-300 ${elderMode ? "text-lg text-slate-200" : "text-sm"}`}>
                    Fill out the details below.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-5 text-red-800">
                  <AlertCircle className="keep-color mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                  <div className="space-y-1">
                    <h4 className="font-semibold">Connection error</h4>
                    <p className={elderMode ? "text-lg" : "text-sm"}>{error}</p>
                  </div>
                </div>
              )}

              <UploadBox onAnalyze={handleAnalyze} isLoading={loading} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

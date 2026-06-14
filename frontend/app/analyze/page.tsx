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
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <video
        ref={videoRef}
        className="fixed inset-0 z-0 h-[130vh] w-full object-cover opacity-25"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={holdVideoOnFinalFrame}
      >
        <source src={VIDEO_SRC} />
      </video>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-paper/90" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-white/20" />

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
        <Link href="/" className="keep-color text-3xl tracking-tight text-ink" style={{ fontFamily: "var(--font-display), serif" }}>
          ElderShield<sup className="text-xs">®</sup>
        </Link>
        <div className="flex items-center gap-3">
          <ElderModeToggle />
          <Link href="/" className="rounded-full border border-line bg-surface/90 px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:border-shield hover:text-shield">
            Home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 px-6 pb-20 pt-32 md:px-12 md:pt-36">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <section className="space-y-8 text-ink">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-5 py-2.5 font-medium text-shield shadow-sm transition-colors hover:border-shield-dark hover:text-shield-dark ${
                elderMode ? "text-xl" : "text-sm"
              }`}
            >
              <ArrowLeft className={`keep-color ${elderMode ? "h-6 w-6" : "h-4 w-4"}`} />
              <span>Back to home</span>
            </Link>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-faint">
                Document check
              </p>
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.03em] text-ink md:text-7xl">
                Check the parts that matter before signing.
              </h1>
              <p className={`max-w-2xl leading-8 text-muted ${elderMode ? "text-2xl text-ink" : "text-lg"}`}>
                Upload a lease, form, bill, contract, or policy. ElderShield points out fees, deadlines, waivers, and questions worth asking.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Upload"],
                ["02", "Review"],
                ["03", "Ask"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl border border-line bg-surface/90 p-4 shadow-sm">
                  <span className="text-xs font-semibold tracking-[0.24em] text-faint">{number}</span>
                  <p className={`mt-5 font-serif leading-none text-ink ${elderMode ? "text-3xl" : "text-2xl"}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-line bg-surface/90 p-2 shadow-xl shadow-black/10 backdrop-blur-sm">
            <div className="rounded-[1.6rem] border border-line bg-[#fffdf7] p-6 text-ink shadow-inner md:p-8">
              <div className="mb-6 flex items-start gap-3 border-b border-line pb-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-shield text-white">
                  <ShieldCheck className="keep-color h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-medium tracking-[-0.01em] text-ink">
                    Check a document
                  </h2>
                  <p className={`mt-1 text-muted ${elderMode ? "text-lg text-ink" : "text-sm"}`}>
                    Upload a file or paste text. Nothing is saved unless you choose to save a report later.
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

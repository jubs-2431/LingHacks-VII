"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "./ElderModeToggle";

export default function SiteHeader() {
  const { elderMode } = useAccessibility();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center rounded-xl bg-shield text-white" style={{ padding: elderMode ? 10 : 8 }}>
            <ShieldCheck className={`keep-color ${elderMode ? "h-7 w-7" : "h-5 w-5"}`} />
          </span>
          <span
            className={`font-serif font-semibold tracking-[-0.01em] text-ink ${
              elderMode ? "text-3xl" : "text-xl"
            }`}
          >
            KinClause
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className={`font-semibold text-shield hover:text-shield-dark ${
              elderMode ? "text-lg" : "text-sm"
            }`}
          >
            Saved reports
          </Link>
          <ElderModeToggle />
        </div>
      </div>
    </header>
  );
}

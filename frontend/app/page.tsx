"use client";

import Link from "next/link";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";

const navItems = ["Home", "Studio", "About", "Journal", "Reach Us"];

export default function LandingPage() {
  const { elderMode } = useAccessibility();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" />
      </video>

      <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <Link
          href="/"
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          ElderShield<sup className="text-xs">®</sup>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : "#"}
              className={`text-sm transition-colors hover:text-foreground ${
                item === "Home" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ElderModeToggle />
          <Link
            href="/analyze"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-150 hover:scale-[1.03]"
          >
            Analyze Document
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-6 py-[90px] text-center">
        <h1
          className={`animate-fade-rise max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] ${
            elderMode ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-7xl md:text-8xl"
          }`}
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Where <em className="not-italic text-muted-foreground">clarity</em> rises{" "}
          <em className="not-italic text-muted-foreground">through the fine print.</em>
        </h1>

        <p
          className={`animate-fade-rise-delay mt-8 max-w-2xl leading-relaxed text-muted-foreground ${
            elderMode ? "text-2xl" : "text-base sm:text-lg"
          }`}
        >
          ElderShield turns complex legal documents into plain-language risk maps for seniors,
          families, and anyone who wants to understand what they are signing before it matters.
        </p>

        <div className="animate-fade-rise-delay-2 mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/analyze"
            className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${
              elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"
            }`}
          >
            Begin Analysis
          </Link>
          <span className="text-sm text-muted-foreground">
            Free · No account · Built for accessibility
          </span>
        </div>
      </main>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import SiteHeader from "../components/SiteHeader";
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  ScrollText,
  Ear,
  Printer,
} from "lucide-react";

export default function LandingPage() {
  const { elderMode } = useAccessibility();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(60% 50% at 50% -8%, rgba(21,112,107,0.10), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-5xl px-6 py-16 text-center md:px-12 md:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-shield/25 bg-shield-soft px-4 py-1.5 text-shield">
              <ShieldAlert className="h-4 w-4" />
              <span className={`font-semibold ${elderMode ? "text-lg" : "text-sm"}`}>
                Plain-language protection before you sign
              </span>
            </span>

            <h1
              className={`mx-auto mt-7 max-w-3xl font-serif font-medium leading-[1.04] tracking-[-0.02em] text-ink ${
                elderMode ? "text-5xl md:text-7xl" : "text-5xl md:text-7xl"
              }`}
            >
              Before you sign,{" "}
              <span className="text-shield">know what it means.</span>
            </h1>

            <p
              className={`mx-auto mt-6 max-w-2xl leading-8 text-muted ${
                elderMode ? "text-2xl font-medium text-ink" : "text-lg md:text-xl"
              }`}
            >
              ElderShield reads the fine print for you and points to the exact
              phrases where legal language creates hidden costs, deadlines, and
              lost rights — in clear, large, friendly English.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/analyze"
                className={`group inline-flex items-center gap-3 rounded-full bg-shield font-semibold text-white shadow-lg shadow-shield/20 transition-colors hover:bg-shield-dark ${
                  elderMode ? "px-10 py-5 text-2xl" : "px-8 py-4 text-lg"
                }`}
              >
                <span>Analyze a document</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className={`text-muted ${elderMode ? "text-lg" : "text-sm"}`}>
                Free · No account · Nothing stored
              </span>
            </div>
          </div>
        </section>

        {/* Problem vs Solution */}
        <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-line bg-surface p-8">
              <h2
                className={`flex items-center gap-2 font-serif font-medium text-red-700 ${
                  elderMode ? "text-3xl" : "text-2xl"
                }`}
              >
                The problem
              </h2>
              <ul className={`mt-5 space-y-4 text-ink ${elderMode ? "text-xl" : "text-base"}`}>
                <ProblemItem tone="bad" title="Jargon overload">
                  Official paperwork uses confusing words that hide what you are
                  actually agreeing to.
                </ProblemItem>
                <ProblemItem tone="bad" title="Hidden traps">
                  Automatic renewals, binding arbitration, and short deadlines are
                  buried in dense paragraphs.
                </ProblemItem>
                <ProblemItem tone="bad" title="High stakes">
                  A missed clause can mean sudden fees, lost rights, or shared
                  personal data.
                </ProblemItem>
              </ul>
            </article>

            <article className="rounded-2xl border border-shield/20 bg-shield-soft/50 p-8">
              <h2
                className={`flex items-center gap-2 font-serif font-medium text-shield-dark ${
                  elderMode ? "text-3xl" : "text-2xl"
                }`}
              >
                How ElderShield helps
              </h2>
              <ul className={`mt-5 space-y-4 text-ink ${elderMode ? "text-xl" : "text-base"}`}>
                <ProblemItem tone="good" title="Finds the risky phrases">
                  We isolate the exact sentences that create legal burdens, and
                  show you where they are.
                </ProblemItem>
                <ProblemItem tone="good" title="Explains in plain English">
                  Each clause is rewritten in simple, large-font language anyone
                  can follow.
                </ProblemItem>
                <ProblemItem tone="good" title="Gives you questions to ask">
                  You leave with a printable checklist of questions for a family
                  member, caregiver, or lawyer.
                </ProblemItem>
              </ul>
            </article>
          </div>
        </section>

        {/* Example extraction */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-20">
            <div className="text-center">
              <p className="font-serif text-sm font-semibold uppercase tracking-[0.18em] text-shield">
                See it in action
              </p>
              <h3
                className={`mt-3 font-serif font-medium text-ink ${
                  elderMode ? "text-4xl" : "text-3xl md:text-4xl"
                }`}
              >
                From legalese to plain meaning.
              </h3>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper/60 p-6">
                <span className={`font-semibold uppercase tracking-wide text-muted ${elderMode ? "text-base" : "text-xs"}`}>
                  The document says
                </span>
                <p
                  className={`mt-4 font-serif leading-relaxed text-ink ${
                    elderMode ? "text-xl" : "text-lg"
                  }`}
                >
                  “You agree to resolve all disputes through{" "}
                  <mark className="rounded bg-red-100 px-1 text-red-800 underline decoration-red-400 decoration-2 underline-offset-2">
                    binding arbitration
                  </mark>{" "}
                  and{" "}
                  <mark className="rounded bg-red-100 px-1 text-red-800 underline decoration-red-400 decoration-2 underline-offset-2">
                    waive your right
                  </mark>{" "}
                  to participate in any class action.”
                </p>
              </div>

              <div className="rounded-2xl border border-shield/25 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold uppercase tracking-wide text-shield ${elderMode ? "text-base" : "text-xs"}`}>
                    ElderShield explains
                  </span>
                  <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    High risk
                  </span>
                </div>
                <p className={`mt-4 font-semibold text-ink ${elderMode ? "text-xl" : "text-lg"}`}>
                  You give up your right to take this company to court — disputes
                  go to private arbitration instead.
                </p>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-shield/15 bg-shield-soft/60 p-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-shield" />
                  <span className={`italic text-shield-dark ${elderMode ? "text-lg" : "text-sm"}`}>
                    Ask: “Can I opt out of binding arbitration, and how?”
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-20">
          <div className="text-center">
            <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-4xl" : "text-3xl"}`}>
              Built for real accessibility.
            </h3>
            <p className={`mx-auto mt-4 max-w-2xl text-muted ${elderMode ? "text-xl text-ink" : "text-base"}`}>
              Accessibility is the point, not an afterthought.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Feature icon={ScrollText} title="Large, simple language" body="High-contrast type and one-click Elder Mode for even larger text." />
            <Feature icon={Ear} title="Read aloud" body="Every explanation can be spoken with built-in text-to-speech." />
            <Feature icon={Printer} title="Printable checklist" body="Take a clean list of questions to your next appointment." />
          </div>
        </section>
      </main>

      <SiteFooter elderMode={elderMode} />
    </div>
  );
}

function ProblemItem({
  tone,
  title,
  children,
}: {
  tone: "bad" | "good";
  title: string;
  children: React.ReactNode;
}) {
  const Icon = tone === "good" ? CheckCircle2 : ShieldAlert;
  const color = tone === "good" ? "text-shield" : "text-red-600";
  return (
    <li className="flex items-start gap-3">
      <Icon className={`keep-color mt-0.5 h-5 w-5 shrink-0 ${color}`} />
      <span>
        <strong className="font-semibold text-ink">{title}.</strong>{" "}
        <span className="text-muted">{children}</span>
      </span>
    </li>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 text-left">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-shield-soft text-shield">
        <Icon className="keep-color h-5 w-5" />
      </span>
      <h4 className="mt-4 font-serif text-xl font-medium text-ink">{title}</h4>
      <p className="mt-2 leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function SiteFooter({ elderMode }: { elderMode: boolean }) {
  return (
    <footer className="border-t border-line bg-paper px-6 py-10 text-center md:px-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <p className={`text-muted ${elderMode ? "text-lg font-semibold text-ink" : "text-sm"}`}>
          © 2026 ElderShield Project · Created for LingHacks VII
        </p>
        <p className={`mx-auto leading-relaxed text-faint ${elderMode ? "text-base text-ink" : "text-xs"}`}>
          <strong className="text-muted">Important:</strong> ElderShield is not a
          lawyer and does not provide legal advice. It is an educational tool that
          uses computational linguistics to highlight potential risks and suggest
          questions to ask before you sign.
        </p>
      </div>
    </footer>
  );
}

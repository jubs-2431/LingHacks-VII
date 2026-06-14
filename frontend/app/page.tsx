"use client";

import Link from "next/link";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import styles from "./page.module.css";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Accessibility", href: "#accessibility" },
  { label: "Reach Us", href: "#reach-us" },
];

const riskCards = [
  ["Rights waiver", "Finds phrases that remove your ability to sue, appeal, or join a class action."],
  ["Hidden money", "Flags late fees, automatic renewals, cancellation costs, and confusing billing terms."],
  ["Urgent deadlines", "Pulls out dates, opt-out windows, notice periods, and response requirements."],
];

export default function LandingPage() {
  const { elderMode } = useAccessibility();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" />
      </video>

      <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        {navItems.slice(0, 4).map((item) => (
          <a key={item.href} href={item.href} className={styles.scrollDot} aria-label={`Scroll to ${item.label}`} />
        ))}
      </div>

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a
          href="#home"
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          ElderShield<sup className="text-xs">®</sup>
        </a>

        <div className="liquid-glass hidden items-center gap-2 rounded-full px-3 py-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {item.label}
            </a>
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

      <main className="relative z-10">
        <section id="home" className={`${styles.cinematicSection} flex min-h-screen flex-col items-center justify-center px-6 py-[120px] text-center`}>
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
            <a
              href="#dashboard"
              className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${
                elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"
              }`}
            >
              View Dashboard
            </a>
            <span className="text-sm text-muted-foreground">Scroll to explore · One-page demo</span>
          </div>

          <a href="#dashboard" className={styles.scrollCue} aria-label="Scroll to dashboard">
            <span />
          </a>
        </section>

        <section id="dashboard" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}>
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={`${styles.glassPanel} p-8 md:p-10`}>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Dashboard</p>
              <h2 className="mt-5 max-w-xl font-serif text-5xl leading-none tracking-tight md:text-7xl">
                Your document becomes a calm risk map.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Judges can scroll through the full story, then click into the live analyzer when they are ready to test the product.
              </p>
              <Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-8 py-4 text-sm text-foreground transition-transform hover:scale-[1.03]">
                Open Analyzer
              </Link>
            </div>

            <div className="grid gap-4">
              {riskCards.map(([title, body], index) => (
                <article key={title} className={`${styles.glassPanel} group p-6 transition-transform duration-300 hover:-translate-y-1`}>
                  <div className="flex items-start gap-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-sm text-muted-foreground">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-3xl text-foreground">{title}</h3>
                      <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}>
          <div className="w-full">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">How it works</p>
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                ["Upload", "Drop in a legal document or paste the text."],
                ["Extract", "The system finds clauses tied to money, deadlines, rights, and obligations."],
                ["Explain", "Each risky phrase becomes plain English with questions to ask next."],
              ].map(([title, body]) => (
                <article key={title} className={`${styles.glassPanel} min-h-72 p-7`}>
                  <h3 className="font-serif text-4xl">{title}</h3>
                  <p className="mt-5 text-lg leading-8 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="accessibility" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}>
          <div className={`${styles.glassPanel} mx-auto max-w-4xl p-8 text-center md:p-12`}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Accessibility</p>
            <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Designed for people who need clarity most.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Elder Mode increases text size and contrast, explanations stay short, and the final checklist is easy to print or read aloud.
            </p>
          </div>
        </section>

        <section id="reach-us" className={`${styles.cinematicSection} flex min-h-screen items-center justify-center px-6 py-28 text-center`}>
          <div className={`${styles.glassPanel} max-w-3xl p-8 md:p-12`}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Reach Us</p>
            <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Ready for the live demo.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Use the analyzer button to test the backend workflow, or keep scrolling manually to experience the one-page cinematic pitch.
            </p>
            <Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-10 py-4 text-foreground transition-transform hover:scale-[1.03]">
              Analyze Document
            </Link>
          </div>
        </section>
      </main>
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
          <strong className="text-muted">Important:</strong> ElderShield is not a lawyer and does not provide legal advice. It is an educational tool that uses computational linguistics to highlight potential risks and suggest questions to ask before you sign.
        </p>
      </div>
    </footer>
  );
}

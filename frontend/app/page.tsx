"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import styles from "./page.module.css";

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function LandingPage() {
  const { elderMode } = useAccessibility();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const bgY = useTransform(smoothProgress, [0, 1], ["0vh", "-24vh"]);

  const holdVideoOnFinalFrame = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.pause();
    video.currentTime = Math.max(0, video.duration - 0.08);
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <motion.video ref={videoRef} className="fixed inset-0 z-0 h-[130vh] w-full object-cover" autoPlay muted playsInline preload="auto" onEnded={holdVideoOnFinalFrame} style={{ y: bgY }}>
        <source src={VIDEO_SRC} />
      </motion.video>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/25" aria-hidden />

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link href="/" className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display), serif" }}>
          KinClause<sup className="text-xs">®</sup>
        </Link>
        <div className="flex items-center gap-3">
          <ElderModeToggle />
          <Link href="/analyze" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-150 hover:scale-[1.03]">
            Analyze Document
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="flex min-h-screen items-center justify-center px-6 text-center md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mx-auto mb-6 max-w-fit rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200 backdrop-blur-xl">
              Plain language review
            </p>
            <h1 className={`mx-auto max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] ${elderMode ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-7xl md:text-8xl"}`} style={{ fontFamily: "var(--font-display), serif" }}>
              Where clarity rises through the fine print.
            </h1>
            <p className={`mx-auto mt-8 max-w-2xl leading-relaxed text-slate-200 ${elderMode ? "text-2xl" : "text-base sm:text-lg"}`}>
              KinClause turns confusing documents into clear highlights, source traces, and questions families can understand.
            </p>
            <div className="mt-12 flex justify-center">
              <Link href="/analyze" className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"}`}>
                Analyze Document
              </Link>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-32 md:px-12">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-amber-500">Core features</p>
            <h2 className="font-serif text-5xl leading-tight text-white md:text-7xl">How KinClause works.</h2>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {["Highlight", "Trace", "Ask"].map((title, index) => (
              <article key={title} className="rounded-3xl border border-white/20 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <span className="text-sm font-bold tracking-widest text-amber-500">0{index + 1}</span>
                <h3 className="mt-4 font-serif text-3xl text-white">{title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-slate-300">Simple steps for reviewing the parts that need extra attention.</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.cinematicSection} flex min-h-screen items-center justify-center px-6 py-28 text-center`}>
          <div className={`${styles.editorPanel} ${styles.depthCard} max-w-3xl p-8 md:p-12`}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Live demo</p>
            <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Ready to test the analyzer.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Paste text or upload a file to see plain-language notes and an action checklist.</p>
            <Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-10 py-4 text-foreground transition-transform hover:scale-[1.03]">
              Analyze Document
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

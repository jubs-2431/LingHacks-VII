"use client";

import { type MouseEvent, type ReactNode, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import styles from "./page.module.css";

const VIDEO_SRC = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";
const FRAME_COUNT = 72;

const navItems = [
  { label: "Story", href: "#story", id: "story" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Demo", href: "#demo", id: "demo" },
];

const featureCards = [
  [
    "Clause lens",
    "A scroll-driven evidence layer separates risky legal language from the surrounding document. ElderShield scans for arbitration, class-action waivers, automatic renewal, late fees, cancellation windows, and vague obligations, then slows down the exact words that deserve attention.",
  ],
  [
    "Source trace",
    "Each warning becomes a source-linked explanation. Users see the original trigger phrase, why it matters, and where to verify it instead of receiving a disconnected AI summary.",
  ],
  [
    "Action checklist",
    "The output becomes practical before signing: what to ask, what dates to watch, what to confirm, and when to get help from a family member, caregiver, administrator, or lawyer.",
  ],
];

function makeFrame(index: number) {
  const t = index / (FRAME_COUNT - 1);
  const a = Math.max(0, Math.min(1, (t - 0.16) / 0.28));
  const b = Math.max(0, Math.min(1, (t - 0.48) / 0.24));
  const y = 42 - t * 52;
  const scan = 92 + t * 320;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 560"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,.22)"/><stop offset="1" stop-color="rgba(255,255,255,.04)"/></linearGradient><filter id="f"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="880" height="560" fill="transparent"/><circle cx="520" cy="280" r="${130 + t * 130}" fill="rgba(130,210,255,.12)" filter="url(#f)"/><g transform="translate(130 ${y}) rotate(${-6 + t * 10} 310 270)"><rect width="620" height="430" rx="34" fill="url(#g)" stroke="rgba(255,255,255,.28)"/><rect x="48" y="62" width="220" height="12" rx="6" fill="rgba(255,255,255,.75)"/><rect x="48" y="112" width="520" height="8" rx="4" fill="rgba(255,255,255,.2)"/><rect x="48" y="140" width="470" height="8" rx="4" fill="rgba(255,255,255,.16)"/><rect x="48" y="192" width="${180 + a * 320}" height="34" rx="17" fill="rgba(255,255,255,${.08 + a * .28})" stroke="rgba(255,255,255,${.12 + a * .34})"/><rect x="48" y="254" width="${160 + b * 350}" height="34" rx="17" fill="rgba(136,210,255,${b * .28})" stroke="rgba(136,210,255,${b * .55})"/><rect x="48" y="334" width="${140 + b * 390}" height="42" rx="21" fill="rgba(255,255,255,${b * .16})" stroke="rgba(255,255,255,${b * .35})"/><rect x="34" y="${scan}" width="552" height="2" rx="1" fill="rgba(255,255,255,.86)" opacity="${.2 + t * .5}"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 36, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { elderMode } = useAccessibility();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const frames = useMemo(() => Array.from({ length: FRAME_COUNT }, (_, index) => makeFrame(index)), []);
  const [activeSection, setActiveSection] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const bgY = useTransform(smoothProgress, [0, 1], ["0vh", "-30vh"]);
  const midY = useTransform(smoothProgress, [0, 1], ["0vh", "-60vh"]);
  const topProgressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  const { scrollYProgress: storyProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const sequenceScale = useTransform(storyProgress, [0, 0.55, 1], [0.92, 1.05, 0.96]);
  const sequenceOpacity = useTransform(storyProgress, [0, 0.08, 0.88, 1], [0, 1, 1, 0.22]);
  const titleOpacity = useTransform(storyProgress, [0, 0.08, 0.82, 1], [0, 1, 1, 0]);
  const titleY = useTransform(storyProgress, [0, 0.12, 0.84, 1], [20, 0, 0, -20]);

  useMotionValueEvent(storyProgress, "change", (latest) => setFrameIndex(Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(latest * (FRAME_COUNT - 1))))));
  useMotionValueEvent(scrollYProgress, "change", () => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const center = window.scrollY + window.innerHeight / 2;
    const nearestIndex = sections.reduce((bestIndex, section, index) => {
      const best = sections[bestIndex];
      return Math.abs(section.offsetTop + section.offsetHeight / 2 - center) < Math.abs(best.offsetTop + best.offsetHeight / 2 - center) ? index : bestIndex;
    }, 0);
    setActiveSection(nearestIndex);
  });

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const holdVideoOnFinalFrame = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
    video.pause();
    video.currentTime = Math.max(0, video.duration - 0.08);
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <motion.div className={styles.progressTop} style={{ scaleX: topProgressScale }} />
      <motion.video ref={videoRef} className="fixed inset-0 z-0 h-[130vh] w-full object-cover" autoPlay muted playsInline preload="auto" onEnded={holdVideoOnFinalFrame} style={{ y: bgY }}><source src={VIDEO_SRC} /></motion.video>
      <motion.div className={styles.midground} style={{ y: midY }} aria-hidden><span /><span /><span /></motion.div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/20" aria-hidden />
      <motion.div className={styles.stickyProductTitle} style={{ opacity: titleOpacity, y: titleY }}>ElderShield / Evidence Engine</motion.div>
      <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">{navItems.map((item, index) => <a key={item.href} href={item.href} onClick={(event) => handleAnchorClick(event, item.id)} className={`${styles.scrollDot} ${activeSection === index ? styles.scrollDotActive : ""}`} aria-label={`Scroll to ${item.label}`} />)}</div>
      <div className={styles.sectionCounter} aria-hidden><span>{String(activeSection + 1).padStart(2, "0")}</span><em /><span>{String(navItems.length).padStart(2, "0")}</span></div>

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a href="#story" onClick={(event) => handleAnchorClick(event, "story")} className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display), serif" }}>ElderShield<sup className="text-xs">®</sup></a>
        <div className="liquid-glass hidden items-center gap-2 rounded-full px-3 py-2 md:flex">{navItems.map((item, index) => <a key={item.href} href={item.href} onClick={(event) => handleAnchorClick(event, item.id)} className={`rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/10 hover:text-foreground ${activeSection === index ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>{item.label}</a>)}</div>
        <div className="flex items-center gap-3"><ElderModeToggle /><Link href="/analyze" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-150 hover:scale-[1.03]">Analyze Document</Link></div>
      </nav>

      <main className="relative z-10">
        <section id="story" ref={storyRef} className={`${styles.scrollyChapter} min-h-[220vh]`}>
          <div className={styles.stickyScene}>
            <motion.div className={styles.sequenceStage} style={{ scale: sequenceScale, opacity: sequenceOpacity }}><Image src={frames[frameIndex]} alt="Scroll-controlled ElderShield document analysis frame" width={880} height={560} unoptimized className={styles.sequenceImage} draggable={false} /><div className={styles.frameReadout}>FRAME {String(frameIndex + 1).padStart(2, "0")} / {FRAME_COUNT}</div></motion.div>
            <div className={styles.heroCopy}><Reveal><h1 className={`max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] ${elderMode ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-7xl md:text-8xl"}`} style={{ fontFamily: "var(--font-display), serif" }}>Where <em className="not-italic text-muted-foreground">clarity</em> rises <em className="not-italic text-muted-foreground">through the fine print.</em></h1></Reveal><Reveal className="mx-auto mt-8 max-w-2xl"><p className={`leading-relaxed text-muted-foreground ${elderMode ? "text-2xl" : "text-base sm:text-lg"}`}>A cinematic legal-document explainer for seniors and families: find risk, trace it to the source, and know what to ask before signing.</p></Reveal><Reveal className="mt-12 flex justify-center"><a href="#features" onClick={(event) => handleAnchorClick(event, "features")} className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"}`}>Explore features</a></Reveal></div>
          </div>
        </section>

        <section id="features" className="relative z-10 py-32 px-6 md:px-12 mx-auto max-w-7xl">
          <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
            <p className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4">Core features</p>
            <h2 className="font-serif text-5xl md:text-7xl leading-tight text-white">How ElderShield works.</h2>
            <p className="mt-6 text-xl text-slate-300">
              Scroll down to see the features that power our risk extraction engine.
            </p>
          </div>
          <div className="flex flex-col gap-12 max-w-4xl mx-auto">
            {featureCards.map(([title, body], index) => (
              <Reveal key={title}>
                <article className="border border-white/20 rounded-3xl p-8 md:p-12 bg-white/5 backdrop-blur-xl shadow-2xl transition-all hover:bg-white/10 hover:border-white/30">
                  <span className="text-amber-500 font-bold tracking-widest text-sm">0{index + 1}</span>
                  <h3 className="mt-4 font-serif text-3xl md:text-5xl text-white">{title}</h3>
                  <p className="mt-4 text-lg text-slate-300 leading-relaxed">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="demo" className={`${styles.cinematicSection} flex min-h-screen items-center justify-center px-6 py-28 text-center`}><Reveal className={`${styles.editorPanel} ${styles.depthCard} max-w-3xl p-8 md:p-12`}><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Live demo</p><h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Ready to test the analyzer.</h2><p className="mt-6 text-lg leading-8 text-muted-foreground">Paste a document, upload a PDF, and see highlighted risks with plain-English explanations and an action checklist.</p><Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-10 py-4 text-foreground transition-transform hover:scale-[1.03]">Analyze Document</Link></Reveal></section>
      </main>
    </div>
  );
}

"use client";

import { type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import styles from "./page.module.css";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const FRAME_COUNT = 96;

const navItems = [
  { label: "Origin", href: "#origin", id: "origin" },
  { label: "Signal", href: "#signal", id: "signal" },
  { label: "Trace", href: "#trace", id: "trace" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Access", href: "#access", id: "access" },
  { label: "Demo", href: "#demo", id: "demo" },
];

const featureCards = [
  ["Clause lens", "Rights waivers, money traps, deadlines, and data-sharing language are pulled into focus."],
  ["Source trace", "Each explanation stays attached to the exact original phrase so the user can verify it."],
  ["Plain-English layer", "Dense legal phrasing becomes readable explanations without hiding the source text."],
  ["Family checklist", "The final output becomes a set of questions to ask before signing or escalating."],
  ["Elder Mode", "Larger text, stronger contrast, and calmer layouts are built into the product flow."],
];

const chapters = [
  ["01", "The page receives the contract", "A quiet document plane forms from the background and locks to the scroll."],
  ["02", "Language turns into signal", "The frame sequence separates risky phrases from harmless surrounding text."],
  ["03", "Evidence remains attached", "Every explanation keeps a visible link back to where the risk came from."],
];

const traceRows = [
  ["Input", "Dense legal paragraph", "Raw language is preserved, never replaced."],
  ["Extract", "Risk phrase isolated", "The system highlights the exact sentence fragment."],
  ["Explain", "Plain-English meaning", "The user sees what the clause means in practical terms."],
  ["Ask", "Question checklist", "The result becomes something useful for a family member, caregiver, or lawyer."],
];

function makeFrame(index: number) {
  const t = index / (FRAME_COUNT - 1);
  const riskA = Math.max(0, Math.min(1, (t - 0.18) / 0.22));
  const riskB = Math.max(0, Math.min(1, (t - 0.42) / 0.2));
  const plain = Math.max(0, Math.min(1, (t - 0.62) / 0.2));
  const tilt = -7 + t * 14;
  const lift = 38 - t * 68;
  const glow = 0.2 + t * 0.72;
  const scan = 42 + t * 468;
  const shield = 0.12 + plain * 0.88;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 620">
    <defs>
      <linearGradient id="card" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.22)"/><stop offset="1" stop-color="rgba(255,255,255,0.045)"/></linearGradient>
      <linearGradient id="risk" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,0.92)"/><stop offset="1" stop-color="rgba(136,210,255,0.72)"/></linearGradient>
      <filter id="blurGlow"><feGaussianBlur stdDeviation="18" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="920" height="620" fill="transparent" />
    <g opacity="${glow}" filter="url(#blurGlow)"><circle cx="460" cy="310" r="${150 + t * 145}" fill="rgba(110,190,255,0.10)"/><circle cx="625" cy="220" r="${70 + t * 55}" fill="rgba(255,255,255,0.07)"/></g>
    <g transform="translate(130 ${lift}) rotate(${tilt} 330 300)">
      <rect x="0" y="30" width="660" height="480" rx="34" fill="url(#card)" stroke="rgba(255,255,255,0.28)" stroke-width="1.4"/>
      <rect x="46" y="82" width="230" height="12" rx="6" fill="rgba(255,255,255,0.72)"/>
      <rect x="46" y="118" width="560" height="8" rx="4" fill="rgba(255,255,255,0.22)"/><rect x="46" y="146" width="505" height="8" rx="4" fill="rgba(255,255,255,0.18)"/><rect x="46" y="174" width="536" height="8" rx="4" fill="rgba(255,255,255,0.16)"/>
      <rect x="46" y="228" width="${220 + riskA * 250}" height="34" rx="17" fill="rgba(255,255,255,${0.08 + riskA * 0.34})" stroke="rgba(255,255,255,${0.08 + riskA * 0.36})"/>
      <rect x="46" y="286" width="${180 + riskB * 310}" height="34" rx="17" fill="rgba(136,210,255,${riskB * 0.25})" stroke="rgba(136,210,255,${riskB * 0.55})"/>
      <rect x="46" y="374" width="560" height="1" fill="rgba(255,255,255,0.14)"/>
      <rect x="46" y="410" width="${160 + plain * 420}" height="42" rx="21" fill="rgba(255,255,255,${plain * 0.16})" stroke="rgba(255,255,255,${plain * 0.32})"/>
      <circle cx="560" cy="431" r="${plain * 18}" fill="none" stroke="rgba(255,255,255,${plain * 0.8})" stroke-width="2"/><path d="M550 431 l7 7 l16 -18" fill="none" stroke="rgba(255,255,255,${plain})" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="34" y="${scan}" width="592" height="2" rx="1" fill="rgba(255,255,255,0.88)" opacity="${0.14 + t * 0.58}"/>
    </g>
    <g opacity="${shield}" transform="translate(690 120)"><rect x="0" y="0" width="104" height="104" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.28)"/><path d="M52 22 C72 34 80 32 80 32 v22 c0 25 -18 40 -28 46 C42 94 24 79 24 54 V32s9 2 28 -10z" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="4"/></g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 42, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, amount: 0.34 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const { elderMode } = useAccessibility();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const scrollyRef = useRef<HTMLElement | null>(null);
  const featuresRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frames = useMemo(() => Array.from({ length: FRAME_COUNT }, (_, index) => makeFrame(index)), []);
  const [activeSection, setActiveSection] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const bgY = useTransform(smoothProgress, [0, 1], ["0vh", "-30vh"]);
  const midY = useTransform(smoothProgress, [0, 1], ["0vh", "-60vh"]);
  const topProgressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  const { scrollYProgress: scrollyProgress } = useScroll({ target: scrollyRef, offset: ["start start", "end end"] });
  const { scrollYProgress: featureProgress } = useScroll({ target: featuresRef, offset: ["start start", "end end"] });

  const horizontalX = useTransform(featureProgress, [0, 1], ["18%", "-66%"]);
  const sequenceScale = useTransform(scrollyProgress, [0, 0.5, 1], [0.92, 1.06, 0.96]);
  const sequenceOpacity = useTransform(scrollyProgress, [0, 0.08, 0.9, 1], [0, 1, 1, 0.2]);
  const titleOpacity = useTransform(scrollyProgress, [0, 0.08, 0.86, 1], [0, 1, 1, 0]);
  const titleY = useTransform(scrollyProgress, [0, 0.12, 0.85, 1], [20, 0, 0, -20]);

  useMotionValueEvent(scrollyProgress, "change", (latest) => {
    setFrameIndex(Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(latest * (FRAME_COUNT - 1)))));
    const video = videoRef.current;
    if (!video || !video.duration || !videoReady) return;
    video.currentTime = Math.min(video.duration - 0.05, Math.max(0, latest * video.duration));
  });

  useMotionValueEvent(scrollYProgress, "change", () => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const center = window.scrollY + window.innerHeight / 2;
    const nearestIndex = sections.reduce((bestIndex, section, index) => {
      const best = sections[bestIndex];
      const currentDistance = Math.abs(section.offsetTop + section.offsetHeight / 2 - center);
      const bestDistance = Math.abs(best.offsetTop + best.offsetHeight / 2 - center);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);
    setActiveSection(nearestIndex);
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    const onLoadedMetadata = () => {
      video.pause();
      setVideoReady(true);
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => video.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, []);

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <motion.div className={styles.progressTop} style={{ scaleX: topProgressScale }} />
      <motion.video ref={videoRef} className="fixed inset-0 z-0 h-[130vh] w-full object-cover" muted playsInline preload="auto" style={{ y: bgY }}><source src={VIDEO_SRC} /></motion.video>
      <motion.div className={styles.midground} style={{ y: midY }} aria-hidden><span /><span /><span /></motion.div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/20" aria-hidden />
      <motion.div className={styles.stickyProductTitle} style={{ opacity: titleOpacity, y: titleY }}>ElderShield / Evidence Engine</motion.div>
      <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">{navItems.map((item, index) => <a key={item.href} href={item.href} onClick={(event) => handleAnchorClick(event, item.id)} className={`${styles.scrollDot} ${activeSection === index ? styles.scrollDotActive : ""}`} aria-label={`Scroll to ${item.label}`} />)}</div>
      <div className={styles.sectionCounter} aria-hidden><span>{String(activeSection + 1).padStart(2, "0")}</span><em /><span>{String(navItems.length).padStart(2, "0")}</span></div>

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a href="#origin" onClick={(event) => handleAnchorClick(event, "origin")} className="text-3xl tracking-tight text-foreground" style={{ fontFamily: "var(--font-display), serif" }}>ElderShield<sup className="text-xs">®</sup></a>
        <div className="liquid-glass hidden items-center gap-2 rounded-full px-3 py-2 md:flex">{navItems.map((item, index) => <a key={item.href} href={item.href} onClick={(event) => handleAnchorClick(event, item.id)} className={`rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/10 hover:text-foreground ${activeSection === index ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>{item.label}</a>)}</div>
        <div className="flex items-center gap-3"><ElderModeToggle /><Link href="/analyze" className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-150 hover:scale-[1.03]">Analyze Document</Link></div>
      </nav>

      <main className="relative z-10">
        <section id="origin" ref={scrollyRef} className={`${styles.scrollyChapter} min-h-[360vh]`}>
          <div className={styles.stickyScene}>
            <motion.div className={styles.sequenceStage} style={{ scale: sequenceScale, opacity: sequenceOpacity }}><img src={frames[frameIndex]} alt="Scroll-controlled ElderShield document analysis frame" className={styles.sequenceImage} draggable={false} /><div className={styles.frameReadout}>FRAME {String(frameIndex + 1).padStart(2, "0")} / {FRAME_COUNT}</div></motion.div>
            <div className={styles.heroCopy}>
              <Reveal><h1 className={`max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] ${elderMode ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-7xl md:text-8xl"}`} style={{ fontFamily: "var(--font-display), serif" }}>Where <em className="not-italic text-muted-foreground">clarity</em> rises <em className="not-italic text-muted-foreground">through the fine print.</em></h1></Reveal>
              <Reveal className="mx-auto mt-8 max-w-2xl"><p className={`leading-relaxed text-muted-foreground ${elderMode ? "text-2xl" : "text-base sm:text-lg"}`}>ElderShield turns complex legal documents into plain-language risk maps for seniors, families, and anyone who wants to understand what they are signing before it matters.</p></Reveal>
              <Reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"><a href="#signal" onClick={(event) => handleAnchorClick(event, "signal")} className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"}`}>Enter the story</a><span className="text-sm text-muted-foreground">Scroll drives a generated frame sequence · reverse by scrolling up</span></Reveal>
            </div>
          </div>
          <div className={styles.chapterTextStack}>{chapters.map(([number, title, body]) => <Reveal key={number} className={styles.chapterPanel}><span>{number}</span><h2>{title}</h2><p>{body}</p></Reveal>)}</div>
        </section>

        <section id="signal" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}><div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[0.88fr_1.12fr]"><Reveal className={`${styles.editorPanel} ${styles.depthCard} p-8 md:p-10`}><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Signal</p><h2 className="mt-5 max-w-xl font-serif text-5xl leading-none tracking-tight md:text-7xl">The interface slows the contract down.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Inspired by Apple-style product storytelling and Methods Reconstructor-style provenance, the UI shows where each answer came from instead of floating in generic AI cards.</p><Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-8 py-4 text-sm text-foreground transition-transform hover:scale-[1.03]">Open Analyzer</Link></Reveal><div className={styles.signalStack}>{chapters.map(([number, title, body]) => <Reveal key={title} className={styles.traceStrip}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></Reveal>)}</div></div></section>

        <section id="trace" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}><div className="w-full"><Reveal className="max-w-3xl"><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Provenance trace</p><h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Not boxes. A visible reasoning trail.</h2></Reveal><div className={styles.traceGrid}>{traceRows.map(([label, title, body], index) => <Reveal key={label} className={styles.traceNode}><span>{String(index + 1).padStart(2, "0")}</span><p>{label}</p><h3>{title}</h3><small>{body}</small></Reveal>)}</div></div></section>

        <section id="features" ref={featuresRef} className={styles.horizontalSection}><div className={styles.horizontalSticky}><div className={styles.horizontalIntro}><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Core features</p><h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Slide through the system.</h2></div><motion.div className={styles.horizontalTrack} style={{ x: horizontalX }}>{featureCards.map(([title, body], index) => <article key={title} className={styles.featureCard}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</motion.div></div></section>
        <section id="access" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}><Reveal className={`${styles.editorPanel} ${styles.depthCard} mx-auto max-w-4xl p-8 text-center md:p-12`}><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Accessibility</p><h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Designed for people who need clarity most.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Elder Mode increases text size and contrast, explanations stay short, and the final checklist is easy to print or read aloud.</p></Reveal></section>
        <section id="demo" className={`${styles.cinematicSection} flex min-h-screen items-center justify-center px-6 py-28 text-center`}><Reveal className={`${styles.editorPanel} ${styles.depthCard} max-w-3xl p-8 md:p-12`}><p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Live demo</p><h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Ready to test the analyzer.</h2><p className="mt-6 text-lg leading-8 text-muted-foreground">The landing page tells the story. The analyzer proves the workflow.</p><Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-10 py-4 text-foreground transition-transform hover:scale-[1.03]">Analyze Document</Link></Reveal></section>
      </main>
    </div>
  );
}

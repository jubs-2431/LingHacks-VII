"use client";

import { useEffect, useRef, useState } from "react";
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

const navItems = [
  { label: "Origin", href: "#origin", id: "origin" },
  { label: "Signal", href: "#signal", id: "signal" },
  { label: "Features", href: "#features", id: "features" },
  { label: "Access", href: "#access", id: "access" },
  { label: "Demo", href: "#demo", id: "demo" },
];

const featureCards = [
  ["Clause lens", "Rights waivers, money traps, deadlines, and data-sharing language are pulled into focus."],
  ["Plain-English layer", "Dense legal phrasing becomes readable explanations with the exact source phrase preserved."],
  ["Family checklist", "The final output becomes a set of questions to ask before signing or escalating."],
  ["Elder Mode", "Larger text, stronger contrast, and calmer layouts are built into the product flow."],
];

const chapters = [
  ["01", "A document enters the dark", "The interface begins quietly: one page, one task, no visual noise."],
  ["02", "Risk becomes visible", "As the scroll advances, legal pressure points separate from the wall of text."],
  ["03", "Meaning becomes usable", "The output is not a generic summary. It is an action map for a real person."],
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 42, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.34 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
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
  const [activeSection, setActiveSection] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.35,
  });

  const bgY = useTransform(smoothProgress, [0, 1], ["0vh", "-30vh"]);
  const midY = useTransform(smoothProgress, [0, 1], ["0vh", "-60vh"]);
  const topProgressScale = useTransform(smoothProgress, [0, 1], [0, 1]);

  const { scrollYProgress: scrollyProgress } = useScroll({
    target: scrollyRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: featureProgress } = useScroll({
    target: featuresRef,
    offset: ["start start", "end end"],
  });

  const horizontalX = useTransform(featureProgress, [0, 1], ["0%", "-58%"]);
  const titleOpacity = useTransform(scrollyProgress, [0, 0.08, 0.86, 1], [0, 1, 1, 0]);
  const titleY = useTransform(scrollyProgress, [0, 0.12, 0.85, 1], [20, 0, 0, -20]);

  useMotionValueEvent(scrollyProgress, "change", (latest) => {
    const video = videoRef.current;
    if (!video || !video.duration || !videoReady) return;
    video.currentTime = Math.min(video.duration - 0.05, Math.max(0, latest * video.duration));
  });

  useMotionValueEvent(scrollYProgress, "change", () => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];
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

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <motion.div className={styles.progressTop} style={{ scaleX: topProgressScale }} />

      <motion.video
        ref={videoRef}
        className="fixed inset-0 z-0 h-[130vh] w-full object-cover"
        muted
        playsInline
        preload="auto"
        style={{ y: bgY }}
      >
        <source src={VIDEO_SRC} />
      </motion.video>

      <motion.div className={styles.midground} style={{ y: midY }} aria-hidden>
        <span />
        <span />
        <span />
      </motion.div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-black/20" aria-hidden />

      <motion.div className={styles.stickyProductTitle} style={{ opacity: titleOpacity, y: titleY }}>
        ElderShield / Scroll Study
      </motion.div>

      <div className="fixed right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
        {navItems.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => handleAnchorClick(event, item.id)}
            className={`${styles.scrollDot} ${activeSection === index ? styles.scrollDotActive : ""}`}
            aria-label={`Scroll to ${item.label}`}
          />
        ))}
      </div>

      <div className={styles.sectionCounter} aria-hidden>
        <span>{String(activeSection + 1).padStart(2, "0")}</span>
        <em />
        <span>{String(navItems.length).padStart(2, "0")}</span>
      </div>

      <nav className="fixed inset-x-0 top-0 z-30 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a
          href="#origin"
          onClick={(event) => handleAnchorClick(event, "origin")}
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          ElderShield<sup className="text-xs">®</sup>
        </a>

        <div className="liquid-glass hidden items-center gap-2 rounded-full px-3 py-2 md:flex">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleAnchorClick(event, item.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/10 hover:text-foreground ${
                activeSection === index ? "bg-white/10 text-foreground" : "text-muted-foreground"
              }`}
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
        <section id="origin" ref={scrollyRef} className={`${styles.scrollyChapter} min-h-[320vh]`}>
          <div className={styles.stickyScene}>
            <div className={styles.heroCopy}>
              <Reveal>
                <h1
                  className={`max-w-7xl font-normal leading-[0.95] tracking-[-2.46px] ${
                    elderMode ? "text-6xl sm:text-7xl md:text-8xl" : "text-5xl sm:text-7xl md:text-8xl"
                  }`}
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  Where <em className="not-italic text-muted-foreground">clarity</em> rises{" "}
                  <em className="not-italic text-muted-foreground">through the fine print.</em>
                </h1>
              </Reveal>

              <Reveal className="mx-auto mt-8 max-w-2xl">
                <p className={`leading-relaxed text-muted-foreground ${elderMode ? "text-2xl" : "text-base sm:text-lg"}`}>
                  ElderShield turns complex legal documents into plain-language risk maps for seniors,
                  families, and anyone who wants to understand what they are signing before it matters.
                </p>
              </Reveal>

              <Reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="#signal"
                  onClick={(event) => handleAnchorClick(event, "signal")}
                  className={`liquid-glass rounded-full text-foreground transition-transform duration-150 hover:scale-[1.03] ${
                    elderMode ? "px-16 py-6 text-2xl" : "px-14 py-5 text-base"
                  }`}
                >
                  Enter the story
                </a>
                <span className="text-sm text-muted-foreground">Scroll drives the motion · Reverse by scrolling up</span>
              </Reveal>
            </div>
          </div>

          <div className={styles.chapterTextStack}>
            {chapters.map(([number, title, body]) => (
              <Reveal key={number} className={`${styles.chapterCard} ${styles.glassPanel}`}>
                <span>{number}</span>
                <h2>{title}</h2>
                <p>{body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="signal" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}>
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal className={`${styles.glassPanel} ${styles.depthCard} p-8 md:p-10`}>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Signal</p>
              <h2 className="mt-5 max-w-xl font-serif text-5xl leading-none tracking-tight md:text-7xl">
                The interface slows the contract down.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Instead of throwing a wall of legal text at the user, the product reveals pressure points one layer at a time.
              </p>
              <Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-8 py-4 text-sm text-foreground transition-transform hover:scale-[1.03]">
                Open Analyzer
              </Link>
            </Reveal>

            <div className="grid gap-4">
              {chapters.map(([number, title, body]) => (
                <Reveal key={title} className={`${styles.glassPanel} ${styles.depthCard} group p-6`}>
                  <div className="flex items-start gap-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/20 text-sm text-muted-foreground">
                      {number}
                    </span>
                    <div>
                      <h3 className="font-serif text-3xl text-foreground">{title}</h3>
                      <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="features" ref={featuresRef} className={styles.horizontalSection}>
          <div className={styles.horizontalSticky}>
            <div className={styles.horizontalIntro}>
              <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Core features</p>
              <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Slide through the system.</h2>
            </div>

            <motion.div className={styles.horizontalTrack} style={{ x: horizontalX }}>
              {featureCards.map(([title, body], index) => (
                <article key={title} className={`${styles.glassPanel} ${styles.featureCard}`}>
                  <span>0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="access" className={`${styles.cinematicSection} mx-auto flex min-h-screen max-w-7xl items-center px-6 py-28`}>
          <Reveal className={`${styles.glassPanel} ${styles.depthCard} mx-auto max-w-4xl p-8 text-center md:p-12`}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Accessibility</p>
            <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Designed for people who need clarity most.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Elder Mode increases text size and contrast, explanations stay short, and the final checklist is easy to print or read aloud.
            </p>
          </Reveal>
        </section>

        <section id="demo" className={`${styles.cinematicSection} flex min-h-screen items-center justify-center px-6 py-28 text-center`}>
          <Reveal className={`${styles.glassPanel} ${styles.depthCard} max-w-3xl p-8 md:p-12`}>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Live demo</p>
            <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">Ready to test the analyzer.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              The landing page tells the story. The analyzer proves the workflow.
            </p>
            <Link href="/analyze" className="liquid-glass mt-8 inline-flex rounded-full px-10 py-4 text-foreground transition-transform hover:scale-[1.03]">
              Analyze Document
            </Link>
          </Reveal>
        </section>
      </main>
    </div>
  );
}

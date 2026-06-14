"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 97 ? 97 : value + 3));
    }, 70);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center overflow-hidden bg-[#03131d] text-white">
      <div className="absolute inset-0 bg-[#03131d]" />
      <div className="absolute left-[-10rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-cyan-200/15 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-white/10 blur-3xl" />

      <div className="absolute inset-x-8 top-8 flex items-center justify-between text-[10px] uppercase tracking-[0.42em] text-slate-300 md:inset-x-12">
        <span>ElderShield</span>
        <span>Evidence Engine</span>
      </div>

      <div className="relative z-10 w-[min(42rem,calc(100vw-3rem))] rounded-[2rem] border border-white/20 bg-white/10 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl md:p-10">
        <div className="mb-10 flex items-center justify-between border-b border-white/15 pb-5 font-mono text-xs uppercase tracking-[0.35em] text-slate-300">
          <span>Loading...</span>
          <span>{String(progress).padStart(3, "0")}%</span>
        </div>
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-cyan-100/70">Reading fine print</p>
        <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.04em] text-white md:text-7xl">Preparing clarity.</h1>
        <div className="mt-10 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white shadow-[0_0_24px_rgba(190,240,255,0.75)] transition-[width] duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.35em] text-slate-400">
          <span>Source trace</span>
          <span>Plain language</span>
        </div>
      </div>
    </div>
  );
}

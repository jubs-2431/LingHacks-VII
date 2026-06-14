"use client";

import React from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { Accessibility } from "lucide-react";

export default function ElderModeToggle() {
  const { elderMode, toggleElderMode } = useAccessibility();

  return (
    <button
      onClick={toggleElderMode}
      className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${
        elderMode
          ? "bg-amber-500 text-slate-900 border-2 border-slate-900 text-xl"
          : "bg-slate-800 text-amber-400 border border-slate-700 text-sm"
      }`}
      aria-label="Toggle Elder Mode for larger text and simpler language"
    >
      <Accessibility className={elderMode ? "w-7 h-7" : "w-4 h-4"} />
      <span>{elderMode ? "Elder Mode: Active (Large Text)" : "Enable Elder Mode"}</span>
    </button>
  );
}

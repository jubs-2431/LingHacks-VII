"use client";

import React from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { Accessibility } from "lucide-react";

export default function ElderModeToggle() {
  const { elderMode, toggleElderMode } = useAccessibility();

  return (
    <button
      onClick={toggleElderMode}
      aria-pressed={elderMode}
      className={`flex items-center gap-2.5 rounded-full font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
        elderMode
          ? "bg-shield text-white border-2 border-shield-dark px-5 py-3 text-lg"
          : "bg-white text-shield border border-shield/30 px-4 py-2 text-sm shadow-sm hover:border-shield"
      }`}
      aria-label="Toggle Elder Mode for larger text and higher contrast"
    >
      <Accessibility className={`keep-color ${elderMode ? "h-6 w-6" : "h-4 w-4"}`} />
      <span>{elderMode ? "Elder Mode: On" : "Elder Mode"}</span>
    </button>
  );
}

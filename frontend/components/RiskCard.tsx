"use client";

import React, { useState, useEffect } from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import SeverityBadge from "./SeverityBadge";
import { Volume2, VolumeX, AlertTriangle, HelpCircle } from "lucide-react";
import { RiskClause } from "../lib/types";

interface RiskCardProps {
  clause: RiskClause;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function RiskCard({ clause, isSelected = false, onSelect }: RiskCardProps) {
  const { elderMode } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `
      Risk category: ${clause.risk_type}.
      Plain meaning: ${clause.plain_english}.
      Why it matters: ${clause.why_it_matters}.
      Question to ask before signing: ${clause.question_to_ask}
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = elderMode ? 0.8 : 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const accent =
    clause.severity === "high"
      ? { rail: "bg-red-500", ring: "ring-red-400", icon: "text-red-600" }
      : clause.severity === "medium"
        ? { rail: "bg-amber-500", ring: "ring-amber-400", icon: "text-amber-600" }
        : { rail: "bg-stone-500", ring: "ring-stone-400", icon: "text-stone-600" };

  const cardClass = elderMode
    ? `relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm transition-all ${
        isSelected ? `border-slate-950 ring-4 ${accent.ring}` : "border-slate-950 hover:border-slate-700"
      }`
    : `relative overflow-hidden rounded-2xl border bg-surface p-5 transition-all ${
        isSelected ? `border-transparent ring-2 ${accent.ring}` : "border-line hover:border-faint"
      }`;

  return (
    <div onClick={onSelect} className={`${cardClass} ${onSelect ? "cursor-pointer" : ""}`}>
      <span className={`absolute inset-y-0 left-0 ${elderMode ? "w-2" : "w-1.5"} ${accent.rail}`} aria-hidden />

      <div className="space-y-4 pl-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`keep-color ${accent.icon} ${elderMode ? "h-6 w-6" : "h-5 w-5"}`} />
            <h4 className={`font-serif font-medium ${elderMode ? "text-2xl text-slate-950" : "text-lg text-ink"}`}>
              {clause.risk_type}
            </h4>
          </div>
          <SeverityBadge severity={clause.severity} />
        </div>

        <div className={`rounded-lg border p-3 ${elderMode ? "border-2 border-slate-950 bg-slate-100" : "border-line bg-paper/50"}`}>
          <p className={`select-all font-serif italic ${elderMode ? "text-lg leading-relaxed text-slate-950" : "text-sm text-muted"}`}>
            &quot;{clause.text}&quot;
          </p>
        </div>

        <div className="space-y-1">
          <span className={`block font-bold uppercase tracking-wide ${elderMode ? "text-base text-slate-950" : "text-[11px] text-shield"}`}>
            Plain meaning
          </span>
          <p className={`font-semibold leading-relaxed ${elderMode ? "text-xl text-slate-950" : "text-base text-ink"}`}>
            {clause.plain_english}
          </p>
        </div>

        <div className="space-y-1">
          <span className={`block font-bold uppercase tracking-wide ${elderMode ? "text-base text-slate-950" : "text-[11px] text-faint"}`}>
            Why it matters
          </span>
          <p className={`leading-relaxed ${elderMode ? "text-lg font-medium text-slate-950" : "text-sm text-muted"}`}>
            {clause.why_it_matters}
          </p>
        </div>

        <div className={`flex items-start gap-2.5 rounded-xl border p-3 ${elderMode ? "border-2 border-slate-950 bg-amber-100" : "border-shield/15 bg-shield-soft/60"}`}>
          <HelpCircle className={`keep-color mt-0.5 shrink-0 ${elderMode ? "h-6 w-6 text-slate-950" : "h-5 w-5 text-shield"}`} />
          <div className="space-y-0.5">
            <span className={`block font-bold ${elderMode ? "text-base text-slate-950" : "text-[11px] text-shield-dark"}`}>
              Ask before you sign
            </span>
            <p className={`font-semibold italic ${elderMode ? "text-lg text-slate-950" : "text-sm text-shield-dark"}`}>
              &quot;{clause.question_to_ask}&quot;
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center justify-between gap-4 border-t pt-3 pl-2 ${elderMode ? "border-slate-950" : "border-line"}`}>
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 rounded-lg border font-semibold transition-colors ${
            elderMode
              ? isSpeaking
                ? "border-2 border-red-800 bg-red-100 text-red-950 hover:bg-red-200"
                : "border-2 border-slate-950 bg-slate-100 text-slate-950 hover:bg-slate-200"
              : isSpeaking
                ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                : "border-line bg-white text-ink hover:border-shield hover:text-shield"
          } ${elderMode ? "px-4 py-2.5 text-lg" : "px-3 py-1.5 text-sm"}`}
          title="Read this explanation out loud"
        >
          {isSpeaking ? (
            <>
              <VolumeX className={`keep-color ${elderMode ? "h-5 w-5" : "h-4 w-4"}`} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 className={`keep-color ${elderMode ? "h-5 w-5" : "h-4 w-4"}`} />
              <span>Listen</span>
            </>
          )}
        </button>

        {onSelect && (
          <span className={`font-medium ${elderMode ? "text-base text-slate-950" : "text-xs text-faint"}`}>
            {isSelected ? "Selected" : "Click to locate"}
          </span>
        )}
      </div>
    </div>
  );
}

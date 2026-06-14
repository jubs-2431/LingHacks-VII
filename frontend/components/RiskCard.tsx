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

  // Severity-driven accent on a calm light surface
  const accent =
    clause.severity === "high"
      ? { rail: "bg-red-500", ring: "ring-red-400", icon: "text-red-600" }
      : clause.severity === "medium"
        ? { rail: "bg-amber-500", ring: "ring-amber-400", icon: "text-amber-600" }
        : { rail: "bg-stone-400", ring: "ring-stone-300", icon: "text-stone-500" };

  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden rounded-2xl border bg-surface p-5 transition-all ${
        onSelect ? "cursor-pointer" : ""
      } ${
        isSelected
          ? `border-transparent ring-2 ${accent.ring}`
          : "border-line hover:border-faint"
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${accent.rail}`} aria-hidden />

      <div className="space-y-4 pl-2">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`keep-color ${accent.icon} ${elderMode ? "h-6 w-6" : "h-5 w-5"}`} />
            <h4 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-lg"}`}>
              {clause.risk_type}
            </h4>
          </div>
          <SeverityBadge severity={clause.severity} />
        </div>

        {/* Original clause */}
        <div className="rounded-lg border border-line bg-paper/50 p-3">
          <p className={`select-all font-serif italic text-muted ${elderMode ? "text-base" : "text-sm"}`}>
            “{clause.text}”
          </p>
        </div>

        {/* Plain meaning */}
        <div className="space-y-1">
          <span className={`block font-semibold uppercase tracking-wide text-shield ${elderMode ? "text-sm" : "text-[11px]"}`}>
            Plain meaning
          </span>
          <p className={`font-semibold leading-relaxed text-ink ${elderMode ? "text-lg" : "text-base"}`}>
            {clause.plain_english}
          </p>
        </div>

        {/* Why it matters */}
        <div className="space-y-1">
          <span className={`block font-semibold uppercase tracking-wide text-faint ${elderMode ? "text-sm" : "text-[11px]"}`}>
            Why it matters
          </span>
          <p className={`leading-relaxed text-muted ${elderMode ? "text-base" : "text-sm"}`}>
            {clause.why_it_matters}
          </p>
        </div>

        {/* Question to ask */}
        <div className="flex items-start gap-2.5 rounded-xl border border-shield/15 bg-shield-soft/60 p-3">
          <HelpCircle className={`keep-color mt-0.5 shrink-0 text-shield ${elderMode ? "h-6 w-6" : "h-5 w-5"}`} />
          <div className="space-y-0.5">
            <span className={`block font-semibold text-shield-dark ${elderMode ? "text-sm" : "text-[11px]"}`}>
              Ask before you sign
            </span>
            <p className={`font-semibold italic text-shield-dark ${elderMode ? "text-base" : "text-sm"}`}>
              “{clause.question_to_ask}”
            </p>
          </div>
        </div>
      </div>

      {/* Listen */}
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-3 pl-2">
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 rounded-lg border font-semibold transition-colors ${
            isSpeaking
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
          <span className={`font-medium text-faint ${elderMode ? "text-sm" : "text-xs"}`}>
            {isSelected ? "Selected" : "Click to locate"}
          </span>
        )}
      </div>
    </div>
  );
}

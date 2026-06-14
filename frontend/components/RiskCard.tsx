"use client";

import React, { useState, useEffect } from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import SeverityBadge from "./SeverityBadge";
import { Volume2, VolumeX, AlertTriangle, HelpCircle, Eye } from "lucide-react";
import { RiskClause } from "../lib/types";

interface RiskCardProps {
  clause: RiskClause;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function RiskCard({ clause, isSelected = false, onSelect }: RiskCardProps) {
  const { elderMode } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speaking if component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card selection click
    
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
    utterance.rate = elderMode ? 0.8 : 0.95; // Slower rate for elder mode
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getBorderColor = () => {
    if (isSelected) return "border-amber-500 ring-2 ring-amber-500/20";
    
    switch (clause.severity) {
      case "high":
        return "border-red-500/30 hover:border-red-500/60";
      case "medium":
        return "border-orange-500/30 hover:border-orange-500/60";
      case "low":
        return "border-slate-700 hover:border-slate-500";
    }
  };

  const getBgColor = () => {
    if (isSelected) return "bg-slate-900/80";
    
    switch (clause.severity) {
      case "high":
        return "bg-red-500/[0.02] hover:bg-slate-900/40";
      case "medium":
        return "bg-orange-500/[0.02] hover:bg-slate-900/40";
      case "low":
        return "bg-slate-900/20 hover:bg-slate-900/40";
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 ${getBorderColor()} ${getBgColor()}`}
    >
      <div className="space-y-3">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`text-amber-500 ${elderMode ? "w-6 h-6" : "w-4 h-4"}`} />
            <h4 className={`font-bold text-slate-100 ${elderMode ? "text-xl" : "text-sm"}`}>
              {clause.risk_type}
            </h4>
          </div>
          <SeverityBadge severity={clause.severity} />
        </div>

        {/* Original Legal Clause (Confusing Text) */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800">
          <p className={`font-mono text-slate-400 select-all italic ${elderMode ? "text-md" : "text-xs"}`}>
            "{clause.text}"
          </p>
        </div>

        {/* Translation: Plain English */}
        <div className="space-y-1">
          <span className={`block font-bold text-amber-400 uppercase tracking-wide ${elderMode ? "text-sm" : "text-[10px]"}`}>
            Plain Meaning:
          </span>
          <p className={`text-slate-200 leading-relaxed font-semibold ${elderMode ? "text-lg" : "text-sm"}`}>
            {clause.plain_english}
          </p>
        </div>

        {/* Why it matters */}
        <div className="space-y-1">
          <span className={`block font-bold text-slate-400 uppercase tracking-wide ${elderMode ? "text-sm" : "text-[10px]"}`}>
            Why It Matters:
          </span>
          <p className={`text-slate-300 leading-relaxed ${elderMode ? "text-md" : "text-xs"}`}>
            {clause.why_it_matters}
          </p>
        </div>

        {/* Question to Ask */}
        <div className="flex items-start gap-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
          <HelpCircle className={`text-amber-400 shrink-0 mt-0.5 ${elderMode ? "w-6 h-6" : "w-4 h-4"}`} />
          <div className="space-y-0.5">
            <span className={`block font-bold text-amber-400 ${elderMode ? "text-sm" : "text-[10px]"}`}>
              Suggested Question to Ask:
            </span>
            <p className={`text-amber-200 italic font-semibold ${elderMode ? "text-md" : "text-xs"}`}>
              "{clause.question_to_ask}"
            </p>
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-2 rounded-lg font-bold border transition-all ${
            isSpeaking
              ? "bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/20"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
          } ${elderMode ? "px-4 py-2.5 text-lg" : "px-3 py-1.5 text-xs"}`}
          title="Read description out loud"
        >
          {isSpeaking ? (
            <>
              <VolumeX className={elderMode ? "w-5 h-5" : "w-4 h-4"} />
              <span>Stop Speaking</span>
            </>
          ) : (
            <>
              <Volume2 className={elderMode ? "w-5 h-5" : "w-4 h-4"} />
              <span>Listen (Read Aloud)</span>
            </>
          )}
        </button>

        {onSelect && (
          <span className={`text-slate-500 font-medium ${elderMode ? "text-sm" : "text-[10px]"}`}>
            {isSelected ? "Selected" : "Click to view location"}
          </span>
        )}
      </div>
    </div>
  );
}

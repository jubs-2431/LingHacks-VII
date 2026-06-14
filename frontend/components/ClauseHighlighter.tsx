"use client";

import React from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { RiskClause } from "../lib/types";

interface ClauseHighlighterProps {
  fullText: string;
  clauses: RiskClause[];
  selectedClauseId: string | null;
  onSelectClause: (clause: RiskClause) => void;
}

interface HighlightRange {
  start: number;
  end: number;
  clause: RiskClause;
}

export default function ClauseHighlighter({
  fullText,
  clauses,
  selectedClauseId,
  onSelectClause,
}: ClauseHighlighterProps) {
  const { elderMode } = useAccessibility();

  if (!fullText) return null;

  // Build sorted non-overlapping ranges of risk clauses within the full text
  const getHighlightRanges = (): HighlightRange[] => {
    const ranges: HighlightRange[] = [];
    
    // Find the first index position for each clause
    const clauseIndices = clauses
      .map((c) => ({
        clause: c,
        index: fullText.indexOf(c.text),
      }))
      .filter((item) => item.index !== -1)
      // Sort by appearance in the text
      .sort((a, b) => a.index - b.index);

    let lastEnd = 0;
    
    for (const item of clauseIndices) {
      const start = fullText.indexOf(item.clause.text, lastEnd);
      if (start !== -1) {
        const end = start + item.clause.text.length;
        ranges.push({
          start,
          end,
          clause: item.clause,
        });
        lastEnd = end;
      }
    }
    return ranges;
  };

  const ranges = getHighlightRanges();
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach((range, idx) => {
    // Add text segment before highlighed range
    if (range.start > lastIndex) {
      elements.push(
        <span key={`text-${idx}`} className="whitespace-pre-wrap">
          {fullText.slice(lastIndex, range.start)}
        </span>
      );
    }

    const isSelected = selectedClauseId === range.clause.id;
    const severity = range.clause.severity;

    let highlightClass = "";
    if (elderMode) {
      // In Elder Mode: extremely high contrast, solid backgrounds, thick borders, readable text
      if (severity === "high") {
        highlightClass = isSelected
          ? "bg-red-700 text-white font-extrabold border-2 border-black px-1"
          : "bg-red-200 text-red-950 font-bold border-b-4 border-red-700 hover:bg-red-300 px-1";
      } else if (severity === "medium") {
        highlightClass = isSelected
          ? "bg-orange-600 text-white font-extrabold border-2 border-black px-1"
          : "bg-orange-200 text-orange-950 font-bold border-b-4 border-orange-600 hover:bg-orange-300 px-1";
      } else {
        highlightClass = isSelected
          ? "bg-amber-400 text-black font-extrabold border-2 border-black px-1"
          : "bg-amber-100 text-amber-950 font-bold border-b-4 border-amber-500 hover:bg-amber-200 px-1";
      }
    } else {
      // Standard dark mode UI
      if (severity === "high") {
        highlightClass = isSelected
          ? "bg-red-500 text-white font-semibold ring-2 ring-red-700/50 px-0.5 rounded"
          : "bg-red-500/20 text-red-200 border-b-2 border-red-500/60 hover:bg-red-500/35 px-0.5 rounded transition-all";
      } else if (severity === "medium") {
        highlightClass = isSelected
          ? "bg-amber-500 text-slate-950 font-semibold ring-2 ring-amber-700/50 px-0.5 rounded"
          : "bg-amber-500/20 text-amber-200 border-b-2 border-amber-500/60 hover:bg-amber-500/35 px-0.5 rounded transition-all";
      } else {
        highlightClass = isSelected
          ? "bg-slate-700 text-slate-200 font-semibold ring-2 ring-slate-600 px-0.5 rounded"
          : "bg-slate-800 text-slate-300 border-b-2 border-slate-600 hover:bg-slate-800/80 px-0.5 rounded transition-all";
      }
    }

    elements.push(
      <span
        key={`highlight-${idx}`}
        onClick={() => onSelectClause(range.clause)}
        className={`cursor-pointer inline ${highlightClass}`}
        title={`Click to read explanation for: ${range.clause.risk_type}`}
      >
        {fullText.slice(range.start, range.end)}
      </span>
    );

    lastIndex = range.end;
  });

  // Add remaining trailing text
  if (lastIndex < fullText.length) {
    elements.push(
      <span key="text-end" className="whitespace-pre-wrap">
        {fullText.slice(lastIndex)}
      </span>
    );
  }

  return (
    <div 
      className={`bg-slate-900/40 border border-slate-800 rounded-xl p-6 md:p-8 font-serif text-slate-300 select-text leading-relaxed ${
        elderMode 
          ? "text-xl md:text-2xl leading-loose text-slate-100 bg-white border-4 border-slate-900 text-black font-sans shadow-md" 
          : "text-sm md:text-md"
      }`}
      style={elderMode ? { color: "#000000", backgroundColor: "#ffffff" } : {}}
    >
      {elements}
    </div>
  );
}

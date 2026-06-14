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

  const getHighlightRanges = (): HighlightRange[] => {
    const ranges: HighlightRange[] = [];

    const clauseIndices = clauses
      .map((c) => ({ clause: c, index: fullText.indexOf(c.text) }))
      .filter((item) => item.index !== -1)
      .sort((a, b) => a.index - b.index);

    let lastEnd = 0;
    for (const item of clauseIndices) {
      const start = fullText.indexOf(item.clause.text, lastEnd);
      if (start !== -1) {
        const end = start + item.clause.text.length;
        ranges.push({ start, end, clause: item.clause });
        lastEnd = end;
      }
    }
    return ranges;
  };

  const ranges = getHighlightRanges();
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  const highlightClassFor = (severity: RiskClause["severity"], isSelected: boolean) => {
    const base = "cursor-pointer rounded px-0.5 transition-colors";
    if (severity === "high") {
      return isSelected
        ? `${base} bg-red-600 text-white font-semibold`
        : `${base} bg-red-100 text-red-900 underline decoration-red-400 decoration-2 underline-offset-2 hover:bg-red-200`;
    }
    if (severity === "medium") {
      return isSelected
        ? `${base} bg-amber-500 text-amber-950 font-semibold`
        : `${base} bg-amber-100 text-amber-900 underline decoration-amber-400 decoration-2 underline-offset-2 hover:bg-amber-200`;
    }
    return isSelected
      ? `${base} bg-stone-300 text-stone-900 font-semibold`
      : `${base} bg-stone-100 text-stone-700 underline decoration-stone-300 decoration-2 underline-offset-2 hover:bg-stone-200`;
  };

  ranges.forEach((range, idx) => {
    if (range.start > lastIndex) {
      elements.push(
        <span key={`text-${idx}`} className="whitespace-pre-wrap">
          {fullText.slice(lastIndex, range.start)}
        </span>,
      );
    }

    const isSelected = selectedClauseId === range.clause.id;
    elements.push(
      <span
        key={`highlight-${idx}`}
        onClick={() => onSelectClause(range.clause)}
        className={highlightClassFor(range.clause.severity, isSelected)}
        title={`Click to read the explanation for: ${range.clause.risk_type}`}
      >
        {fullText.slice(range.start, range.end)}
      </span>,
    );

    lastIndex = range.end;
  });

  if (lastIndex < fullText.length) {
    elements.push(
      <span key="text-end" className="whitespace-pre-wrap">
        {fullText.slice(lastIndex)}
      </span>,
    );
  }

  return (
    <div
      className={`select-text rounded-2xl border border-line bg-white p-6 font-serif leading-loose text-ink md:p-8 ${
        elderMode ? "text-xl md:text-2xl" : "text-base md:text-lg"
      }`}
    >
      {elements}
    </div>
  );
}

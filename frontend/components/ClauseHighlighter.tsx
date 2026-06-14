"use client";

import React, { useMemo } from "react";
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

const severityWeight = { high: 3, medium: 2, low: 1 };

export default function ClauseHighlighter({
  fullText,
  clauses,
  selectedClauseId,
  onSelectClause,
}: ClauseHighlighterProps) {
  const { elderMode } = useAccessibility();

  const ranges = useMemo(() => {
    const candidates: HighlightRange[] = clauses.flatMap((clause) => {
      const spans = clause.trigger_spans.length
        ? clause.trigger_spans
        : [{ start: clause.start_offset, end: clause.end_offset, text: clause.text }];
      return spans
        .filter((span) => span.start >= 0 && span.end <= fullText.length && span.end > span.start)
        .map((span) => ({ start: span.start, end: span.end, clause }));
    });

    candidates.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      const severityDifference =
        severityWeight[b.clause.severity] - severityWeight[a.clause.severity];
      if (severityDifference) return severityDifference;
      return b.end - b.start - (a.end - a.start);
    });

    const nonOverlapping: HighlightRange[] = [];
    let lastEnd = -1;
    for (const candidate of candidates) {
      if (candidate.start < lastEnd) continue;
      nonOverlapping.push(candidate);
      lastEnd = candidate.end;
    }
    return nonOverlapping;
  }, [clauses, fullText]);

  if (!fullText) return null;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  const highlightClassFor = (severity: RiskClause["severity"], isSelected: boolean) => {
    const base = "cursor-pointer rounded px-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-shield";
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

  ranges.forEach((range, index) => {
    if (range.start > lastIndex) {
      elements.push(
        <span key={`text-${index}`} className="whitespace-pre-wrap">
          {fullText.slice(lastIndex, range.start)}
        </span>,
      );
    }

    const isSelected = selectedClauseId === range.clause.id;
    elements.push(
      <button
        type="button"
        key={`highlight-${range.start}-${range.end}`}
        onClick={() => onSelectClause(range.clause)}
        className={highlightClassFor(range.clause.severity, isSelected)}
        title={`${range.clause.risk_type}: ${range.clause.plain_english}`}
      >
        {fullText.slice(range.start, range.end)}
      </button>,
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

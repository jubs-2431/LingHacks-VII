"use client";

import React from "react";
import { useAccessibility } from "../lib/AccessibilityContext";

interface SeverityBadgeProps {
  severity: "low" | "medium" | "high";
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { elderMode } = useAccessibility();

  const getStyles = () => {
    if (elderMode) {
      switch (severity) {
        case "high":
          return "bg-red-600 text-white border-2 border-black font-extrabold text-lg px-4 py-1.5";
        case "medium":
          return "bg-orange-500 text-slate-900 border-2 border-black font-extrabold text-lg px-4 py-1.5";
        case "low":
          return "bg-amber-300 text-slate-900 border-2 border-black font-extrabold text-lg px-4 py-1.5";
      }
    } else {
      switch (severity) {
        case "high":
          return "bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-2.5 py-0.5";
        case "medium":
          return "bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5";
        case "low":
          return "bg-slate-800 text-slate-300 border border-slate-700 text-xs px-2.5 py-0.5";
      }
    }
  };

  const getLabel = () => {
    switch (severity) {
      case "high":
        return "HIGH RISK";
      case "medium":
        return "MEDIUM RISK";
      case "low":
        return "LOW RISK";
    }
  };

  return (
    <span className={`inline-block rounded-md tracking-wider ${getStyles()}`}>
      {getLabel()}
    </span>
  );
}

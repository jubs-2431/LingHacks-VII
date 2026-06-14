"use client";

import React from "react";
import { useAccessibility } from "../lib/AccessibilityContext";

interface SeverityBadgeProps {
  severity: "low" | "medium" | "high";
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const { elderMode } = useAccessibility();

  const styles: Record<SeverityBadgeProps["severity"], string> = {
    high: "bg-red-600 text-white",
    medium: "bg-amber-500 text-amber-950",
    low: "bg-stone-200 text-stone-700",
  };

  const labels: Record<SeverityBadgeProps["severity"], string> = {
    high: "High risk",
    medium: "Medium risk",
    low: "Low risk",
  };

  return (
    <span
      className={`keep-color inline-block rounded-full font-bold uppercase tracking-wide ${styles[severity]} ${
        elderMode ? "px-4 py-1.5 text-base" : "px-3 py-1 text-[11px]"
      }`}
    >
      {labels[severity]}
    </span>
  );
}

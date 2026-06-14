"use client";

import React, { useState } from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { CheckSquare, Square, Printer, ClipboardCheck } from "lucide-react";

interface ChecklistProps {
  items: string[];
}

export default function Checklist({ items }: ChecklistProps) {
  const { elderMode } = useAccessibility();
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center">
        <p className="text-muted">No checklist items generated.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h3 className={`flex items-center gap-2.5 font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-xl"}`}>
          <ClipboardCheck className="keep-color h-6 w-6 text-shield" />
          <span>Before-you-sign checklist</span>
        </h3>
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 rounded-lg border border-line bg-white font-semibold text-ink transition-colors hover:border-shield hover:text-shield ${
            elderMode ? "px-5 py-2.5 text-lg" : "px-3 py-1.5 text-sm"
          }`}
        >
          <Printer className="keep-color h-4 w-4" />
          <span>Print</span>
        </button>
      </div>

      <p className={`pt-4 text-muted ${elderMode ? "text-lg text-ink" : "text-sm"}`}>
        Ask a family member, caregiver, or lawyer these questions before signing:
      </p>

      <ul className="space-y-2.5 pt-4">
        {items.map((item, idx) => {
          const isChecked = !!checkedItems[idx];
          return (
            <li
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                isChecked
                  ? "border-shield/30 bg-shield-soft/50 text-shield-dark line-through opacity-70"
                  : "border-line bg-white text-ink hover:border-faint"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckSquare className={`keep-color text-shield ${elderMode ? "h-7 w-7" : "h-5 w-5"}`} />
                ) : (
                  <Square className={`keep-color text-faint ${elderMode ? "h-7 w-7" : "h-5 w-5"}`} />
                )}
              </span>
              <span className={`font-medium leading-relaxed ${elderMode ? "text-xl" : "text-base"}`}>
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useAccessibility } from "../lib/AccessibilityContext";
import { CheckSquare, Square, Printer, CheckCircle } from "lucide-react";

interface ChecklistProps {
  items: string[];
}

export default function Checklist({ items }: ChecklistProps) {
  const { elderMode } = useAccessibility();
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-900/10 border border-slate-800 rounded-xl">
        <p className="text-slate-400">No checklist items generated.</p>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900/20 border border-slate-800 rounded-xl p-6 space-y-4 ${
      elderMode ? "bg-amber-50/50 border-3 border-slate-900 text-slate-950 p-8 shadow-sm" : ""
    }`}>
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-800 pb-3">
        <h3 className={`font-bold flex items-center gap-2.5 ${
          elderMode ? "text-2xl text-slate-900" : "text-lg text-slate-100"
        }`}>
          <CheckCircle className="text-amber-500 w-6 h-6" />
          <span>Before You Sign Checklist</span>
        </h3>
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 rounded-lg font-bold border transition-all ${
            elderMode 
              ? "text-lg px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-950 border-2 border-slate-950" 
              : "text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Print Checklist</span>
        </button>
      </div>

      <p className={`text-slate-400 ${elderMode ? "text-lg text-slate-800 font-semibold" : "text-xs"}`}>
        We recommend asking a family member, caregiver, or lawyer these questions before signing:
      </p>

      <ul className="space-y-3 pt-2">
        {items.map((item, idx) => {
          const isChecked = !!checkedItems[idx];
          return (
            <li
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                isChecked
                  ? elderMode
                    ? "bg-emerald-100 border-emerald-700 text-emerald-950 opacity-70 line-through"
                    : "bg-emerald-950/15 border-emerald-500/20 text-emerald-300 opacity-60 line-through"
                  : elderMode
                    ? "bg-white border-slate-950 text-slate-900 hover:bg-slate-50 border-2"
                    : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 text-slate-200"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isChecked ? (
                  <CheckSquare className={`text-emerald-500 ${elderMode ? "w-7 h-7" : "w-5 h-5"}`} />
                ) : (
                  <Square className={`text-slate-400 ${elderMode ? "w-7 h-7" : "w-5 h-5"}`} />
                )}
              </div>
              <span className={`font-semibold leading-relaxed ${elderMode ? "text-xl" : "text-sm"}`}>
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

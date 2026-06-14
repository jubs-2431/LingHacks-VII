"use client";

import React from "react";
import Link from "next/link";
import { useAccessibility } from "../lib/AccessibilityContext";
import ElderModeToggle from "../components/ElderModeToggle";
import { ShieldAlert, FileText, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";

export default function LandingPage() {
  const { elderMode } = useAccessibility();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className={`border-b ${
        elderMode 
          ? "border-slate-900 bg-white py-6" 
          : "border-slate-800 bg-slate-900/50 backdrop-blur py-4"
      } px-6 md:px-12 sticky top-0 z-50 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <ShieldCheck className={`text-amber-500 ${elderMode ? "w-10 h-10" : "w-8 h-8"}`} />
            <span className={`font-extrabold tracking-tight ${
              elderMode ? "text-3xl text-slate-950" : "text-xl text-white"
            }`}>
              ElderShield
            </span>
          </Link>
          <ElderModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 py-12 md:py-20 px-6 md:px-12 ${
        elderMode ? "bg-white text-slate-950" : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      }`}>
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
              elderMode 
                ? "border-slate-950 bg-slate-100 text-slate-900 text-lg font-bold" 
                : "border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold"
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>LingHacks VII Presentation</span>
            </div>
            
            <h1 className={`font-black tracking-tight leading-tight ${
              elderMode ? "text-5xl md:text-6xl text-slate-950" : "text-4xl md:text-6xl text-white"
            }`}>
              Before you sign, <br />
              <span className="text-amber-500">know what it means.</span>
            </h1>
            
            <p className={`max-w-2xl mx-auto text-slate-400 leading-relaxed ${
              elderMode ? "text-2xl text-slate-800 font-semibold" : "text-md md:text-lg text-slate-300"
            }`}>
              ElderShield is a legal fine-print friction map designed for elderly adults and their caregivers. We find the exact phrases where legal language creates hidden responsibilities, costs, and lost rights.
            </p>

            <div className="pt-4">
              <Link
                href="/analyze"
                className={`inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 ${
                  elderMode ? "px-10 py-5 text-2xl border-3 border-black" : "px-8 py-4 text-md"
                }`}
              >
                <span>Analyze a Document Now</span>
                <ArrowRight className={elderMode ? "w-6 h-6" : "w-5 h-5"} />
              </Link>
            </div>
          </section>

          {/* Problem vs Solution cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`border rounded-2xl p-8 space-y-4 ${
              elderMode 
                ? "border-slate-900 bg-slate-50 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <h2 className={`font-extrabold flex items-center gap-2 ${
                elderMode ? "text-3xl text-red-700" : "text-xl text-red-400"
              }`}>
                The Problem
              </h2>
              <ul className={`space-y-3 ${elderMode ? "text-xl" : "text-sm text-slate-400"}`}>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>Jargon Overload:</strong> Official paperwork uses confusing words designed to hide meaning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>Hidden Traps:</strong> Automatic subscription renewals, binding arbitration, and short deadlines.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>High Stakes:</strong> Elderly users can face sudden financial penalties, lost rights, or data sharing scams.</span>
                </li>
              </ul>
            </div>

            <div className={`border rounded-2xl p-8 space-y-4 ${
              elderMode 
                ? "border-slate-900 bg-slate-50 text-slate-950" 
                : "border-slate-800 bg-slate-900/30"
            }`}>
              <h2 className={`font-extrabold flex items-center gap-2 ${
                elderMode ? "text-3xl text-emerald-700" : "text-xl text-emerald-400"
              }`}>
                Our Solution
              </h2>
              <ul className={`space-y-3 ${elderMode ? "text-xl" : "text-sm text-slate-400"}`}>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>Linguistic Risk Extraction:</strong> We isolate sentences creating legal burdens.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>Plain Meanings:</strong> Complex clauses are explained in simple, friendly, large-font English.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                  <span><strong>Action Checklist:</strong> Generates list of key questions to ask before signing.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Interactive Demo Preview Card */}
          <section className={`border rounded-2xl p-8 md:p-10 space-y-6 ${
            elderMode 
              ? "border-slate-900 bg-white" 
              : "border-slate-800 bg-slate-900/20"
          }`}>
            <div className="space-y-2">
              <h3 className={`font-bold ${elderMode ? "text-3xl" : "text-xl text-white"}`}>
                Example: Fine Print Extraction
              </h3>
              <p className={`text-slate-400 ${elderMode ? "text-lg text-slate-800" : "text-xs"}`}>
                See how ElderShield breaks down complex terms compared to generic summarizers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Input side */}
              <div className="space-y-3">
                <span className={`block font-bold text-slate-400 uppercase tracking-wider ${
                  elderMode ? "text-md text-slate-700" : "text-[10px]"
                }`}>
                  Original Document Section:
                </span>
                <div className={`p-4 rounded-xl font-mono leading-relaxed border ${
                  elderMode 
                    ? "bg-slate-100 border-slate-950 text-slate-950 text-lg" 
                    : "bg-slate-950/40 border-slate-800 text-slate-300 text-xs"
                }`}>
                  "You agree to resolve all disputes through <span className="bg-red-500/20 text-red-300 border-b border-red-500 px-0.5">binding arbitration</span> and <span className="bg-red-500/20 text-red-300 border-b border-red-500 px-0.5">waive your right</span> to participate in any class action."
                </div>
              </div>

              {/* Output side */}
              <div className="space-y-3">
                <span className={`block font-bold text-slate-400 uppercase tracking-wider ${
                  elderMode ? "text-md text-slate-700" : "text-[10px]"
                }`}>
                  ElderShield Extraction:
                </span>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  elderMode 
                    ? "bg-amber-50 border-slate-950 text-slate-950" 
                    : "bg-slate-900/60 border-slate-800"
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold ${elderMode ? "text-xl text-red-700" : "text-xs text-red-400"}`}>
                      Rights Waiver (High Risk)
                    </span>
                  </div>
                  <p className={`font-semibold ${elderMode ? "text-lg" : "text-sm text-slate-200"}`}>
                    "You cannot take this company to court normally."
                  </p>
                  <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-800">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className={`italic ${elderMode ? "text-md text-slate-800" : "text-xs text-amber-200"}`}>
                      Question: "Can I opt out of binding arbitration?"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility highlights */}
          <section className="text-center space-y-4">
            <h3 className={`font-bold ${elderMode ? "text-3xl" : "text-xl text-white"}`}>
              Built for Real Accessibility
            </h3>
            <p className={`max-w-2xl mx-auto text-slate-400 ${
              elderMode ? "text-xl text-slate-800" : "text-xs"
            }`}>
              Accessibility is not an afterthought. ElderShield features high-contrast toggle support, keyboard navigation, Web Speech synthesis (read aloud), simplified layperson summaries, and printable checklist cards.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 md:px-12 text-center text-slate-500 text-xs ${
        elderMode ? "border-slate-900 bg-white text-slate-900" : "border-slate-900 bg-slate-950"
      }`}>
        <div className="max-w-7xl mx-auto space-y-4">
          <p className={elderMode ? "text-lg font-bold" : ""}>
            © 2026 ElderShield Project. Created for LingHacks VII.
          </p>
          <p className={`max-w-3xl mx-auto leading-relaxed ${
            elderMode ? "text-sm text-slate-800 font-semibold" : "text-slate-600"
          }`}>
            <strong>Important Disclaimer:</strong> ElderShield is not a lawyer and does not provide legal advice. It is an educational tool designed using computational linguistics to highlight potential risks and provide helpful questions to ask before signing.
          </p>
        </div>
      </footer>
    </div>
  );
}

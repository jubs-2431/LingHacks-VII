"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAccessibility } from "../lib/AccessibilityContext";
import { FileText, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { extractTextFromPdf } from "../lib/api";

interface UploadBoxProps {
  onAnalyze: (text: string, documentType: string) => void;
  isLoading: boolean;
}

const DOCUMENT_TYPES = [
  { value: "lease", label: "Rent Lease Agreement" },
  { value: "insurance", label: "Insurance Form" },
  { value: "medical", label: "Medical Consent or Form" },
  { value: "financial", label: "Financial / Loan Agreement" },
  { value: "terms", label: "Terms of Service / Privacy Policy" },
  { value: "other", label: "Other Official Document" },
];

export default function UploadBox({ onAnalyze, isLoading }: UploadBoxProps) {
  const { elderMode } = useAccessibility();
  const [text, setText] = useState("");
  const [docType, setDocType] = useState("other");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file only.");
      return;
    }

    setFileName(file.name);
    setExtracting(true);
    setError(null);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (extractedText.trim()) {
        setText(extractedText);
      } else {
        setError("We couldn't extract any readable text from this PDF. It might be scanned. Please paste the text directly.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to extract text from PDF.");
    } finally {
      setExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please paste some legal text or upload a PDF document first.");
      return;
    }
    setError(null);
    onAnalyze(text, docType);
  };

  const loadSample = () => {
    const sampleText = 
      "By signing this agreement, you agree to resolve all disputes through binding arbitration and waive your right to participate in any class action. This agreement will automatically renew unless cancelled in writing at least 30 days before the renewal date. Failure to submit payment within 10 business days may result in late fees. We may share your information with third-party service providers as needed. Additional documentation may be required at our discretion.";
    setText(sampleText);
    setDocType("terms");
    setError(null);
    setFileName(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <label 
          htmlFor="doc-type" 
          className={`font-semibold ${elderMode ? "text-2xl text-slate-100" : "text-sm text-slate-300"}`}
        >
          1. What kind of document is this?
        </label>
        <select
          id="doc-type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
            elderMode ? "p-4 text-xl h-16" : "p-3 text-sm h-11"
          }`}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Upload Zone */}
        <div className="flex flex-col gap-2">
          <span className={`font-semibold ${elderMode ? "text-2xl text-slate-100" : "text-sm text-slate-300"}`}>
            Option A: Upload a PDF document
          </span>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[200px] ${
              isDragActive 
                ? "border-amber-500 bg-amber-500/10" 
                : "border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60"
            }`}
          >
            <input {...getInputProps()} />
            {extracting ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                <p className={elderMode ? "text-xl font-medium" : "text-sm font-medium"}>
                  Extracting text from PDF...
                </p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-12 h-12 text-amber-400" />
                <p className={`font-medium break-all ${elderMode ? "text-lg text-amber-300" : "text-xs text-amber-400"}`}>
                  {fileName}
                </p>
                <p className={`text-slate-400 ${elderMode ? "text-lg" : "text-xs"}`}>
                  Text loaded! You can edit it below or click analyze.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-slate-400" />
                <p className={`font-semibold text-slate-200 ${elderMode ? "text-xl" : "text-sm"}`}>
                  Drag and drop your PDF here
                </p>
                <p className={`text-slate-400 ${elderMode ? "text-lg" : "text-xs"}`}>
                  or click to select a file from your computer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Paste Box Description */}
        <div className="flex flex-col justify-between p-6 bg-slate-900/20 border border-slate-800 rounded-xl">
          <div className="space-y-4">
            <h3 className={`font-semibold text-slate-200 ${elderMode ? "text-2xl" : "text-md"}`}>
              Need an example?
            </h3>
            <p className={`text-slate-400 ${elderMode ? "text-lg leading-relaxed" : "text-xs leading-relaxed"}`}>
              Try ElderShield right now with a mock contract clause containing binding arbitration, auto-renew, deadlines, and ambiguous rules.
            </p>
          </div>
          <button
            type="button"
            onClick={loadSample}
            className={`w-full mt-4 font-bold border border-amber-500/30 hover:border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all ${
              elderMode ? "p-4 text-lg" : "p-3 text-sm"
            }`}
          >
            Load Sample Contract Clause
          </button>
        </div>
      </div>

      {/* Paste text area */}
      <div className="flex flex-col gap-2">
        <label 
          htmlFor="doc-text" 
          className={`font-semibold ${elderMode ? "text-2xl text-slate-100" : "text-sm text-slate-300"}`}
        >
          2. Document Text (Edit or paste here)
        </label>
        <textarea
          id="doc-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the contract, agreement, or official terms here..."
          className={`w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono resize-y min-h-[220px] ${
            elderMode ? "p-5 text-lg leading-relaxed" : "p-4 text-xs leading-normal"
          }`}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/40 p-4 rounded-xl text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className={elderMode ? "text-lg" : "text-sm"}>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || extracting}
        className={`w-full font-bold bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-900 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 flex items-center justify-center gap-3 ${
          elderMode ? "py-5 text-2xl h-18" : "py-3.5 text-md h-12"
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Analyzing text patterns...</span>
          </>
        ) : (
          <span>Analyze Document for Risks</span>
        )}
      </button>
    </form>
  );
}

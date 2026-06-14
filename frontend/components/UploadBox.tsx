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
  { value: "lease", label: "Rent / lease agreement" },
  { value: "insurance", label: "Insurance form" },
  { value: "medical", label: "Medical consent or form" },
  { value: "financial", label: "Financial / loan agreement" },
  { value: "terms", label: "Terms of service / privacy policy" },
  { value: "other", label: "Other official document" },
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
        setError(
          "We couldn't extract any readable text from this PDF. It might be scanned. Please paste the text directly.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract text from PDF.");
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

  const labelClass = `font-semibold text-ink ${elderMode ? "text-xl" : "text-sm"}`;
  const stepNum =
    "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-shield text-xs font-bold text-white";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-7">
      {/* Step 1 */}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="doc-type" className={`flex items-center gap-2.5 ${labelClass}`}>
          <span className={stepNum}>1</span>
          What kind of document is this?
        </label>
        <select
          id="doc-type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className={`w-full rounded-xl border border-line bg-white text-ink shadow-sm transition-all focus:border-shield focus:ring-2 focus:ring-shield/30 ${
            elderMode ? "h-16 p-4 text-xl" : "h-12 p-3 text-base"
          }`}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2 */}
      <div className="flex flex-col gap-2.5">
        <span className={`flex items-center gap-2.5 ${labelClass}`}>
          <span className={stepNum}>2</span>
          Add the text — upload a PDF or paste it
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* PDF Upload Zone */}
          <div
            {...getRootProps()}
            className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragActive
                ? "border-shield bg-shield-soft"
                : "border-line bg-paper/50 hover:border-shield/50 hover:bg-paper"
            }`}
          >
            <input {...getInputProps()} />
            {extracting ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="keep-color h-9 w-9 animate-spin text-shield" />
                <p className={`font-medium text-ink ${elderMode ? "text-xl" : "text-sm"}`}>
                  Reading text from PDF…
                </p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="keep-color h-10 w-10 text-shield" />
                <p className={`break-all font-semibold text-shield-dark ${elderMode ? "text-lg" : "text-sm"}`}>
                  {fileName}
                </p>
                <p className={`text-muted ${elderMode ? "text-lg" : "text-xs"}`}>
                  Text loaded — edit it below or analyze.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="keep-color h-9 w-9 text-faint" />
                <p className={`font-semibold text-ink ${elderMode ? "text-xl" : "text-base"}`}>
                  Drag &amp; drop a PDF here
                </p>
                <p className={`text-muted ${elderMode ? "text-lg" : "text-xs"}`}>
                  or click to choose a file
                </p>
              </div>
            )}
          </div>

          {/* Sample helper */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-white p-6">
            <div className="space-y-2">
              <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-lg"}`}>
                No document handy?
              </h3>
              <p className={`leading-relaxed text-muted ${elderMode ? "text-lg" : "text-sm"}`}>
                Try ElderShield with a sample contract clause containing binding
                arbitration, auto-renewal, deadlines, and vague terms.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSample}
              className={`mt-4 w-full rounded-lg border border-shield/30 bg-shield-soft font-semibold text-shield-dark transition-colors hover:border-shield hover:bg-shield-soft/70 ${
                elderMode ? "p-4 text-lg" : "p-3 text-sm"
              }`}
            >
              Load a sample clause
            </button>
          </div>
        </div>
      </div>

      {/* Text area */}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="doc-text" className={labelClass}>
          Document text
        </label>
        <textarea
          id="doc-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the contract, agreement, or official terms here…"
          className={`min-h-[220px] w-full resize-y rounded-xl border border-line bg-white text-ink shadow-sm transition-all focus:border-shield focus:ring-2 focus:ring-shield/30 ${
            elderMode ? "p-5 text-lg leading-relaxed" : "p-4 text-sm leading-relaxed"
          }`}
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          <AlertCircle className="keep-color mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <span className={elderMode ? "text-lg" : "text-sm"}>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || extracting}
        className={`flex w-full items-center justify-center gap-3 rounded-xl bg-shield font-semibold text-white shadow-lg shadow-shield/20 transition-colors hover:bg-shield-dark disabled:cursor-not-allowed disabled:bg-faint disabled:shadow-none ${
          elderMode ? "py-5 text-2xl" : "py-4 text-lg"
        }`}
      >
        {isLoading ? (
          <>
            <RefreshCw className="keep-color h-6 w-6 animate-spin" />
            <span>Reading the fine print…</span>
          </>
        ) : (
          <span>Check this document</span>
        )}
      </button>
    </form>
  );
}

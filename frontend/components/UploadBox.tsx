"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAccessibility } from "../lib/AccessibilityContext";
import { DocumentType, PageSpan } from "../lib/types";
import { FileText, Upload, AlertCircle, RefreshCw, ScanText } from "lucide-react";
import { extractTextFromDocument } from "../lib/api";


interface UploadBoxProps {
  onAnalyze: (
    text: string,
    documentType: DocumentType,
    extractionWarnings: string[],
    pages: PageSpan[],
  ) => void;
  isLoading: boolean;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
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
  const [docType, setDocType] = useState<DocumentType>("other");
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [usedOcr, setUsedOcr] = useState(false);
  const [pages, setPages] = useState<PageSpan[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: unknown[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      if (rejectedFiles.length) {
        setError("Please choose one PDF, PNG, or JPEG file under 10 MB.");
      }
      return;
    }

    setFileName(file.name);
    setExtracting(true);
    setError(null);
    setExtractionWarnings([]);
    setUsedOcr(false);
    setPages([]);

    try {
      const extracted = await extractTextFromDocument(file);
      setText(extracted.text);
      setExtractionWarnings(extracted.warnings);
      setUsedOcr(extracted.used_ocr);
      setPages(extracted.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read the document.");
    } finally {
      setExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setError("Please paste text or upload a document first.");
      return;
    }
    setError(null);
    onAnalyze(text, docType, extractionWarnings, pages);
  };

  const loadSample = () => {
    setText(
      "By signing this agreement, you agree to resolve all disputes through binding arbitration and waive your right to participate in any class action. This agreement will automatically renew unless cancelled in writing at least 30 days before the renewal date. Failure to submit payment within 10 business days may result in late fees. We may share your information with third-party service providers as needed. Additional documentation may be required at our discretion.",
    );
    setDocType("terms");
    setError(null);
    setFileName(null);
    setExtractionWarnings([]);
    setUsedOcr(false);
    setPages([]);
  };

  const labelClass = `font-semibold text-ink ${elderMode ? "text-xl" : "text-sm"}`;
  const stepNum = "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-shield text-xs font-bold text-white";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-7">
      <div className="flex flex-col gap-2.5">
        <label htmlFor="doc-type" className={`flex items-center gap-2.5 ${labelClass}`}>
          <span className={stepNum}>1</span>
          What kind of document is this?
        </label>
        <select
          id="doc-type"
          value={docType}
          onChange={(event) => setDocType(event.target.value as DocumentType)}
          className={`w-full rounded-xl border border-line bg-white text-ink shadow-sm transition-all focus:border-shield focus:ring-2 focus:ring-shield/30 ${
            elderMode ? "h-16 p-4 text-xl" : "h-12 p-3 text-base"
          }`}
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className={`flex items-center gap-2.5 ${labelClass}`}>
          <span className={stepNum}>2</span>
          Add the text - upload a file or paste it
        </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            {...getRootProps()}
            className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragActive ? "border-shield bg-shield-soft" : "border-line bg-paper/50 hover:border-shield/50 hover:bg-paper"
            }`}
          >
            <input {...getInputProps()} />
            {extracting ? (
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="keep-color h-9 w-9 animate-spin text-shield" />
                <p className={`font-medium text-ink ${elderMode ? "text-xl" : "text-sm"}`}>Reading document...</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                {usedOcr ? <ScanText className="keep-color h-10 w-10 text-shield" /> : <FileText className="keep-color h-10 w-10 text-shield" />}
                <p className={`break-all font-semibold text-shield-dark ${elderMode ? "text-lg" : "text-sm"}`}>{fileName}</p>
                <p className={`text-muted ${elderMode ? "text-lg" : "text-xs"}`}>
                  {usedOcr ? "Scanned text loaded with OCR." : "Text loaded - review it below."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="keep-color h-9 w-9 text-faint" />
                <p className={`font-semibold text-ink ${elderMode ? "text-xl" : "text-base"}`}>Drag and drop a document</p>
                <p className={`text-muted ${elderMode ? "text-lg" : "text-xs"}`}>PDF, PNG, or JPEG up to 10 MB</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-line bg-white p-6">
            <div className="space-y-2">
              <h3 className={`font-serif font-medium text-ink ${elderMode ? "text-2xl" : "text-lg"}`}>No document handy?</h3>
              <p className={`leading-relaxed text-muted ${elderMode ? "text-lg" : "text-sm"}`}>
                Test waivers, automatic renewal, deadlines, data sharing, proof requirements, and discretionary language.
              </p>
            </div>
            <button
              type="button"
              onClick={loadSample}
              className={`mt-4 w-full rounded-lg border border-shield/30 bg-shield-soft font-semibold text-shield-dark transition-colors hover:border-shield ${
                elderMode ? "p-4 text-lg" : "p-3 text-sm"
              }`}
            >
              Load the full sample
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="doc-text" className={labelClass}>Document text</label>
        <textarea
          id="doc-text"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setPages([]);
          }}
          maxLength={200_000}
          placeholder="Paste the contract, agreement, or official terms here..."
          className={`min-h-[220px] w-full resize-y rounded-xl border border-line bg-white text-ink shadow-sm transition-all focus:border-shield focus:ring-2 focus:ring-shield/30 ${
            elderMode ? "p-5 text-lg leading-relaxed" : "p-4 text-sm leading-relaxed"
          }`}
        />
        <span className="text-right text-xs text-faint">{text.length.toLocaleString()} / 200,000 characters</span>
      </div>

      {extractionWarnings.map((warning) => (
        <div key={warning} className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertCircle className="keep-color mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <span className={elderMode ? "text-lg" : "text-sm"}>{warning}</span>
        </div>
      ))}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          <AlertCircle className="keep-color mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <span className={elderMode ? "text-lg" : "text-sm"}>{error}</span>
        </div>
      )}

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
            <span>Reading the fine print...</span>
          </>
        ) : (
          <span>Check this document</span>
        )}
      </button>
    </form>
  );
}

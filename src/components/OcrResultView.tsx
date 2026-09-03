"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCcw, FileText } from "lucide-react";
import { OcrResult } from "@/lib/ocr";

interface OcrResultViewProps {
  result: OcrResult;
  onReset: () => void;
  onReanalyze?: () => void;
}

export function OcrResultView({
  result,
  onReset,
  onReanalyze,
}: OcrResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const characterCount = result.text.length;
  const lineCount = result.lines.length;
  const wordCount = result.text.trim().split(/\s+/).filter(Boolean).length;
  const confidencePercent = Math.round(result.confidence);

  return (
    <div className="w-full bg-surface border border-subtle rounded-md p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-subtle gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-secondary" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-primary">
            Extracted Text
          </h2>
          <span className="text-xs text-secondary bg-background px-2 py-0.5 rounded border border-subtle">
            {wordCount} words • {lineCount} lines • {confidencePercent}% confidence
          </span>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="copy-text-btn"
            onClick={handleCopy}
            className="text-xs font-medium text-primary hover:text-accent transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 border border-subtle rounded bg-background hover:bg-subtle"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-secondary" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="scan-another-btn"
            onClick={onReset}
            className="text-xs font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Scan Another Label</span>
          </button>
        </div>
      </div>

      {/* Monospace Raw Extracted Text Box */}
      <div className="relative">
        <pre
          id="raw-ocr-output"
          tabIndex={0}
          aria-label="Raw OCR Extracted Text"
          className="w-full bg-background border border-subtle rounded p-4 font-mono text-xs sm:text-sm text-primary leading-relaxed whitespace-pre-wrap break-words max-h-[460px] overflow-y-auto selection:bg-accent/20 focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {result.text}
        </pre>
      </div>

      {/* Footer stats / helper notes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-secondary pt-1 gap-2">
        <span>
          {characterCount} total characters extracted locally via Tesseract Web Worker.
        </span>
        {onReanalyze && (
          <button
            type="button"
            onClick={onReanalyze}
            className="text-secondary hover:text-primary underline text-left sm:text-right"
          >
            Re-run OCR on current image
          </button>
        )}
      </div>
    </div>
  );
}

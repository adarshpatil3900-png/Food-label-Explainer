"use client";

import React from "react";
import { AlertCircle, RotateCcw, Upload } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorMessage({
  message,
  onRetry,
  onReset,
}: ErrorMessageProps) {
  return (
    <div className="w-full bg-surface border border-subtle rounded-md p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-700 flex-shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-primary">
            Unable to read label
          </h3>
          <p className="text-xs text-secondary leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="bg-background rounded p-3 text-xs text-secondary space-y-1 border border-subtle">
        <p className="font-medium text-primary">Tips for better recognition:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>Ensure label text is flat and well-lit without heavy glare or flash reflections</li>
          <li>Hold the camera closer so the nutrition facts or ingredient list fills the frame</li>
          <li>Avoid blurry or tilted shots</li>
        </ul>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          id="retry-ocr-btn"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active rounded transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          id="error-reset-btn"
          onClick={onReset}
          className="px-4 py-2 text-xs font-medium text-primary bg-background hover:bg-subtle border border-subtle rounded transition-colors inline-flex items-center gap-2"
        >
          <Upload className="w-3.5 h-3.5 text-secondary" />
          <span>Choose Different Photo</span>
        </button>
      </div>
    </div>
  );
}

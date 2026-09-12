"use client";

import React from "react";
import { AlertCircle, RotateCcw, Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

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
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="w-full bg-surface border border-subtle rounded-md p-6 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-primary">
            {t.error.unableToRead}
          </h3>
          <p className="text-xs text-secondary leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="bg-background rounded p-3 text-xs text-secondary space-y-1 border border-subtle">
        <p className="font-medium text-primary">{t.error.tipsTitle}</p>
        <ul className="list-disc list-inside space-y-0.5 ml-1">
          <li>{t.error.tip1}</li>
          <li>{t.error.tip2}</li>
          <li>{t.error.tip3}</li>
        </ul>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          id="retry-ocr-btn"
          onClick={onRetry}
          aria-label={t.error.tryAgain}
          className="px-4 py-2 text-xs font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active rounded transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.error.tryAgain}</span>
        </button>

        <button
          type="button"
          id="error-reset-btn"
          onClick={onReset}
          aria-label={t.error.chooseDifferent}
          className="px-4 py-2 text-xs font-medium text-primary bg-background hover:bg-subtle border border-subtle rounded transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          <Upload className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
          <span>{t.error.chooseDifferent}</span>
        </button>
      </div>
    </div>
  );
}

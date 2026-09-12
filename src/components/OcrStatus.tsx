"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface OcrStatusProps {
  message?: string;
  progress?: number;
}

export function OcrStatus({ message, progress = 0 }: OcrStatusProps) {
  const { t } = useTranslation();
  const displayMessage = message || t.status.readingLabel;
  const percent = Math.round(progress * 100);

  return (
    <div className="w-full bg-surface border border-subtle rounded-md p-8 flex flex-col items-center justify-center text-center space-y-4">
      {/* Simple, honest spinner */}
      <div className="text-accent animate-spin">
        <Loader2 className="w-8 h-8" strokeWidth={2} />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">
          {displayMessage}
        </p>
        <p className="text-xs text-secondary">
          {t.status.workerNote}
        </p>
      </div>

      {/* Subtle flat progress bar if progress > 0 */}
      {progress > 0 && progress < 1 && (
        <div className="w-64 max-w-full bg-subtle/50 h-1.5 rounded overflow-hidden mt-2">
          <div
            className="bg-accent h-full transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

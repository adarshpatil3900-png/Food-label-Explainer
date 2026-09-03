"use client";

import React from "react";
import { RotateCw, AlertCircle } from "lucide-react";

export interface ExplanationData {
  explanation: string;
  takeaway: string;
}

interface ExplanationViewProps {
  status: "idle" | "loading" | "success" | "error";
  data: ExplanationData | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function ExplanationView({
  status,
  data,
  errorMessage,
  onRetry,
}: ExplanationViewProps) {
  return (
    <div className="bg-surface border border-subtle rounded-md p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <h3 className="text-sm font-semibold text-primary">What This Means</h3>
        {status === "success" && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
            aria-label="Refresh explanation"
          >
            <RotateCw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <div className="py-6 flex items-center justify-center gap-3 text-secondary text-xs">
          <div
            className="w-4 h-4 border-2 border-subtle border-t-accent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          />
          <span>Generating explanation…</span>
        </div>
      )}

      {/* Error / Key Missing State */}
      {status === "error" && (
        <div className="py-2 space-y-3">
          <div className="text-xs text-secondary flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-primary font-medium">
                Explanation unavailable right now — the nutrition data above is still accurate.
              </p>
              {errorMessage && (
                <p className="text-[11px] text-secondary">{errorMessage}</p>
              )}
            </div>
          </div>

          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="text-xs font-medium text-primary bg-background hover:bg-subtle border border-subtle px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                <RotateCw className="w-3 h-3" />
                <span>Try again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {status === "success" && data && (
        <div className="space-y-4 text-xs sm:text-sm text-primary leading-relaxed">
          <p className="whitespace-pre-line text-secondary sm:text-primary">
            {data.explanation}
          </p>

          {data.takeaway && (
            <div className="pt-3 border-t border-subtle">
              <div className="bg-background border border-subtle rounded p-3 text-xs space-y-1">
                <span className="font-semibold text-primary block">Takeaway:</span>
                <span className="text-secondary leading-relaxed block">
                  {data.takeaway}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

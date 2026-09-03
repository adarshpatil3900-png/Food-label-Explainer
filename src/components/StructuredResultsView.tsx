"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  FileText,
  AlertTriangle,
  Info,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { OcrResult } from "@/lib/ocr";
import { ParsedNutritionData } from "@/lib/parseNutrition";
import { ParsedIngredientsData } from "@/lib/parseIngredients";
import { NutritionTag } from "@/lib/nutritionSummary";
import { ExplanationView, ExplanationData } from "./ExplanationView";

interface StructuredResultsViewProps {
  ocrResult: OcrResult;
  nutrition: ParsedNutritionData;
  ingredientsData: ParsedIngredientsData;
  summaryTags: NutritionTag[];
  explanationStatus: "idle" | "loading" | "success" | "error";
  explanationData: ExplanationData | null;
  explanationError?: string | null;
  onRetryExplanation?: () => void;
  onReset: () => void;
  onReanalyze?: () => void;
}

export function StructuredResultsView({
  ocrResult,
  nutrition,
  ingredientsData,
  summaryTags,
  explanationStatus,
  explanationData,
  explanationError,
  onRetryExplanation,
  onReset,
  onReanalyze,
}: StructuredResultsViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(ocrResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const isLowDetection =
    nutrition.detectedCount < 2 && ingredientsData.ingredients.length === 0;

  // Table rows configuration
  const nutrientRows = [
    {
      label: "Calories",
      data: nutrition.calories,
      formatter: (v: number) => `${v} kcal`,
    },
    {
      label: "Total Fat",
      data: nutrition.fats,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
    {
      label: "Total Carbohydrate",
      data: nutrition.carbs,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
    {
      label: "Sugars",
      data: nutrition.sugar,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
    {
      label: "Dietary Fiber",
      data: nutrition.fiber,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
    {
      label: "Protein",
      data: nutrition.protein,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
    {
      label: "Sodium",
      data: nutrition.sodium,
      formatter: (v: number, u: string) => `${v}${u}`,
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subtle">
        <div>
          <h2 className="text-base font-semibold text-primary">
            Parsed Label Analysis
          </h2>
          <p className="text-xs text-secondary">
            {nutrition.detectedCount} of 7 core nutrients detected •{" "}
            {ingredientsData.ingredients.length} ingredients identified
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="scan-another-btn"
            onClick={onReset}
            aria-label="Analyze another label"
            className="text-xs font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Analyze another label</span>
          </button>
        </div>
      </div>

      {/* Low Detection Notice if OCR was unclear */}
      {isLowDetection && (
        <div
          role="alert"
          className="border border-subtle bg-background rounded p-3.5 text-xs text-secondary flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="font-medium text-primary">Limited data detected.</span>{" "}
            The label may be angled, low resolution, or missing standard nutrition headers. Check the raw text below or try capturing a closer, well-lit photo.
          </div>
        </div>
      )}

      {/* 1. Rule-Based Summary Tags */}
      {summaryTags.length > 0 && (
        <div className="bg-surface border border-subtle rounded-md p-4 space-y-3">
          <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">
            Nutrition Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {summaryTags.map((tag) => {
              const isCaution = tag.type === "caution";
              const isPositive = tag.type === "positive";

              return (
                <div
                  key={tag.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border ${
                    isCaution
                      ? "bg-amber-50/70 border-amber-200 text-amber-900"
                      : isPositive
                      ? "bg-accent-light border-accent/30 text-accent font-medium"
                      : "bg-background border-subtle text-secondary"
                  }`}
                  title={tag.detail}
                >
                  {isPositive && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                  {isCaution && <AlertTriangle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />}
                  <span>{tag.label}</span>
                  <span className="text-[11px] opacity-75 font-normal">
                    ({tag.detail.split("(")[0].trim()})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Main Content Grid: Nutrition Facts & Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Nutrition Facts Table */}
        <div className="bg-surface border border-subtle rounded-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-primary mb-3">
              <h3 className="text-sm font-bold text-primary tracking-tight uppercase">
                Nutrition Facts
              </h3>
              {nutrition.servingSize && (
                <span className="text-xs text-secondary font-mono">
                  {nutrition.servingSize}
                </span>
              )}
            </div>

            {/* Dense, Tabular Nutrition List */}
            <div className="divide-y divide-subtle text-sm">
              {nutrientRows.map((row) => {
                const detected = row.data !== null;

                return (
                  <div
                    key={row.label}
                    className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span
                      className={`${
                        row.label === "Calories" ||
                        row.label === "Total Fat" ||
                        row.label === "Total Carbohydrate" ||
                        row.label === "Protein"
                          ? "font-semibold text-primary"
                          : "font-normal text-primary pl-2.5"
                      }`}
                    >
                      {row.label}
                    </span>

                    <span className="tabular-nums font-mono text-xs sm:text-sm">
                      {detected ? (
                        <span className="font-semibold text-primary">
                          {row.formatter(row.data!.value, row.data!.unit)}
                        </span>
                      ) : (
                        <span className="text-secondary italic text-xs">
                          Not detected
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-subtle mt-4 text-[11px] text-secondary">
            Values extracted deterministically from label OCR.
          </div>
        </div>

        {/* Right Column: Ingredients List */}
        <div className="bg-surface border border-subtle rounded-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-subtle mb-3">
              <h3 className="text-sm font-semibold text-primary">
                Ingredients List
              </h3>
              <span className="text-xs text-secondary">
                {ingredientsData.ingredients.length} items
              </span>
            </div>

            {ingredientsData.ingredients.length > 0 ? (
              <div className="space-y-3">
                <ol className="divide-y divide-subtle/60 text-xs sm:text-sm max-h-[380px] overflow-y-auto pr-1">
                  {ingredientsData.ingredients.map((item, idx) => (
                    <li
                      key={idx}
                      className="py-2 flex items-start gap-2.5 text-primary leading-relaxed"
                    >
                      <span className="font-mono text-xs text-secondary flex-shrink-0 mt-0.5 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>

                {ingredientsData.containsAllergens.length > 0 && (
                  <div className="pt-3 border-t border-subtle">
                    <p className="text-xs font-medium text-amber-900 bg-amber-50/80 border border-amber-200/80 rounded p-2">
                      <span className="font-bold">Contains:</span>{" "}
                      {ingredientsData.containsAllergens.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-secondary space-y-1">
                <p className="font-medium text-primary">No ingredients list found</p>
                <p>
                  No &quot;Ingredients:&quot; block could be detected. If present on the package, verify in the raw text below.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-subtle mt-4 text-[11px] text-secondary">
            Ingredients are listed in order of predominance by weight.
          </div>
        </div>
      </div>

      {/* 3. AI Explanation Section ("What This Means") */}
      <ExplanationView
        status={explanationStatus}
        data={explanationData}
        errorMessage={explanationError}
        onRetry={onRetryExplanation}
      />

      {/* 4. Collapsible Raw OCR Text Section */}
      <div className="border border-subtle bg-surface rounded-md">
        <details className="group">
          <summary
            className="px-4 py-3 text-xs font-medium text-secondary hover:text-primary cursor-pointer select-none list-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-t-md"
            aria-label="Toggle raw extracted OCR text"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View raw extracted OCR text ({ocrResult.text.length} characters)</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-secondary group-open:rotate-180 transition-transform" aria-hidden="true" />
          </summary>

          <div className="p-4 pt-0 space-y-3 border-t border-subtle/50 mt-1">
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-secondary">
                Confidence: {Math.round(ocrResult.confidence)}% • {ocrResult.lines.length} lines
              </span>
              <button
                type="button"
                id="copy-raw-text-btn"
                onClick={handleCopyRaw}
                aria-label="Copy raw text to clipboard"
                className="text-xs font-medium text-primary hover:text-accent transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 border border-subtle rounded bg-background hover:bg-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                    <span>Copy Raw Text</span>
                  </>
                )}
              </button>
            </div>

            <pre
              id="raw-ocr-disclosure"
              tabIndex={0}
              aria-label="Extracted OCR text"
              className="w-full bg-background border border-subtle rounded p-3.5 font-mono text-xs text-primary leading-relaxed whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto selection:bg-accent/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              {ocrResult.text}
            </pre>

            {onReanalyze && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={onReanalyze}
                  className="text-xs text-secondary hover:text-primary underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                >
                  Re-run OCR engine on current image
                </button>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

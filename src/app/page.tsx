"use client";

import React, { useState, useCallback } from "react";
import { UploadArea } from "@/components/UploadArea";
import { ImagePreview } from "@/components/ImagePreview";
import { OcrStatus } from "@/components/OcrStatus";
import { StructuredResultsView } from "@/components/StructuredResultsView";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ExplanationData } from "@/components/ExplanationView";
import { performOcr, OcrResult, OcrProgress } from "@/lib/ocr";
import { parseNutrition, ParsedNutritionData } from "@/lib/parseNutrition";
import { parseIngredients, ParsedIngredientsData } from "@/lib/parseIngredients";
import { generateNutritionSummary, NutritionTag } from "@/lib/nutritionSummary";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type AppState = "idle" | "ready" | "processing" | "success" | "error";

export default function HomePage() {
  const { language, t } = useTranslation();
  const [appState, setAppState] = useState<AppState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeImageSource, setActiveImageSource] = useState<string | Blob | null>(null);
  const [progress, setProgress] = useState<OcrProgress>({
    status: "idle",
    progress: 0,
    message: "Initializing…",
  });

  // Extracted and parsed state
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [nutrition, setNutrition] = useState<ParsedNutritionData | null>(null);
  const [ingredients, setIngredients] = useState<ParsedIngredientsData | null>(null);
  const [summaryTags, setSummaryTags] = useState<NutritionTag[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);

  // AI Explanation state
  const [explanationStatus, setExplanationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  const fetchExplanation = async (
    nutrients: ParsedNutritionData,
    ings: ParsedIngredientsData,
    tags: NutritionTag[]
  ) => {
    setExplanationStatus("loading");
    setExplanationError(null);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nutrition: nutrients,
          ingredientsData: ings,
          summaryTags: tags,
          language,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setExplanationError(
          result?.message ||
            "Explanation unavailable right now — the nutrition data above is still accurate."
        );
        setExplanationStatus("error");
        return;
      }

      setExplanationData({
        explanation: result.explanation,
        takeaway: result.takeaway,
      });
      setExplanationStatus("success");
    } catch (err: any) {
      console.error("Failed to fetch explanation:", err);
      setExplanationError(
        "Explanation unavailable right now — the nutrition data above is still accurate."
      );
      setExplanationStatus("error");
    }
  };

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setAppState("ready");
    setErrorText(null);
    setOcrResult(null);
    setNutrition(null);
    setIngredients(null);
    setSummaryTags([]);
    setExplanationStatus("idle");
    setExplanationData(null);
    setExplanationError(null);
  };

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setActiveImageSource(null);
    setOcrResult(null);
    setNutrition(null);
    setIngredients(null);
    setSummaryTags([]);
    setErrorText(null);
    setProgress({ status: "idle", progress: 0, message: "Initializing…" });
    setExplanationStatus("idle");
    setExplanationData(null);
    setExplanationError(null);
    setAppState("idle");
  }, []);

  const handleAnalyze = async (processedSource: string | Blob) => {
    setActiveImageSource(processedSource);
    setAppState("processing");
    setErrorText(null);
    setExplanationStatus("idle");
    setExplanationData(null);
    setExplanationError(null);
    setProgress({
      status: "starting",
      progress: 0.05,
      message: "Starting OCR engine…",
    });

    try {
      const result = await performOcr(processedSource, (p) => {
        setProgress(p);
      });

      // Pure TypeScript deterministic parsing of raw OCR text
      const parsedNutrients = parseNutrition(result.text);
      const parsedIngs = parseIngredients(result.text);
      const tags = generateNutritionSummary(parsedNutrients);

      setOcrResult(result);
      setNutrition(parsedNutrients);
      setIngredients(parsedIngs);
      setSummaryTags(tags);
      setAppState("success");

      // Automatically trigger AI explanation layer
      fetchExplanation(parsedNutrients, parsedIngs, tags);
    } catch (err: any) {
      console.error("OCR execution error:", err);
      setErrorText(
        err?.message ||
          "Failed to process food label. Please ensure the image is clear and try again."
      );
      setAppState("error");
    }
  };

  const handleRetryExplanation = () => {
    if (nutrition && ingredients) {
      fetchExplanation(nutrition, ingredients, summaryTags);
    }
  };

  const handleRetry = () => {
    if (activeImageSource) {
      handleAnalyze(activeImageSource);
    } else if (selectedFile) {
      setAppState("ready");
    } else {
      handleReset();
    }
  };

  // Quick sample label loader for instant testing
  const loadSampleLabel = async (sampleType: "granola" | "soup") => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 700;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw clean food package label
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 600, 700);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(
        sampleType === "granola" ? "NATURE CRUNCH GRANOLA" : "ORGANIC VEGETABLE SOUP",
        30,
        50
      );

      ctx.fillRect(30, 65, 540, 6);

      ctx.font = "bold 34px sans-serif";
      ctx.fillText("Nutrition Facts", 30, 110);

      ctx.font = "14px sans-serif";
      ctx.fillText("8 servings per container", 30, 135);
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("Serving size: 2/3 cup (55g)", 30, 155);

      ctx.fillRect(30, 165, 540, 8);

      ctx.font = "bold 13px sans-serif";
      ctx.fillText("Amount Per Serving", 30, 185);
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(sampleType === "granola" ? "Calories: 230" : "Calories: 90", 30, 220);

      ctx.fillRect(30, 230, 540, 4);

      ctx.font = "bold 12px sans-serif";
      ctx.fillText("% Daily Value*", 470, 245);
      ctx.fillRect(30, 250, 540, 1);

      const items =
        sampleType === "granola"
          ? [
              ["Total Fat 8g", "10%"],
              ["  Saturated Fat 1g", "5%"],
              ["  Trans Fat 0g", ""],
              ["Cholesterol 0mg", "0%"],
              ["Sodium 160mg", "7%"],
              ["Total Carbohydrate 37g", "13%"],
              ["  Dietary Fiber 4g", "14%"],
              ["  Total Sugars 12g", ""],
              ["    Includes 10g Added Sugars", "20%"],
              ["Protein 5g", ""],
            ]
          : [
              ["Total Fat 1.5g", "2%"],
              ["  Saturated Fat 0g", "0%"],
              ["  Trans Fat 0g", ""],
              ["Cholesterol 0mg", "0%"],
              ["Sodium 480mg", "21%"],
              ["Total Carbohydrate 16g", "6%"],
              ["  Dietary Fiber 3g", "11%"],
              ["  Total Sugars 2g", ""],
              ["Protein 4g", ""],
            ];

      let y = 270;
      for (const [name, dv] of items) {
        ctx.font = name.startsWith("  ") ? "14px sans-serif" : "bold 14px sans-serif";
        ctx.fillText(name, 30, y);
        if (dv) {
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(dv, 510, y);
        }
        ctx.fillRect(30, y + 6, 540, 1);
        y += 28;
      }

      ctx.fillRect(30, y + 5, 540, 5);
      y += 30;

      ctx.font = "bold 14px sans-serif";
      ctx.fillText("INGREDIENTS:", 30, y);
      ctx.font = "13px sans-serif";
      const ingredientsText =
        sampleType === "granola"
          ? "Whole Grain Rolled Oats, Cane Sugar, Canola Oil, Crisp Rice, Almonds, Honey, Sea Salt, Natural Vanilla Flavor."
          : "Filtered Water, Organic Carrots, Organic Tomatoes, Organic Celery, Organic Peas, Organic Green Beans, Sea Salt, Organic Spices.";

      const words = ingredientsText.split(" ");
      let line = "";
      y += 20;
      for (const w of words) {
        if (ctx.measureText(line + w).width > 530) {
          ctx.fillText(line, 30, y);
          line = w + " ";
          y += 18;
        } else {
          line += w + " ";
        }
      }
      if (line) ctx.fillText(line, 30, y);

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File(
            [blob],
            sampleType === "granola" ? "sample-granola-label.jpg" : "sample-soup-label.jpg",
            { type: "image/jpeg" }
          );
          handleImageSelected(sampleFile);
        }
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Failed to generate sample image", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* State: IDLE - Upload Area */}
      {appState === "idle" && (
        <div className="space-y-6">
          <UploadArea onImageSelected={handleImageSelected} />

          {/* Quick Sample Selector for immediate evaluation */}
          <div className="border border-subtle bg-surface rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-secondary">
              <span className="font-medium text-primary">{t.upload.sampleHighlight}</span> {t.upload.samplePrompt}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="sample-granola-btn"
                onClick={() => loadSampleLabel("granola")}
                aria-label={t.upload.sampleGranola}
                className="px-2.5 py-1 text-xs font-medium text-primary bg-background hover:bg-subtle border border-subtle rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                {t.upload.sampleGranola}
              </button>
              <button
                type="button"
                id="sample-soup-btn"
                onClick={() => loadSampleLabel("soup")}
                aria-label={t.upload.sampleSoup}
                className="px-2.5 py-1 text-xs font-medium text-primary bg-background hover:bg-subtle border border-subtle rounded transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                {t.upload.sampleSoup}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State: READY - Preview with confirmation action */}
      {appState === "ready" && selectedFile && (
        <ImagePreview
          file={selectedFile}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
          isProcessing={false}
        />
      )}

      {/* State: PROCESSING - Honest loading feedback */}
      {appState === "processing" && (
        <OcrStatus
          message={progress.message}
          progress={progress.progress}
        />
      )}

      {/* State: SUCCESS - Structured results UI with collapsed raw text */}
      {appState === "success" && ocrResult && nutrition && ingredients && selectedFile && (
        <div className="space-y-6">
          <StructuredResultsView
            ocrResult={ocrResult}
            nutrition={nutrition}
            ingredientsData={ingredients}
            summaryTags={summaryTags}
            explanationStatus={explanationStatus}
            explanationData={explanationData}
            explanationError={explanationError}
            onRetryExplanation={handleRetryExplanation}
            onReset={handleReset}
            onReanalyze={() => {
              if (activeImageSource) {
                handleAnalyze(activeImageSource);
              }
            }}
          />

          {/* Collapsible reference to scanned photo */}
          <div className="border border-subtle bg-surface rounded-md p-4">
            <details className="group">
              <summary
                aria-label={t.results.viewScannedPhoto(selectedFile.name)}
                className="text-xs font-medium text-secondary hover:text-primary cursor-pointer select-none list-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
              >
                <span>{t.results.viewScannedPhoto(selectedFile.name)}</span>
                <span className="text-[10px] text-secondary group-open:rotate-180 transition-transform" aria-hidden="true">▼</span>
              </summary>
              <div className="mt-3 pt-3 border-t border-subtle flex justify-center bg-background p-2 rounded">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Scanned source food package label"
                  className="max-h-[300px] object-contain rounded-sm"
                />
              </div>
            </details>
          </div>
        </div>
      )}

      {/* State: ERROR - Plain actionable message with retry */}
      {appState === "error" && (
        <ErrorMessage
          message={errorText || t.error.fallbackError}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Play, Sliders, CheckCircle } from "lucide-react";
import { preprocessImage } from "@/lib/preprocess";

interface ImagePreviewProps {
  file: File;
  onAnalyze: (processedImageSource: string | Blob) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export function ImagePreview({
  file,
  onAnalyze,
  onReset,
  isProcessing,
}: ImagePreviewProps) {
  const [rawUrl, setRawUrl] = useState<string>("");
  const [preprocessedUrl, setPreprocessedUrl] = useState<string | null>(null);
  const [preprocessedBlob, setPreprocessedBlob] = useState<Blob | null>(null);
  const [usePreprocessing, setUsePreprocessing] = useState<boolean>(true);
  const [isPreprocessingActive, setIsPreprocessingActive] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<"original" | "preprocessed">("original");

  // Generate object URL for raw file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setRawUrl(url);

    // Run preprocessing in background for quick toggle and ready OCR
    let isCancelled = false;
    setIsPreprocessingActive(true);

    preprocessImage(file)
      .then((res) => {
        if (!isCancelled) {
          setPreprocessedUrl(res.dataUrl);
          setPreprocessedBlob(res.blob);
          setIsPreprocessingActive(false);
        }
      })
      .catch((err) => {
        console.warn("Preprocessing warning:", err);
        if (!isCancelled) {
          setIsPreprocessingActive(false);
        }
      });

    return () => {
      isCancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyzeClick = () => {
    if (usePreprocessing && preprocessedBlob) {
      onAnalyze(preprocessedBlob);
    } else {
      onAnalyze(rawUrl);
    }
  };

  const currentDisplayUrl =
    previewMode === "preprocessed" && preprocessedUrl
      ? preprocessedUrl
      : rawUrl;

  return (
    <div className="w-full bg-surface border border-subtle rounded-md p-5 space-y-5">
      {/* Header bar of preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-subtle gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-primary truncate">
            {file.name}
          </h2>
          <p className="text-xs text-secondary">
            {formatFileSize(file.size)} • {file.type || "image"}
          </p>
        </div>

        <button
          type="button"
          id="upload-different-btn"
          onClick={onReset}
          disabled={isProcessing}
          className="text-xs text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto py-1 px-2 border border-subtle rounded bg-background hover:bg-subtle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Upload different image</span>
        </button>
      </div>

      {/* Contained Image Frame */}
      <div className="relative bg-background border border-subtle rounded flex items-center justify-center p-3 min-h-[260px] max-h-[420px] overflow-hidden">
        {currentDisplayUrl ? (
          // Standard img element for exact pixel fidelity and aspect ratio handling
          <img
            src={currentDisplayUrl}
            alt="Selected food label"
            className="max-h-[390px] w-auto max-w-full object-contain rounded-sm"
          />
        ) : (
          <div className="text-xs text-secondary">Loading preview…</div>
        )}

        {/* Mode switcher overlay if preprocessed image is ready */}
        {preprocessedUrl && (
          <div className="absolute top-3 right-3 bg-surface/95 border border-subtle rounded text-xs flex shadow-xs">
            <button
              type="button"
              onClick={() => setPreviewMode("original")}
              className={`px-2.5 py-1 transition-colors ${
                previewMode === "original"
                  ? "font-medium text-primary bg-subtle/50"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Original
            </button>
            <div className="w-[1px] bg-subtle" />
            <button
              type="button"
              onClick={() => setPreviewMode("preprocessed")}
              className={`px-2.5 py-1 transition-colors ${
                previewMode === "preprocessed"
                  ? "font-medium text-primary bg-subtle/50"
                  : "text-secondary hover:text-primary"
              }`}
            >
              Enhanced (OCR view)
            </button>
          </div>
        )}
      </div>

      {/* Preprocessing toggle & details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-background p-3 rounded border border-subtle">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={usePreprocessing}
            onChange={(e) => setUsePreprocessing(e.target.checked)}
            disabled={isProcessing || isPreprocessingActive}
            className="rounded border-subtle text-accent focus:ring-accent accent-accent"
          />
          <span className="font-medium text-primary">
            Apply contrast optimization before OCR
          </span>
        </label>
        <span className="text-secondary">
          Converts to grayscale & stretches dynamic range for crisper label text
        </span>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          id="analyze-label-btn"
          onClick={handleAnalyzeClick}
          disabled={isProcessing || isPreprocessingActive}
          className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active disabled:opacity-50 disabled:pointer-events-none rounded transition-colors inline-flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Analyze Label</span>
        </button>
      </div>
    </div>
  );
}

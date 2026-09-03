import { createWorker, Worker, RecognizeResult } from "tesseract.js";

export interface OcrProgress {
  status: string; // e.g. "loading tesseract core", "recognizing text"
  progress: number; // 0 to 1
  message: string;
}

export interface OcrResult {
  text: string;
  confidence: number;
  lines: string[];
}

export type ProgressCallback = (progress: OcrProgress) => void;

/**
 * Formats raw Tesseract status strings into plain, honest user-friendly messages
 */
function formatStatusMessage(status: string, progress: number): string {
  const percent = Math.round(progress * 100);
  switch (status) {
    case "loading tesseract core":
      return "Loading OCR engine…";
    case "initializing tesseract":
      return "Initializing OCR engine…";
    case "initialized tesseract":
      return "Engine ready…";
    case "loading language traineddata":
      return `Loading language data… (${percent}%)`;
    case "loaded language traineddata":
      return "Language data loaded…";
    case "initializing api":
      return "Preparing text recognition…";
    case "recognizing text":
      return `Reading label… (${percent}%)`;
    default:
      if (progress > 0 && progress < 1) {
        return `Processing… (${percent}%)`;
      }
      return "Reading label…";
  }
}

/**
 * Runs client-side OCR on the provided image source using a Tesseract Web Worker.
 */
export async function performOcr(
  imageSource: string | Blob | HTMLCanvasElement,
  onProgress?: ProgressCallback
): Promise<OcrResult> {
  let worker: Worker | null = null;

  try {
    worker = await createWorker("eng", 1, {
      logger: (message) => {
        if (onProgress && message) {
          const userMessage = formatStatusMessage(
            message.status || "",
            message.progress || 0
          );
          onProgress({
            status: message.status || "processing",
            progress: message.progress || 0,
            message: userMessage,
          });
        }
      },
    });

    const result: RecognizeResult = await worker.recognize(imageSource);
    const text = result.data.text ? result.data.text.trim() : "";
    const confidence = result.data.confidence ?? 0;

    // Filter lines into clean array
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (!text || text.length === 0) {
      throw new Error(
        "No text could be detected on this label. Please try taking a clearer photo with better lighting or closer to the text."
      );
    }

    return {
      text,
      confidence,
      lines,
    };
  } catch (error: any) {
    // Re-throw with clean friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || "An unexpected error occurred while reading the label.");
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore termination errors
      }
    }
  }
}

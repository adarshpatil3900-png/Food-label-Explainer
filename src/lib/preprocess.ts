/**
 * Image preprocessing utility to improve OCR accuracy on food labels.
 * Performs grayscale conversion, contrast stretching, and noise reduction.
 */

export interface PreprocessOptions {
  contrastFactor?: number; // 1.0 = standard contrast boost
  denoise?: boolean;
}

/**
 * Loads an image from a File or Object URL into an HTMLImageElement
 */
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image for processing: " + err));

    if (typeof src === "string") {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
}

/**
 * Preprocesses an image on a canvas for OCR.
 * - Scales to optimal OCR resolution if too small/large
 * - Converts to grayscale (luminance formula)
 * - Applies contrast stretching to make text stark against background packaging
 */
export async function preprocessImage(
  imageSource: string | File,
  options: PreprocessOptions = {}
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  const img = await loadImage(imageSource);

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Food label OCR works best with text at roughly 300 DPI (approx 1500-2400px on long edge)
  const maxDimension = 2400;
  const minDimension = 800;

  let scale = 1;
  if (Math.max(width, height) > maxDimension) {
    scale = maxDimension / Math.max(width, height);
  } else if (Math.min(width, height) < minDimension && Math.max(width, height) < 1200) {
    // Upscale small cropped labels to ensure text strokes are thick enough for Tesseract
    scale = Math.min(2, 1200 / Math.max(width, height));
  }

  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not initialize 2D canvas context");
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Get pixel data for manipulation
  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imageData.data;
  const len = data.length;

  // Step 1: Grayscale conversion and compute luminance histogram
  const gray = new Uint8ClampedArray(targetWidth * targetHeight);
  const histogram = new Uint32Array(256);

  for (let i = 0, j = 0; i < len; i += 4, j++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard perceptual luminance formula
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray[j] = luma;
    histogram[luma]++;
  }

  // Step 2: Determine contrast stretch bounds (2nd percentile and 98th percentile to eliminate noise)
  const totalPixels = targetWidth * targetHeight;
  const lowerThreshold = Math.floor(totalPixels * 0.02);
  const upperThreshold = Math.floor(totalPixels * 0.98);

  let acc = 0;
  let minLuma = 0;
  let maxLuma = 255;

  for (let i = 0; i < 256; i++) {
    acc += histogram[i];
    if (acc >= lowerThreshold && minLuma === 0) {
      minLuma = i;
    }
    if (acc >= upperThreshold) {
      maxLuma = i;
      break;
    }
  }

  if (maxLuma <= minLuma) {
    minLuma = 0;
    maxLuma = 255;
  }

  const lumaRange = maxLuma - minLuma;

  // Step 3: Apply contrast boost and write back to image data
  for (let i = 0, j = 0; i < len; i += 4, j++) {
    let val = gray[j];

    // Contrast stretch to [0, 255]
    val = Math.round(((val - minLuma) / lumaRange) * 255);
    if (val < 0) val = 0;
    if (val > 255) val = 255;

    // Slight curve adjustment to make dark text crisper against light background
    // If predominantly light background (typical nutrition table), enhance dark text
    if (val < 140) {
      val = Math.round(val * 0.85); // darken dark text
    } else {
      val = Math.min(255, Math.round(val * 1.05)); // brighten background
    }

    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    // data[i + 3] (alpha) remains unchanged
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export preprocessed canvas to blob"));
          return;
        }
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve({
          dataUrl,
          blob,
          width: targetWidth,
          height: targetHeight,
        });
      },
      "image/jpeg",
      0.92
    );
  });
}

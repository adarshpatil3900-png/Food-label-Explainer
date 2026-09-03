"use client";

import React, { useRef, useState } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";

interface UploadAreaProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadArea({ onImageSelected, disabled = false }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        id="file-upload-input"
        aria-label="Upload image file"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        id="camera-capture-input"
        aria-label="Capture photo with camera"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Drag & Drop Main Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label="File dropzone"
        className={`border-2 border-dashed rounded-md p-8 sm:p-12 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent-light"
            : "border-subtle bg-surface hover:border-secondary"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="max-w-sm mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded border border-subtle bg-background flex items-center justify-center text-secondary mb-4">
            <Upload className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
          </div>

          <h2 className="text-base font-medium text-primary mb-1">
            Upload food packaging label
          </h2>
          <p className="text-sm text-secondary mb-6">
            Drag and drop an image file here, or choose an option below
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="choose-file-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Choose image file from your device"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover active:bg-accent-active rounded transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <ImageIcon className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Choose Image</span>
            </button>

            <button
              type="button"
              id="take-photo-btn"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              aria-label="Take photo with camera"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary bg-surface hover:bg-background active:bg-subtle border border-subtle rounded transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <Camera className="w-4 h-4 text-secondary" strokeWidth={1.75} aria-hidden="true" />
              <span>Take Photo</span>
            </button>
          </div>

          <p className="text-xs text-secondary mt-5">
            Supports JPG, PNG, WEBP, HEIC. All processing runs locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

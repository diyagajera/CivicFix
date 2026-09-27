"use client";

import { useCallback, useRef, useState } from "react";

const DEMO_IMAGES = [
  { file: "pothole.jpg", label: "Pothole" },
  { file: "streetlight.jpg", label: "Streetlight" },
  { file: "sidewalk.jpg", label: "Sidewalk" },
  { file: "trash.jpg", label: "Trash" },
];

interface ImageUploadProps {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUpload({ onSelect, disabled }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file && file.type.startsWith("image/")) {
        onSelect(file);
      }
    },
    [onSelect]
  );

  const handleDemoClick = useCallback(
    async (filename: string) => {
      try {
        const res = await fetch(`/demo_images/${filename}`);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
        onSelect(file);
      } catch {
        // Demo image missing from public/demo_images - silently ignore so a
        // missing sample photo never breaks the live-upload path.
      }
    },
    [onSelect]
  );

  return (
    <div>
      <div
        className={`cut-corners flex min-h-[320px] flex-col items-center justify-center border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver ? "border-signal bg-signal/5" : "border-paint bg-concrete-dim"
        } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="font-display text-xl font-700">Drop a photo here</p>
        <p className="mt-2 text-sm text-asphalt/60">
          or tap to upload — JPEG, PNG, or WebP
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm text-asphalt/60">No photo handy? Try a sample:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_IMAGES.map((demo) => (
            <button
              key={demo.file}
              type="button"
              disabled={disabled}
              onClick={() => handleDemoClick(demo.file)}
              className="border border-paint px-4 py-2 text-sm font-medium transition-colors hover:border-asphalt disabled:opacity-50"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import AnalysisCard from "@/components/AnalysisCard";
import { analyzeImage, ApiError } from "@/lib/api";
import type { CivicAnalysis } from "@/lib/types";

type FlowStatus = "idle" | "ready" | "analyzing" | "done" | "error";

export default function ReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<FlowStatus>("idle");
  const [analysis, setAnalysis] = useState<CivicAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSelect(selected: File) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setStatus("ready");
    setAnalysis(null);
    setErrorMessage(null);
  }

  async function handleAnalyze() {
    if (!file) return;
    setStatus("analyzing");
    setErrorMessage(null);
    try {
      const result = await analyzeImage(file);
      setAnalysis(result.analysis);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12 md:py-16">
      <Link href="/" className="text-sm text-asphalt/50 hover:text-asphalt">
        ← CivicFix
      </Link>
      <h1 className="mt-4 font-display text-3xl font-800 md:text-4xl">Report an Issue</h1>
      <p className="mt-2 max-w-xl text-asphalt/70">
        Upload a photo and CivicFix will identify the problem and its severity.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          {previewUrl ? (
            <div>
              <div className="cut-corners overflow-hidden border-2 border-paint bg-concrete-dim">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Uploaded issue preview"
                  className="max-h-[420px] w-full object-cover"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={status === "analyzing"}
                  className="bg-signal px-6 py-3 font-display font-700 text-concrete transition-colors hover:bg-asphalt disabled:opacity-50"
                >
                  {status === "analyzing" ? "Analyzing…" : "Analyze Issue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setStatus("idle");
                    setAnalysis(null);
                  }}
                  disabled={status === "analyzing"}
                  className="border border-paint px-6 py-3 text-sm font-medium hover:border-asphalt disabled:opacity-50"
                >
                  Choose another photo
                </button>
              </div>
            </div>
          ) : (
            <ImageUpload onSelect={handleSelect} />
          )}
        </div>

        <div>
          {status === "idle" || status === "ready" ? (
            <div className="flex h-full min-h-[320px] items-center justify-center border border-dashed border-paint p-8 text-center">
              <p className="text-sm text-asphalt/40">
                Analysis results will appear here once you upload a photo.
              </p>
            </div>
          ) : (
            <AnalysisCard
              status={status}
              analysis={analysis}
              errorMessage={errorMessage}
              onRetry={handleAnalyze}
            />
          )}
        </div>
      </div>
    </main>
  );
}

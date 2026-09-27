"use client";

import { useEffect, useState } from "react";
import type { CivicAnalysis } from "@/lib/types";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "@/lib/types";

type Step = { id: string; label: string };

const STEPS: Step[] = [
  { id: "identify", label: "Identifying the issue" },
  { id: "severity", label: "Estimating severity" },
];

const SEVERITY_STYLES: Record<CivicAnalysis["severity"], string> = {
  high: "bg-signal text-concrete",
  medium: "bg-curb text-asphalt",
  low: "bg-route text-concrete",
};

interface AnalysisCardProps {
  status: "analyzing" | "done" | "error";
  analysis: CivicAnalysis | null;
  errorMessage: string | null;
  onRetry: () => void;
}

export default function AnalysisCard({
  status,
  analysis,
  errorMessage,
  onRetry,
}: AnalysisCardProps) {
  const [completedSteps, setCompletedSteps] = useState(0);

  // Cosmetic pacing only - reveals steps one at a time while the single
  // Gemini call is in flight, then snaps to fully-complete the moment the
  // real response lands. Never claims a step is done before status "done".
  useEffect(() => {
    if (status !== "analyzing") {
      setCompletedSteps(status === "done" ? STEPS.length : 0);
      return;
    }
    setCompletedSteps(0);
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setCompletedSteps((c) => Math.max(c, i + 1)), (i + 1) * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, [status]);

  if (status === "error") {
    return (
      <div className="border border-paint bg-concrete-dim p-8">
        <p className="font-display text-lg font-700">Analysis failed</p>
        <p className="mt-2 text-sm text-asphalt/70">{errorMessage}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border border-asphalt px-5 py-2 text-sm font-medium hover:bg-asphalt hover:text-concrete"
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === "analyzing" || !analysis) {
    return (
      <div className="border border-paint bg-concrete-dim p-8">
        <p className="font-display text-lg font-700">Analyzing photo</p>
        <ul className="mt-5 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${
                  i < completedSteps
                    ? "border-route bg-route text-concrete"
                    : "border-paint text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={i < completedSteps ? "text-asphalt" : "text-asphalt/40"}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="border border-paint bg-concrete-dim p-8">
      <div className="flex items-center justify-between border-b border-paint pb-4">
        <h2 className="font-display text-2xl font-700">
          {CATEGORY_LABELS[analysis.category]}
        </h2>
        <span
          className={`px-3 py-1 font-mono text-xs font-medium uppercase ${SEVERITY_STYLES[analysis.severity]}`}
        >
          {SEVERITY_LABELS[analysis.severity]}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-b border-paint pb-5 font-mono text-sm">
        <div>
          <dt className="text-asphalt/50">Confidence</dt>
          <dd className="mt-1">{Math.round(analysis.confidence * 100)}%</dd>
        </div>
        <div>
          <dt className="text-asphalt/50">Estimated size</dt>
          <dd className="mt-1">
            {analysis.estimated_size_meters != null
              ? `~${analysis.estimated_size_meters} m`
              : "Not determinable"}
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-sm leading-relaxed text-asphalt/80">{analysis.description}</p>

      {analysis.evidence.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-asphalt/50">Visible evidence</p>
          <ul className="mt-2 space-y-1">
            {analysis.evidence.map((item, i) => (
              <li key={i} className="text-sm text-asphalt/80">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 border-t border-paint pt-4 text-xs text-asphalt/40">
        Department routing and location arrive in the next step of the workflow.
      </p>
    </div>
  );
}

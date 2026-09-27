import type { AnalyzeResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Uploads an image to POST /api/analyze and returns Gemini's structured
 * analysis. Throws ApiError with the backend's own message on failure -
 * the backend already writes user-facing copy (see main.py), so callers
 * can show err.message directly.
 */
export async function analyzeImage(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the CivicFix server. Check your connection and try again.",
      0
    );
  }

  if (!response.ok) {
    let detail = "AI analysis temporarily unavailable.";
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response wasn't JSON - keep the default message
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

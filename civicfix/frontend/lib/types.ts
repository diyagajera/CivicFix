// Mirrors backend/schemas.py field-for-field. Keep these in sync manually -
// if you add a field on one side, add it here (or vice versa) immediately.

export type IssueCategory =
  | "pothole"
  | "streetlight"
  | "sidewalk"
  | "overflowing_trash"
  | "traffic_sign"
  | "fallen_tree"
  | "other";

export type Severity = "low" | "medium" | "high";

export type ReportStatus = "submitted" | "assigned" | "in_progress" | "resolved";

export interface CivicAnalysis {
  category: IssueCategory;
  confidence: number;
  severity: Severity;
  description: string;
  estimated_size_meters: number | null;
  evidence: string[];
}

export interface CivicRouting {
  department: string;
  service: string;
  required_fields: string[];
  priority_notes: string | null;
}

export interface AnalyzeResponse {
  analysis: CivicAnalysis;
  routing: CivicRouting | null;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: "Pothole",
  streetlight: "Streetlight",
  sidewalk: "Sidewalk",
  overflowing_trash: "Overflowing Trash",
  traffic_sign: "Traffic Sign",
  fallen_tree: "Fallen Tree",
  other: "Other Issue",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

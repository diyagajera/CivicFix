"""
Shared data models for CivicFix.

These are the single source of truth for what shape data takes as it
moves between Gemini, the backend, and the frontend. The frontend's
lib/types.ts should mirror these field-for-field.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class IssueCategory(str, Enum):
    POTHOLE = "pothole"
    STREETLIGHT = "streetlight"
    SIDEWALK = "sidewalk"
    OVERFLOWING_TRASH = "overflowing_trash"
    TRAFFIC_SIGN = "traffic_sign"
    FALLEN_TREE = "fallen_tree"
    OTHER = "other"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReportStatus(str, Enum):
    SUBMITTED = "submitted"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


# ---------------------------------------------------------------------------
# Gemini Vision output (this is what we hand to Gemini as response_schema)
# ---------------------------------------------------------------------------

class CivicAnalysis(BaseModel):
    """
    Structured output we require from Gemini's image analysis.
    This exact shape is passed as the response_schema for the Gemini call,
    so Gemini is constrained to return JSON matching this model.
    """
    category: IssueCategory
    confidence: float = Field(ge=0.0, le=1.0)
    severity: Severity
    description: str
    estimated_size_meters: Optional[float] = None
    evidence: list[str] = Field(default_factory=list)

    @field_validator("estimated_size_meters")
    @classmethod
    def reject_absurd_sizes(cls, v: Optional[float]) -> Optional[float]:
        # Backend-side sanity check - never trust the model blindly.
        # A civic issue larger than ~100m in any single dimension is not
        # a plausible single-report size; treat it as "couldn't estimate".
        if v is not None and (v <= 0 or v > 100):
            return None
        return v


# ---------------------------------------------------------------------------
# RAG output
# ---------------------------------------------------------------------------

class CivicRouting(BaseModel):
    department: str
    service: str
    required_fields: list[str] = Field(default_factory=list)
    priority_notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Location
# ---------------------------------------------------------------------------

class Location(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None


# ---------------------------------------------------------------------------
# API request/response bodies
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    """Sent as multipart/form-data alongside the image file in practice;
    this model documents the JSON-able fields when the image is base64."""
    image_base64: Optional[str] = None
    image_mime_type: Optional[str] = "image/jpeg"


class AnalyzeResponse(BaseModel):
    analysis: CivicAnalysis
    routing: Optional[CivicRouting] = None


class ReportDraft(BaseModel):
    """The editable draft shown to the user before submission."""
    category: IssueCategory
    severity: Severity
    description: str
    estimated_size_meters: Optional[float] = None
    evidence: list[str] = Field(default_factory=list)
    location: Location
    department: str
    service: str


class DuplicateMatch(BaseModel):
    ticket_id: str
    distance_meters: float
    reported_at: datetime
    category: IssueCategory


class DuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    matches: list[DuplicateMatch] = Field(default_factory=list)


class CreateReportRequest(BaseModel):
    category: IssueCategory
    severity: Severity
    description: str
    estimated_size_meters: Optional[float] = None
    evidence: list[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    address: Optional[str] = None
    department: str
    service: str
    image_url: Optional[str] = None
    # Set when the user chose "Add Evidence" on a duplicate instead of
    # filing a brand-new report.
    linked_duplicate_ticket_id: Optional[str] = None


class CreateReportResponse(BaseModel):
    ticket_id: str
    status: ReportStatus
    department: str


class ReportRecord(BaseModel):
    id: str
    ticket_id: str
    category: IssueCategory
    severity: Severity
    description: str
    estimated_size_meters: Optional[float] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    department: str
    service: str
    status: ReportStatus
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StatusHistoryEntry(BaseModel):
    status: ReportStatus
    timestamp: datetime
    note: Optional[str] = None


class ReportDetail(ReportRecord):
    status_history: list[StatusHistoryEntry] = Field(default_factory=list)

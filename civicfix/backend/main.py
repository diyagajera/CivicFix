"""
CivicFix backend entrypoint.

Step 1 scope: image upload -> Gemini vision analysis -> validated JSON back
to the frontend. RAG-based department routing, duplicate detection, and
report persistence land in the next steps (see rag.py, duplicate.py,
reports.py placeholders below) - wiring them into these routes is what
Step 2 will do.
"""

import logging

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from schemas import AnalyzeResponse
from vision import analyze_image, VisionAnalysisError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CivicFix API")

# Wide open for local hackathon dev. Tighten this to the deployed frontend
# origin before sharing a public link.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(image: UploadFile = File(...)) -> AnalyzeResponse:
    """
    Accepts an uploaded image, returns Gemini's structured civic analysis.

    Department/service routing (RAG) is added to this response in Step 2 -
    for now `routing` will always come back null.
    """
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Please upload a JPEG, PNG, or WebP.",
        )

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image is too large. Please upload a file under 10MB.",
        )

    try:
        analysis = analyze_image(image_bytes, mime_type=image.content_type)
    except VisionAnalysisError as exc:
        # Distinguish "AI unavailable" from "not a recognizable issue" by
        # message content set in vision.py; both are safe to surface as-is.
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return AnalyzeResponse(analysis=analysis, routing=None)

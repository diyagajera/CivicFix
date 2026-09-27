"""
Image -> structured CivicAnalysis.

This is the only place in the codebase that sends an image to Gemini for
classification. It is deliberately narrow: one function in, one validated
Pydantic object out. Callers never see the raw Gemini response.
"""

import json
import logging

from google.genai import types
from pydantic import ValidationError

from gemini import get_client, GEMINI_MODEL
from schemas import CivicAnalysis

logger = logging.getLogger(__name__)


SYSTEM_INSTRUCTION = """\
You are CivicFix's civic infrastructure image-analysis assistant.

Analyze the provided image and determine whether it contains a public
infrastructure or civic issue.

Allowed categories:
- pothole
- streetlight
- sidewalk
- overflowing_trash
- traffic_sign
- fallen_tree
- other

Determine:
1. category
2. confidence from 0 to 1
3. severity: low, medium, or high
4. a concise, factual description (1-3 sentences)
5. estimated size in meters, ONLY if reasonably visible in the frame \
(otherwise return null - never guess)
6. a short list of visible evidence supporting the classification

Rules:
- Do not invent measurements or facts that cannot be supported by the image.
- If the image does not clearly show a civic issue, classify it as "other" \
and explain why in the description.
- Base severity on visible safety/impact indicators (e.g. a pothole \
blocking a traffic lane is higher severity than a small crack).
- Return only the requested structured output.
"""


class VisionAnalysisError(Exception):
    """Raised when Gemini's response can't be turned into a valid CivicAnalysis."""


def analyze_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> CivicAnalysis:
    """
    Send an image to Gemini and return a validated CivicAnalysis.

    Raises VisionAnalysisError if Gemini fails, times out, or returns
    something that doesn't validate against the schema - callers should
    catch this and show the user a friendly "please try another photo"
    message rather than letting it propagate as a 500.
    """
    client = get_client()

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                "Analyze this image for a civic issue report.",
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=CivicAnalysis,
            ),
        )
    except Exception as exc:  # network/auth/quota errors from the SDK
        logger.exception("Gemini vision call failed")
        raise VisionAnalysisError("AI analysis temporarily unavailable.") from exc

    # Prefer the SDK's typed `.parsed` when available; fall back to manual
    # JSON parsing so we're resilient to SDK version differences.
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, CivicAnalysis):
        return parsed

    raw_text = getattr(response, "text", None)
    if not raw_text:
        raise VisionAnalysisError("AI analysis returned an empty response.")

    try:
        data = json.loads(raw_text)
        return CivicAnalysis.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("Gemini returned unparseable/invalid analysis: %s", raw_text)
        raise VisionAnalysisError(
            "This image doesn't appear to contain a recognizable civic issue."
        ) from exc

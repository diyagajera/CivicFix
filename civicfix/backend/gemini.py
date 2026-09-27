"""
Single place where the Gemini client is configured.

Everything else (vision.py, rag.py, agent.py) imports `get_client()` and
`GEMINI_MODEL` from here rather than constructing its own client, so there
is exactly one spot to change if the SDK setup ever needs to change.
"""

import os
from functools import lru_cache

from google import genai

# Default to the "latest flash" alias so we always ride Google's current
# recommended flash model instead of hard-coding a version that will be
# deprecated later. Override via env var if a specific pinned model is
# ever needed (e.g. for reproducibility during grading/demo).
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")


@lru_cache(maxsize=1)
def get_client() -> genai.Client:
    """
    Returns a cached Gemini client.

    Reads GEMINI_API_KEY from the environment. Raises early and loudly if
    it's missing, rather than letting every downstream call fail with a
    confusing auth error.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Copy backend/.env.example to "
            "backend/.env and fill in your key."
        )
    return genai.Client(api_key=api_key)

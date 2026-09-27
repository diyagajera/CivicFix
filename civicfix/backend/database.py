"""
Supabase client setup.

Kept minimal for Step 1 - just the client getter. reports.py (built in the
next step) will use this for actual CRUD against the `reports` and
`status_history` tables.
"""

import os
from functools import lru_cache

from supabase import create_client, Client


@lru_cache(maxsize=1)
def get_db() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Copy "
            "backend/.env.example to backend/.env and fill them in."
        )
    return create_client(url, key)

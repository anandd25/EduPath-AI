"""Supabase access-token verification for the EduPath API.

The API validates the bearer token against Supabase Auth's /auth/v1/user endpoint.
It does not trust user IDs supplied by the browser.
"""
import os
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer(auto_error=False)


def _supabase_config() -> tuple[str, str]:
    # SUPABASE_URL and SUPABASE_ANON_KEY match the existing deployment variable names.
    url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    if not url or not anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Backend Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY on the backend.",
        )
    return url, anon_key


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    """Return the Supabase user after server-side token validation."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in is required to access student profiles.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    supabase_url, anon_key = _supabase_config()
    try:
        response = httpx.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {credentials.credentials}",
                "Accept": "application/json",
            },
            timeout=8.0,
        )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify the Supabase session. Please try again.",
        )

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase could not verify the session right now.",
        )

    try:
        user = response.json()
    except ValueError:
        user = None
    if not isinstance(user, dict) or not isinstance(user.get("id"), str):
        raise HTTPException(status_code=401, detail="Supabase returned an invalid user session.")
    return user

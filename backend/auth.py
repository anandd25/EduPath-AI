
"""Supabase access-token verification for the EduPath API."""

import logging
import os
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)
bearer_scheme = HTTPBearer(auto_error=False)


def _supabase_config() -> tuple[str, str]:
    url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()

    if not url or not anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase authentication is not configured.",
        )

    return url, anon_key


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    """Validate the bearer token against Supabase Auth."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in is required.",
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
            timeout=httpx.Timeout(8.0, connect=3.0),
        )
    except httpx.TimeoutException as exc:
        logger.warning("Supabase authentication request timed out")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service timed out. Please try again.",
        ) from exc
    except httpx.HTTPError as exc:
        logger.warning("Supabase authentication service is unavailable")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify the session. Please try again.",
        ) from exc

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session is invalid or expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if response.status_code != 200:
        logger.warning(
            "Supabase Auth returned unexpected status %s",
            response.status_code,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is temporarily unavailable.",
        )

    try:
        user = response.json()
    except ValueError as exc:
        logger.warning("Supabase Auth returned invalid JSON")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service returned an invalid response.",
        ) from exc

    if (
        not isinstance(user, dict)
        or not isinstance(user.get("id"), str)
        or not user["id"].strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The authenticated user response is invalid.",
        )

    return user

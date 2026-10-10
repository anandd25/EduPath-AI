
import os
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from tavily import TavilyClient

router = APIRouter(prefix="/api/research", tags=["Research"])

ALLOWED_SCHEMES = {"http", "https"}
MAX_QUERY_LENGTH = 300
MAX_CONTENT_LENGTH = 6000
MAX_TITLE_LENGTH = 300


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=MAX_QUERY_LENGTH)
    max_results: int = Field(default=5, ge=1, le=10)
    search_depth: str = Field(default="advanced")
    topic: str = Field(default="general")
    country: str | None = Field(default=None, max_length=100)

    @field_validator("query")
    @classmethod
    def validate_query(cls, value: str) -> str:
        value = re.sub(r"\s+", " ", value).strip()
        if len(value) < 3:
            raise ValueError("Search query must contain at least 3 characters.")
        return value

    @field_validator("search_depth")
    @classmethod
    def validate_search_depth(cls, value: str) -> str:
        if value not in {"basic", "advanced"}:
            raise ValueError("search_depth must be basic or advanced.")
        return value

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, value: str) -> str:
        if value not in {"general", "news", "finance"}:
            raise ValueError("Unsupported search topic.")
        return value

    @field_validator("country")
    @classmethod
    def normalize_country(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        return value or None


def _safe_url(value: object) -> str | None:
    if not isinstance(value, str):
        return None

    value = value.strip()
    try:
        parsed = urlparse(value)
    except ValueError:
        return None

    if parsed.scheme not in ALLOWED_SCHEMES or not parsed.hostname:
        return None

    if parsed.username or parsed.password:
        return None

    return value


def _clean_text(value: object, limit: int) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip()[:limit]


def _normalize_result(item: dict) -> dict | None:
    url = _safe_url(item.get("url"))
    if not url:
        return None

    raw_score = item.get("score")
    score = None
    if isinstance(raw_score, (int, float)) and not isinstance(raw_score, bool):
        if 0 <= raw_score <= 1:
            score = float(raw_score)

    published_date = (
        item.get("published_date")
        or item.get("published")
        or item.get("date")
    )
    if not isinstance(published_date, str):
        published_date = None

    return {
        "title": _clean_text(item.get("title") or "Untitled resource", MAX_TITLE_LENGTH),
        "url": url,
        "content": _clean_text(item.get("content"), MAX_CONTENT_LENGTH),
        "score": score,
        "published_date": published_date,
        "source_domain": urlparse(url).hostname,
        "evidence_status": "unverified",
    }


@router.post("/search")
def search_resources(request: ResearchRequest):
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Research search is not configured.",
        )

    try:
        client = TavilyClient(api_key=api_key)

        search_args = {
            "query": request.query,
            "search_depth": request.search_depth,
            "max_results": request.max_results,
            "topic": request.topic,
            "include_answer": False,
            "include_raw_content": False,
        }

        if request.country:
            search_args["country"] = request.country

        response = client.search(**search_args)

        if not isinstance(response, dict):
            raise ValueError("Unexpected research provider response.")

        results = []
        seen_urls = set()

        for item in response.get("results", []):
            if not isinstance(item, dict):
                continue

            result = _normalize_result(item)
            if not result:
                continue

            canonical_url = result["url"].rstrip("/").lower()
            if canonical_url in seen_urls:
                continue

            seen_urls.add(canonical_url)
            results.append(result)

        return {
            "query": request.query,
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "result_count": len(results),
            "results": results,
            "research_notice": (
                "Search results are research leads, not verified facts. "
                "Confirm admission rules, fees, deadlines, scholarships, "
                "and eligibility on the relevant official source before "
                "using them to mark a pathway feasible."
            ),
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve research results right now.",
        )

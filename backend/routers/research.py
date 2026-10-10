
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from tavily import TavilyClient

router = APIRouter(prefix="/api/research", tags=["Research"])


class ResearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=300)
    max_results: int = Field(default=5, ge=1, le=10)


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
        response = client.search(
            query=request.query,
            search_depth="basic",
            max_results=request.max_results,
            topic="general",
        )

        results = []
        for item in response.get("results", []):
            url = item.get("url", "")
            if not url.startswith(("https://", "http://")):
                continue

            results.append({
                "title": item.get("title", "Untitled resource"),
                "url": url,
                "content": item.get("content", ""),
                "score": item.get("score"),
            })

        return {"query": request.query, "results": results}

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve research results right now.",
        )

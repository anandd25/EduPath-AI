"""Roadmap generation endpoint used by the EduPath frontend."""
import logging
import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from domain_schemas import GraphGenerationRequest, PathwayGraph
from generator_service import (
    GraphGenerationError,
    LLMConfigurationError,
    LLMProviderError,
    LLMResponseParsingError,
    generate_pathway_graph,
)
from graph_engine import GraphValidationError
from schemas import StudentProfileCreate, StudentProfileOut

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


class RoadmapRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_profile_snapshot: dict[str, Any]
    current_graph: dict[str, Any] | None = None
    current_node_ids_to_expand: list[str] = Field(default_factory=list)
    candidate_node_count: int = Field(default=7, ge=1, le=25)
    generation_intent: str = "continue"


def _student_name(profile: dict[str, Any]) -> str:
    return str(profile.get("preferred_name") or "Student").strip() or "Student"


def _fallback_graph(profile: dict[str, Any]) -> PathwayGraph:
    """Reliable, connected stage timeline when the optional LLM is unavailable."""
    name = _student_name(profile)
    interests = profile.get("interests") or []
    interest_description = str(profile.get("interest_description") or "").strip()
    interest_text = ", ".join(str(x) for x in interests[:4])
    if not interest_text:
        interest_text = interest_description or "your interests and strengths"
    curriculum = profile.get("curriculum") or "your current curriculum"
    region = profile.get("region") or profile.get("country") or "your region"
    stages = [
        ("class10_foundations", "education", "Class 10 foundations", f"Review your Class 10 results, identify favourite subjects, and strengthen core skills in {curriculum}.", 6),
        ("class11_12_choices", "education", "Class 11–12 subject choices", f"Compare suitable subject combinations and school options in {region}; check eligibility and keep more than one route open.", 24),
        ("career_exploration", "exploration", "Career exploration", f"Explore several directions related to {interest_text}. Speak with teachers or professionals and try small, low-risk projects before deciding.", 12),
        ("higher_education", "education", "Higher education pathway", "Compare degrees, diplomas and other recognised routes by entry requirements, total cost, scholarships, location and learning style.", 48),
        ("skills_projects", "exploration", "Skills, projects and internships", "Build practical skills, publish projects, seek mentoring and pursue suitable internships or work experience alongside study.", 24),
        ("first_professional_role", "career", "First professional role", "Prepare a portfolio and resume, practise interviews, use placement or entry-level opportunities, and evaluate roles against your priorities.", 12),
        ("professional_growth", "career", "Professional growth", f"Continue learning, grow your network and reassess goals as your experience develops, {name}.", 36),
    ]
    from domain_schemas import Node, Edge
    nodes = [Node(node_id=s[0], node_type=s[1], title=s[2], description=s[3], duration_estimate_months=s[4]) for s in stages]
    edges = [Edge(edge_id=f"progression_{i+1}", source_node_id=stages[i][0], target_node_id=stages[i+1][0], edge_type="progression") for i in range(len(stages)-1)]
    return PathwayGraph(pathway_id=f"roadmap_profile_{profile.get('id', 'new')}", nodes=nodes, edges=edges, target_outcome="A flexible pathway toward a fulfilling professional future", schema_version="1.0")


@router.post("")
def generate_roadmap(payload: RoadmapRequest):
    """Return {graph, source}; gracefully fall back to a connected stage flow."""
    profile = payload.student_profile_snapshot
    try:
        # Existing generator schemas provide validation and constrain graph structure.
        request_data: dict[str, Any] = {
            "student_profile_snapshot": profile,
            "candidate_node_count": payload.candidate_node_count,
            "generation_intent": payload.generation_intent,
        }
        if payload.current_graph is not None:
            request_data["current_graph"] = payload.current_graph
            request_data["current_node_ids_to_expand"] = payload.current_node_ids_to_expand
        request = GraphGenerationRequest.model_validate(request_data)
        graph = generate_pathway_graph(request)
        return {"graph": graph.model_dump(mode="json"), "source": "ai"}
    except (LLMConfigurationError, LLMProviderError, LLMResponseParsingError, GraphValidationError, ValueError) as exc:
        logger.warning("Roadmap AI generation unavailable; returning starter graph: %s", exc)
        graph = _fallback_graph(profile)
        return {"graph": graph.model_dump(mode="json"), "source": "fallback", "notice": "Showing a starter roadmap; configure GROQ_API_KEY to enable AI-generated pathways."}
    except Exception:
        logger.exception("Unexpected roadmap generation failure; returning starter graph")
        graph = _fallback_graph(profile)
        return {"graph": graph.model_dump(mode="json"), "source": "fallback", "notice": "Showing a starter roadmap while AI generation is unavailable."}

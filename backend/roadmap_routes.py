"""Personalized roadmap endpoint. AI graph generation is used when configured;
a deterministic stage-by-stage roadmap is returned immediately as a resilient fallback."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Any
from auth import get_current_user
from domain_schemas import GraphGenerationRequest, PathwayGraph, Node, Edge
from generator_service import generate_pathway_graph, GraphGenerationError
from graph_engine import GraphValidationError

router = APIRouter(prefix="/roadmap", tags=["Career Roadmap"])

class RoadmapRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_profile_snapshot: dict[str, Any]

def fallback_roadmap(profile: dict[str, Any]) -> PathwayGraph:
    name = profile.get("preferred_name") or "Student"
    interests = profile.get("interests") or []
    interest_text = ", ".join(str(x).replace("_", " ") for x in interests[:3]) or "your interests"
    career = "Professional career aligned with your strengths"
    description = str(profile.get("interest_description") or "").strip()
    if description:
        career = "Professional career in " + description[:90]
    stages = [
        ("class10", "Class 10 foundation", "Strengthen core subjects, note favourite subjects and build consistent study habits.", "education", 12),
        ("senior_secondary", "Class 11–12 / Senior Secondary", f"Choose a suitable stream and subjects based on {interest_text}; track prerequisites for future courses.", "education", 24),
        ("exploration", "Explore fields & careers", "Try mini-projects, career conversations, introductory courses and aptitude exploration.", "exploration", 6),
        ("undergraduate", "Undergraduate degree / diploma", "Compare accredited courses, entrance requirements, affordability and scholarships; build practical projects.", "education", 48),
        ("experience", "Internships & portfolio", "Build a portfolio, complete internships or industry projects, and practice communication and teamwork.", "certification", 12),
        ("first_role", "Entry-level professional role", "Prepare a focused CV, interview examples and role-specific skills; apply to suitable graduate opportunities.", "career", 12),
        ("growth", "Professional growth", f"Keep learning, seek mentorship and progress toward {career.lower()}.", "career", 0),
    ]
    nodes = [Node(node_id=s[0], node_type=s[3], title=s[1], description=s[2], duration_estimate_months=s[4]) for s in stages]
    edges = [Edge(edge_id=f"edge_{i}", source_node_id=stages[i][0], target_node_id=stages[i+1][0], edge_type="progression") for i in range(len(stages)-1)]
    return PathwayGraph(pathway_id="roadmap-"+str(profile.get("id","new")), nodes=nodes, edges=edges, target_outcome=career)

@router.post("")
def create_roadmap(payload: RoadmapRequest, user: dict = Depends(get_current_user)):
    snapshot = payload.student_profile_snapshot
    # This endpoint accepts the profile snapshot returned by the authenticated profile save.
    try:
        request = GraphGenerationRequest(
            student_profile_snapshot=snapshot,
            candidate_node_count=12,
            generation_intent="continue",
        )
        graph = generate_pathway_graph(request)
        return {"graph": graph.model_dump(), "source": "ai"}
    except (GraphGenerationError, GraphValidationError, ValueError, TypeError):
        graph = fallback_roadmap(snapshot)
        return {"graph": graph.model_dump(), "source": "fallback"}
    except Exception:
        # Keep profile submission useful even if an external model provider is unavailable.
        graph = fallback_roadmap(snapshot)
        return {"graph": graph.model_dump(), "source": "fallback"}

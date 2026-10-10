"""Authenticated roadmap generation and scenario-planning endpoints.

AI graph generation uses Groq when configured; a deterministic fallback is available
without a model key. Estimates are planning aids, not admission/funding guarantees.
"""
import logging
from typing import Any, Literal
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict, Field
from auth import get_current_user
from domain_schemas import GraphGenerationRequest, PathwayGraph, Node, Edge
from generator_service import generate_pathway_graph, GraphGenerationError
from graph_engine import GraphValidationError

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Roadmap & Planning"])

class RoadmapRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_profile_snapshot: dict[str, Any]
    current_graph: dict[str, Any] | None = None
    current_node_ids_to_expand: list[str] = Field(default_factory=list, max_length=50)
    candidate_node_count: int = Field(default=12, ge=1, le=25)
    generation_intent: Literal["continue", "explore_alternatives", "recover_from_blocked_route"] = "continue"


def _profile_text(profile: dict[str, Any], key: str, default: str = "") -> str:
    value = profile.get(key, default)
    return str(value).strip() if value is not None else default


def fallback_roadmap(profile: dict[str, Any]) -> PathwayGraph:
    """Create a connected, budget-first starter roadmap without claiming live facts."""
    interests = profile.get("interests") or []
    interest_text = ", ".join(str(x).replace("_", " ") for x in interests[:3]) or _profile_text(profile, "interest_description", "student interests")
    destination = _profile_text(profile, "preferred_destination", "India and international options")
    budget = profile.get("annual_budget") or {}
    currency = str(budget.get("currency") or profile.get("budget_currency") or "INR").upper()
    amount = budget.get("amount", profile.get("budget_amount"))
    budget_line = f"Budget entered: {currency} {amount} per year. Verify whether this includes tuition, living costs, travel and insurance." if amount is not None else "Annual budget is not set; ask the student to enter a realistic range before ranking affordability."
    stages = [
        ("budget_planning", "education", "Budget & pathway planning", f"{budget_line} Consider academic performance, aptitude, interests, location preferences, admission requirements and long-term career pathways. Compare options across {destination}.", 1),
        ("class10_routes", "education", "Class 10 → subject and training routes", f"Compare senior-secondary streams, vocational courses and diploma options that fit {interest_text}; check official prerequisites and preserve alternatives.", 24),
        ("career_exploration", "exploration", "Explore interests and careers", "Use projects, career conversations and introductory learning to test fit; treat aptitude and career fit as hypotheses rather than certainty.", 6),
        ("higher_education", "education", "Higher education options", "Compare institutions on tuition, living costs, duration, admission requirements, location, language, recognition and application deadlines. Verify institution-specific details from official sources.", 48),
        ("scholarships_loans", "education", "Scholarships & funding", "Check potentially relevant merit- and need-based funding. Compare loan interest/APR, fees, repayment start, tenure, collateral or co-borrower terms, EMI and total repayment.", 3),
        ("scenario_planning", "exploration", "Alternative scenarios", "Model options if the preferred course is unavailable or the budget falls. Compare alternative routes and explain how each changed assumption affects the result.", 2),
        ("decision_matrix", "exploration", "Decision matrix & verification", "Compare multiple options against affordability, interest fit, entry fit and priorities. Separate verified facts, estimates, assumptions and unknowns; do not treat this as an admission guarantee.", 1),
        ("career_transition", "career", "Career pathways and next steps", "Map plausible study-to-work transitions, portfolio or internship milestones and further training. Labour-market outcomes vary by location and individual circumstances.", 12),
    ]
    nodes = [Node(node_id=s[0], node_type=s[1], title=s[2], description=s[3], duration_estimate_months=s[4]) for s in stages]
    edges = [Edge(edge_id=f"roadmap_edge_{i+1}", source_node_id=stages[i][0], target_node_id=stages[i+1][0], edge_type="progression") for i in range(len(stages)-1)]
    # Alternative scenario branches are explicit and connected to the scenario stage.
    nodes.extend([
        Node(node_id="reduced_budget_option", node_type="education", title="If the budget is reduced", description="Recalculate total cost, look for lower-cost recognised options, scholarships and staged study routes. Confirm all fees and funding eligibility with official providers.", duration_estimate_months=1),
        Node(node_id="preferred_course_unavailable", node_type="education", title="If the preferred course is unavailable", description="Compare related degrees, diplomas or alternate entry routes based on prerequisites, accreditation, cost and the student's interests.", duration_estimate_months=1),
    ])
    edges.extend([
        Edge(edge_id="scenario_budget_branch", source_node_id="scenario_planning", target_node_id="reduced_budget_option", edge_type="alternative"),
        Edge(edge_id="scenario_course_branch", source_node_id="scenario_planning", target_node_id="preferred_course_unavailable", edge_type="alternative"),
    ])
    return PathwayGraph(pathway_id=f"edupath-{profile.get('id', 'student')}", nodes=nodes, edges=edges, target_outcome="A transparent set of education-to-career options with budget and uncertainty made explicit", schema_version="1.0")


def _generate(payload: RoadmapRequest) -> dict[str, Any]:
    profile = payload.student_profile_snapshot
    try:
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
        return {"graph": graph.model_dump(mode="json"), "source": "ai", "notice": "AI-generated planning options; verify institution, scholarship and loan details with official providers."}
    except (GraphGenerationError, GraphValidationError, ValueError, TypeError) as exc:
        logger.info("Using deterministic roadmap fallback: %s", exc)
    except Exception:
        logger.exception("Unexpected roadmap generation failure; using fallback")
    graph = fallback_roadmap(profile)
    return {"graph": graph.model_dump(mode="json"), "source": "fallback", "notice": "Starter planning graph. Institution-specific fees, admission requirements, scholarship availability and loan terms are not live-verified."}


@router.post("/roadmap")
def create_roadmap(payload: RoadmapRequest, user: dict = Depends(get_current_user)):
    return _generate(payload)

# Compatibility alias for earlier frontend API service versions.
@router.post("/pathways")
def create_pathways(payload: RoadmapRequest, user: dict = Depends(get_current_user)):
    return _generate(payload)

class ScenarioRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_profile_snapshot: dict[str, Any] = Field(default_factory=dict)
    scenario: Literal["baseline", "budget", "course"] = "baseline"
    budget_reduction_percent: int = Field(default=25, ge=0, le=100)
    preferred_course: str = ""

@router.post("/scenarios")
def simulate_scenario(payload: ScenarioRequest, user: dict = Depends(get_current_user)):
    profile = payload.student_profile_snapshot
    annual_budget = profile.get("annual_budget") or {}
    amount = annual_budget.get("amount", profile.get("budget_amount"))
    currency = str(annual_budget.get("currency") or profile.get("budget_currency") or "INR").upper()
    result: dict[str, Any] = {
        "scenario": payload.scenario,
        "currency": currency,
        "assumptions": ["Budget changes are applied to the entered annual budget only.", "Institution fees, scholarship awards, admission and loan approval are not verified by this simulation."],
        "uncertainty": "High until current official course costs, eligibility criteria and funding terms are verified.",
    }
    if payload.scenario == "budget":
        if amount is None:
            result.update({"status": "budget_not_set", "message": "Enter an annual budget to calculate a reduced-budget scenario."})
        else:
            reduced = round(float(amount) * (1 - payload.budget_reduction_percent / 100), 2)
            result.update({"status": "simulated", "original_annual_budget": amount, "reduction_percent": payload.budget_reduction_percent, "simulated_annual_budget": reduced, "message": f"Planning scenario using {payload.budget_reduction_percent}% less annual budget. Recompare tuition, living costs, grants and loan needs."})
    elif payload.scenario == "course":
        course = payload.preferred_course.strip() or "preferred course"
        result.update({"status": "simulated", "preferred_course": course, "alternatives_to_compare": ["related recognised degree", "diploma or vocational route", "alternate institution or destination", "reapply after strengthening prerequisites"], "message": f"If {course} is unavailable, compare these alternatives by eligibility, accreditation, cost, duration and career relevance."})
    else:
        result.update({"status": "baseline", "annual_budget": amount, "message": "Baseline scenario uses the current profile assumptions. Generate the roadmap to compare multiple routes."})
    return result

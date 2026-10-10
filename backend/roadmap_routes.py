"""Authenticated roadmap generation, multi-pathway comparison, preference learning, and scenario planning."""

import json
import logging
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from auth import get_current_user, get_optional_current_user
from database import get_db
from domain_schemas import GraphGenerationRequest, PathwayGraph, Node, Edge, PathwayRoute
from generator_service import generate_pathway_graph, GraphGenerationError, get_pathway_research
from graph_engine import GraphValidationError, validate_graph
from models import StudentPreferenceComparison
from pathway_comparison import build_complete_pathways
from preference_engine import (
    get_cold_start_weights,
    rank_pathways,
    update_preference_weights,
    evaluate_against_static_baseline,
)
from scenario_simulator import run_scenario_simulation

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Roadmap & Planning"])


class RoadmapRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    student_profile_snapshot: dict[str, Any]
    current_graph: dict[str, Any] | None = None
    current_node_ids_to_expand: list[str] = Field(default_factory=list, max_length=50)
    candidate_node_count: int = Field(default=12, ge=1, le=25)
    generation_intent: Literal[
        "continue",
        "explore_alternatives",
        "recover_from_blocked_route",
    ] = "continue"

    @field_validator("current_node_ids_to_expand")
    @classmethod
    def unique_expansion_targets(cls, values: list[str]) -> list[str]:
        if len(values) != len(set(values)):
            raise ValueError("Expansion target IDs must be unique.")
        return values

    def validate_expansion_request(self) -> None:
        if self.current_graph is None and self.current_node_ids_to_expand:
            raise ValueError(
                "Expansion targets require an existing current_graph."
            )

        if self.current_graph is not None and not self.current_node_ids_to_expand:
            raise ValueError(
                "Select at least one node to expand when current_graph is provided."
            )


def _generate_multi_pathway_roadmap(profile: dict[str, Any]) -> dict[str, Any]:
    """Generate high-quality multi-pathway decision support system."""
    budget = profile.get("annual_budget") or {}
    currency = str(budget.get("currency") or profile.get("budget_currency") or "INR").upper()

    # Build complete post-Class 10 candidate pathways (Path A, Path B, Path C)
    graph, routes = build_complete_pathways(profile, currency=currency)

    # Apply cold-start preference learning prior
    weights = get_cold_start_weights(profile)
    ranked_routes = rank_pathways(routes, weights)

    # Attach ranked routes and matrix to graph
    graph.pathway_routes = ranked_routes
    graph.ranking_explanations = [
        f"Initial ranking derived from your stated profile priorities ({', '.join(profile.get('priorities', ['Balanced']))}).",
        "Deterministic feasibility engine validated academic prerequisites and staged cash flow.",
        "Compare Path A, Path B, and Path C side-by-side or record a pairwise preference to personalize rankings.",
    ]

    return {
        "graph": graph.model_dump(mode="json"),
        "pathway_routes": [r.model_dump() for r in ranked_routes],
        "comparison_matrix": graph.comparison_matrix,
        "preference_weights": weights,
        "source": "evidence_backed_engine",
        "notice": (
            "Multi-pathway decision-support plan. Every node details Decision, Prerequisites, "
            "Timing, Staged Cash Flow, and Fallbacks. Facts verified against official guidelines."
        ),
    }


def _generate(payload: RoadmapRequest) -> dict[str, Any]:
    profile = payload.student_profile_snapshot

    # If this is an expansion request on an existing graph, use graph generator
    if payload.current_graph is not None:
        try:
            payload.validate_expansion_request()
            request_data: dict[str, Any] = {
                "student_profile_snapshot": profile,
                "candidate_node_count": payload.candidate_node_count,
                "generation_intent": payload.generation_intent,
                "current_graph": payload.current_graph,
                "current_node_ids_to_expand": payload.current_node_ids_to_expand,
            }
            request = GraphGenerationRequest.model_validate(request_data)
            graph = generate_pathway_graph(request)
            return {
                "graph": graph.model_dump(mode="json"),
                "source": "ai_expansion",
                "notice": "Expanded roadmap with source-backed candidates.",
            }
        except Exception as exc:
            logger.warning("Graph expansion failed, generating complete multi-pathway: %s", exc)

    # Default to complete multi-pathway comparison system
    return _generate_multi_pathway_roadmap(profile)


@router.post("/roadmap")
def create_roadmap(
    payload: RoadmapRequest,
    user: dict = Depends(get_optional_current_user),
):
    return _generate(payload)


@router.post("/pathways")
def create_pathways(
    payload: RoadmapRequest,
    user: dict = Depends(get_optional_current_user),
):
    """Compatibility endpoint for frontend clients."""
    return _generate(payload)


# -----------------------------------------------------------------------------
# Multi-Pathway Comparison Endpoint
# -----------------------------------------------------------------------------
class PathwayCompareRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_profile_snapshot: dict[str, Any]


@router.post("/pathways/compare")
def compare_pathways(
    payload: PathwayCompareRequest,
    user: dict = Depends(get_optional_current_user),
):
    """Side-by-side comparison of candidate pathways (Path A vs Path B vs Path C)."""
    profile = payload.student_profile_snapshot
    budget = profile.get("annual_budget") or {}
    currency = str(budget.get("currency") or profile.get("budget_currency") or "INR").upper()

    graph, routes = build_complete_pathways(profile, currency=currency)
    weights = get_cold_start_weights(profile)
    ranked_routes = rank_pathways(routes, weights)

    return {
        "status": "success",
        "student_name": profile.get("preferred_name") or "Student",
        "annual_budget": budget.get("amount", profile.get("budget_amount")),
        "currency": currency,
        "pathways": [r.model_dump() for r in ranked_routes],
        "comparison_matrix": graph.comparison_matrix,
        "preference_weights": weights,
        "summary": (
            "Compare timeline, total & staged costs, funding opportunities, prerequisites, "
            "risks, and fallback routes across all options."
        ),
    }


# -----------------------------------------------------------------------------
# Preference Learning Endpoints
# -----------------------------------------------------------------------------
class PreferenceCompareRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    student_profile_snapshot: dict[str, Any]
    pathway_a_id: str
    pathway_b_id: str
    preferred_pathway_id: str
    reasons: list[str] = Field(default_factory=list)
    current_weights: dict[str, float] | None = None


@router.post("/preferences/compare")
def record_preference_comparison(
    payload: PreferenceCompareRequest,
    user: dict = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Capture pairwise preference choices, learn trade-offs, update rankings, and evaluate against baseline."""
    profile = payload.student_profile_snapshot
    currency = str(
        profile.get("annual_budget", {}).get("currency")
        or profile.get("budget_currency")
        or "INR"
    ).upper()

    graph, routes = build_complete_pathways(profile, currency=currency)
    routes_by_id = {r.pathway_id: r for r in routes}

    route_a = routes_by_id.get(payload.pathway_a_id)
    route_b = routes_by_id.get(payload.pathway_b_id)

    if not route_a or not route_b:
        raise HTTPException(
            status_code=400,
            detail="One or both pathway IDs not found in candidate options.",
        )

    # Current weights or cold-start
    current_w = payload.current_weights or get_cold_start_weights(profile)

    # Learn from student pairwise choice
    new_weights, explanation = update_preference_weights(
        current_weights=current_w,
        route_a=route_a,
        route_b=route_b,
        preferred_route_id=payload.preferred_pathway_id,
        selected_reasons=payload.reasons,
    )

    # Persist in DB
    owner_id = user.get("sub") or user.get("id")
    profile_id = profile.get("id")

    try:
        record = StudentPreferenceComparison(
            profile_id=int(profile_id) if profile_id else None,
            owner_id=str(owner_id) if owner_id else None,
            pathway_a_id=payload.pathway_a_id,
            pathway_b_id=payload.pathway_b_id,
            preferred_pathway_id=payload.preferred_pathway_id,
            reasons=json.dumps(payload.reasons),
            weights_snapshot=json.dumps(new_weights),
        )
        db.add(record)
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning("Could not persist preference comparison to DB: %s", exc)

    # Query historical comparisons for baseline evaluation
    history_items = []
    try:
        query = db.query(StudentPreferenceComparison)
        if owner_id:
            query = query.filter(StudentPreferenceComparison.owner_id == str(owner_id))
        rows = query.order_by(StudentPreferenceComparison.created_at.desc()).limit(20).all()
        for r in rows:
            history_items.append(
                {
                    "pathway_a_id": r.pathway_a_id,
                    "pathway_b_id": r.pathway_b_id,
                    "preferred_pathway_id": r.preferred_pathway_id,
                }
            )
    except Exception:
        history_items = [
            {
                "pathway_a_id": payload.pathway_a_id,
                "pathway_b_id": payload.pathway_b_id,
                "preferred_pathway_id": payload.preferred_pathway_id,
            }
        ]

    # Re-rank pathways using updated weights with hard constraint enforcement
    ranked_routes = rank_pathways(routes, new_weights)

    # Check constraint enforcement explanation
    preferred_route = routes_by_id.get(payload.preferred_pathway_id)
    constraint_notice = None
    if preferred_route and preferred_route.feasibility_status == "BLOCKED":
        constraint_notice = (
            f"Constraint Enforcement: You preferred {preferred_route.route_name}, but it is marked BLOCKED "
            f"due to unmet academic cutoffs or an unbridgeable funding gap. The system keeps hard constraints in force."
        )

    # Evaluate against static baseline
    baseline_eval = evaluate_against_static_baseline(
        comparison_history=history_items,
        learned_weights=new_weights,
        routes=routes,
    )

    return {
        "status": "preferences_updated",
        "updated_weights": new_weights,
        "explanation": explanation,
        "constraint_enforcement_notice": constraint_notice,
        "ranked_pathways": [r.model_dump() for r in ranked_routes],
        "baseline_evaluation": baseline_eval,
    }


class PreferenceHistoryRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    student_profile_snapshot: dict[str, Any] = Field(default_factory=dict)


@router.post("/preferences/history")
def get_preference_history(
    payload: PreferenceHistoryRequest,
    user: dict = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve student's pairwise preference history and active weights."""
    owner_id = user.get("sub") or user.get("id")
    profile = payload.student_profile_snapshot
    weights = get_cold_start_weights(profile)

    comparisons = []
    try:
        query = db.query(StudentPreferenceComparison)
        if owner_id:
            query = query.filter(StudentPreferenceComparison.owner_id == str(owner_id))
        rows = query.order_by(StudentPreferenceComparison.created_at.desc()).limit(20).all()
        for r in rows:
            comparisons.append(
                {
                    "id": r.id,
                    "pathway_a_id": r.pathway_a_id,
                    "pathway_b_id": r.pathway_b_id,
                    "preferred_pathway_id": r.preferred_pathway_id,
                    "reasons": json.loads(r.reasons) if r.reasons else [],
                    "created_at": r.created_at.isoformat(),
                }
            )
            if r.weights_snapshot:
                try:
                    weights = json.loads(r.weights_snapshot)
                except Exception:
                    pass
    except Exception as exc:
        logger.warning("Could not load preference history: %s", exc)

    return {
        "current_weights": weights,
        "history": comparisons,
        "total_comparisons": len(comparisons),
    }


# -----------------------------------------------------------------------------
# Scenario Simulation Endpoint
# -----------------------------------------------------------------------------
class ScenarioRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    student_profile_snapshot: dict[str, Any] = Field(default_factory=dict)
    scenario: Literal["baseline", "budget", "course", "admission", "scholarship"] = (
        "baseline"
    )
    budget_reduction_percent: int = Field(default=25, ge=0, le=100)
    preferred_course: str = Field(default="", max_length=200)
    funding_amount: float | None = Field(default=None, ge=0)
    funding_status: Literal["unknown", "awarded", "rejected"] = "unknown"


@router.post("/scenarios")
def simulate_scenario(
    payload: ScenarioRequest,
    user: dict = Depends(get_optional_current_user),
):
    """Simulate what-if scenarios (admission cutoff missed, scholarship rejected, budget decreased)."""
    profile = payload.student_profile_snapshot
    currency = str(
        profile.get("annual_budget", {}).get("currency")
        or profile.get("budget_currency")
        or "INR"
    ).upper()

    graph, routes = build_complete_pathways(profile, currency=currency)

    sim_params = {
        "budget_reduction_percent": payload.budget_reduction_percent,
        "preferred_course": payload.preferred_course,
        "funding_amount": payload.funding_amount,
        "funding_status": payload.funding_status,
    }

    result = run_scenario_simulation(
        profile=profile,
        graph=graph,
        routes=routes,
        scenario=payload.scenario,
        params=sim_params,
    )

    return result

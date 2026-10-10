
"""Authenticated roadmap generation and deterministic scenario planning."""

import logging
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from auth import get_current_user
from domain_schemas import GraphGenerationRequest, PathwayGraph, Node, Edge
from generator_service import generate_pathway_graph, GraphGenerationError
from graph_engine import GraphValidationError, validate_graph

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


def _profile_text(
    profile: dict[str, Any],
    key: str,
    default: str = "",
) -> str:
    value = profile.get(key, default)
    return str(value).strip() if value is not None else default


def fallback_roadmap(profile: dict[str, Any]) -> PathwayGraph:
    """Create a transparent starter roadmap without claiming live verification."""
    interests = profile.get("interests") or []
    interest_text = (
        ", ".join(str(item).replace("_", " ") for item in interests[:3])
        or _profile_text(
            profile,
            "interest_description",
            "the student's interests",
        )
    )

    country = _profile_text(profile, "country", "Not specified")
    region = _profile_text(profile, "region", "Not specified")
    destination = _profile_text(
        profile,
        "preferred_destination",
        "undecided",
    )

    budget = profile.get("annual_budget") or {}
    currency = str(
        budget.get("currency") or profile.get("budget_currency") or "INR"
    ).upper()
    amount = budget.get("amount", profile.get("budget_amount"))

    if amount is None:
        budget_line = (
            "Annual budget has not been established. Set a realistic budget "
            "before making affordability decisions."
        )
    else:
        budget_line = (
            f"Entered annual budget: {currency} {amount}. This is not proof "
            "that tuition, living expenses and payments due at each stage "
            "are affordable."
        )

    location_line = f"Location: {region}, {country}. Preferred destination: {destination}."

    stages = [
        (
            "budget_planning",
            "exploration",
            "Establish constraints and priorities",
            f"{budget_line} {location_line} Clarify interests, academic eligibility, "
            "family constraints, payment timing and the relative importance of "
            "cost, duration, location and career options.",
            1,
        ),
        (
            "career_exploration",
            "exploration",
            "Explore and test career interests",
            f"Use projects, introductory lessons and conversations with practitioners "
            f"to test interest in {interest_text}. Treat career fit as a hypothesis, "
            "not a prediction or guarantee.",
            2,
        ),
        (
            "class10_routes",
            "education",
            "Compare post-Class 10 routes",
            "Compare senior-secondary study, eligible polytechnic diplomas and "
            "vocational or ITI routes where available. Verify subject requirements, "
            "recognition, progression rules, deadlines and costs with official sources.",
            1,
        ),
        (
            "academic_preparation",
            "education",
            "Prepare for selected entry requirements",
            "Identify the exact subjects, grades, entrance examinations, documents "
            "and application dates for each selected route. Keep requirements marked "
            "unknown until confirmed by the relevant authority.",
            12,
        ),
        (
            "institution_comparison",
            "education",
            "Compare institutions and programmes",
            "Compare recognised programmes by eligibility, total course duration, "
            "tuition, living costs, location, language, deadlines and progression "
            "options. Institution-specific details remain unverified until confirmed.",
            1,
        ),
        (
            "funding_plan",
            "education",
            "Build a staged funding plan",
            "Record each expected payment and its due date. Research scholarships "
            "and grants, verify eligibility and award conditions, and compare any "
            "loan's interest rate, fees, repayment start and total repayment.",
            1,
        ),
        (
            "decision_review",
            "exploration",
            "Review evidence and choose a route",
            "Compare the feasible options against stated priorities. Separate "
            "verified facts, estimates, assumptions and unknowns. Do not treat "
            "this planning roadmap as an admission or funding guarantee.",
            1,
        ),
        (
            "career_transition",
            "career",
            "Plan further study and career transitions",
            "Map likely next qualifications, practical experience and potential "
            "career directions. Verify licensing or accreditation requirements "
            "where relevant; employment outcomes depend on location and individual factors.",
            12,
        ),
    ]

    nodes = [
        Node(
            node_id=node_id,
            node_type=node_type,
            title=title,
            description=description,
            duration_estimate_months=duration,
        )
        for node_id, node_type, title, description, duration in stages
    ]

    edges = [
        Edge(
            edge_id=f"roadmap_edge_{index + 1}",
            source_node_id=stages[index][0],
            target_node_id=stages[index + 1][0],
            edge_type="progression",
        )
        for index in range(len(stages) - 1)
    ]

    nodes.extend(
        [
            Node(
                node_id="reduced_budget_option",
                node_type="education",
                title="Alternative if the budget decreases",
                description=(
                    "Recalculate stage-by-stage affordability, investigate "
                    "recognised lower-cost programmes and eligible funding, "
                    "and defer decisions that depend on unconfirmed awards."
                ),
                duration_estimate_months=1,
            ),
            Node(
                node_id="unavailable_course_option",
                node_type="education",
                title="Alternative if the preferred course is unavailable",
                description=(
                    "Compare related programmes, eligible diploma or vocational "
                    "routes, alternate institutions and a later application. "
                    "Verify entry requirements and progression rules."
                ),
                duration_estimate_months=1,
            ),
            Node(
                node_id="admission_failure_recovery",
                node_type="exploration",
                title="Recovery plan if admission is unsuccessful",
                description=(
                    "Review the unmet requirement and application outcome. "
                    "Compare eligible alternative institutions, another intake, "
                    "bridge preparation or a different recognised qualification."
                ),
                duration_estimate_months=1,
            ),
            Node(
                node_id="scholarship_failure_recovery",
                node_type="exploration",
                title="Recovery plan if funding is rejected",
                description=(
                    "Remove unawarded funding from the plan, recalculate the "
                    "payment schedule and funding gap, and compare other eligible "
                    "grants, lower-cost options or deferral."
                ),
                duration_estimate_months=1,
            ),
        ]
    )

    edges.extend(
        [
            Edge(
                edge_id="scenario_budget_branch",
                source_node_id="decision_review",
                target_node_id="reduced_budget_option",
                edge_type="alternative",
            ),
            Edge(
                edge_id="scenario_course_branch",
                source_node_id="decision_review",
                target_node_id="unavailable_course_option",
                edge_type="alternative",
            ),
            Edge(
                edge_id="scenario_admission_branch",
                source_node_id="decision_review",
                target_node_id="admission_failure_recovery",
                edge_type="alternative",
            ),
            Edge(
                edge_id="scenario_scholarship_branch",
                source_node_id="funding_plan",
                target_node_id="scholarship_failure_recovery",
                edge_type="alternative",
            ),
        ]
    )

    graph = PathwayGraph(
        pathway_id=f"edupath-{profile.get('id', 'student')}",
        nodes=nodes,
        edges=edges,
        target_outcome=(
            "Compare education-to-career pathways with explicit constraints, "
            "evidence, financial uncertainty and recovery options."
        ),
        schema_version="1.0",
    )

    return validate_graph(graph)


def _generate(payload: RoadmapRequest) -> dict[str, Any]:
    profile = payload.student_profile_snapshot

    try:
        payload.validate_expansion_request()

        request_data: dict[str, Any] = {
            "student_profile_snapshot": profile,
            "candidate_node_count": payload.candidate_node_count,
            "generation_intent": payload.generation_intent,
        }

        if payload.current_graph is not None:
            request_data["current_graph"] = payload.current_graph
            request_data["current_node_ids_to_expand"] = (
                payload.current_node_ids_to_expand
            )

        request = GraphGenerationRequest.model_validate(request_data)
        graph = generate_pathway_graph(request)

        return {
            "graph": graph.model_dump(mode="json"),
            "source": "ai",
            "notice": (
                "AI-generated planning options. Research results are evidence "
                "leads, not automatic verification. Confirm official eligibility, "
                "fees, deadlines and funding before treating any route as feasible."
            ),
        }

    except (GraphGenerationError, GraphValidationError, ValueError, TypeError) as exc:
        logger.warning("Roadmap generation could not produce an AI graph: %s", exc)

    except Exception:
        logger.exception("Unexpected roadmap generation failure")

    graph = fallback_roadmap(profile)

    return {
        "graph": graph.model_dump(mode="json"),
        "source": "fallback",
        "notice": (
            "Deterministic starter roadmap. Institution-specific fees, entry "
            "requirements, deadlines, scholarships and loan terms are not live-verified."
        ),
    }


@router.post("/roadmap")
def create_roadmap(
    payload: RoadmapRequest,
    user: dict = Depends(get_current_user),
):
    return _generate(payload)


@router.post("/pathways")
def create_pathways(
    payload: RoadmapRequest,
    user: dict = Depends(get_current_user),
):
    """Compatibility alias for existing frontend clients."""
    return _generate(payload)


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
    user: dict = Depends(get_current_user),
):
    profile = payload.student_profile_snapshot
    annual_budget = profile.get("annual_budget") or {}

    amount = annual_budget.get("amount", profile.get("budget_amount"))
    currency = str(
        annual_budget.get("currency") or profile.get("budget_currency") or "INR"
    ).upper()

    result: dict[str, Any] = {
        "scenario": payload.scenario,
        "currency": currency,
        "status": "simulated",
        "assumptions": [
            "Simulation uses user-provided values and explicit scenario assumptions.",
            "It does not verify admission, tuition, scholarship awards or loan approval.",
            "Annual affordability does not prove that funds are available on each payment date.",
        ],
        "uncertainty": "High until relevant official requirements, costs and funding are confirmed.",
    }

    if payload.scenario == "budget":
        if amount is None:
            result.update(
                {
                    "status": "budget_not_set",
                    "message": (
                        "Enter an annual budget before calculating a reduced-budget scenario."
                    ),
                }
            )
        else:
            reduced = round(
                float(amount) * (1 - payload.budget_reduction_percent / 100),
                2,
            )
            result.update(
                {
                    "original_annual_budget": amount,
                    "reduction_percent": payload.budget_reduction_percent,
                    "simulated_annual_budget": reduced,
                    "message": (
                        "Recalculate costs and payment dates for every route. "
                        "Remove funding that is not confirmed and identify any gap."
                    ),
                }
            )

    elif payload.scenario == "course":
        course = payload.preferred_course.strip() or "the preferred course"
        result.update(
            {
                "preferred_course": course,
                "alternatives_to_compare": [
                    "Related recognised programme",
                    "Eligible diploma or vocational route",
                    "Alternate institution or destination",
                    "Later intake after strengthening prerequisites",
                ],
                "message": (
                    f"If {course} is unavailable, compare alternatives using "
                    "verified eligibility, recognition, cost, duration and career relevance."
                ),
            }
        )

    elif payload.scenario == "admission":
        result.update(
            {
                "trigger": "Preferred admission is unsuccessful or unavailable.",
                "next_actions": [
                    "Record the actual unmet eligibility or selection requirement.",
                    "Remove the unsuccessful admission from the assumed plan.",
                    "Compare eligible alternative institutions and programmes.",
                    "Consider a later intake only if its requirements and deadlines are feasible.",
                ],
                "message": (
                    "The simulation identifies recovery actions; it does not predict "
                    "admission to any alternative."
                ),
            }
        )

    elif payload.scenario == "scholarship":
        funding_amount = payload.funding_amount
        result.update(
            {
                "funding_status": payload.funding_status,
                "funding_amount_removed": (
                    funding_amount
                    if payload.funding_status == "rejected"
                    else 0
                ),
                "next_actions": [
                    "Recalculate the remaining funding gap.",
                    "Recheck the timing of every tuition and living-cost payment.",
                    "Research other eligible awards without counting them as secured funds.",
                    "Compare lower-cost routes or deferral if the gap remains.",
                ],
                "message": (
                    "Only confirmed awards should count as secured funding. "
                    "An application or expected scholarship is not guaranteed money."
                ),
            }
        )

    else:
        result.update(
            {
                "annual_budget": amount,
                "message": (
                    "Baseline scenario uses current profile assumptions. Compare complete "
                    "routes and verify eligibility, staged costs and available funding."
                ),
            }
        )

    return result

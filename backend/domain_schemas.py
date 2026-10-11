from typing import Annotated, Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    FiniteFloat,
    field_validator,
    model_validator,
)

from schemas import StudentProfileCreate, StudentProfileOut

MAX_GRAPH_NODES = 500
MAX_GRAPH_EDGES = 1000
MAX_CANDIDATE_NODES = 25
MAX_PROPOSED_EDGES = 50
MAX_EXPANSION_NODE_IDS = 50

ReferenceId = Annotated[str, Field(min_length=1, max_length=128)]

NodeType = Literal["education", "career", "exploration", "certification"]
EdgeType = Literal[
    "progression",
    "alternative",
    "conditional",
    "dependency",
    "prerequisite",
]

VALID_NODE_TYPES = frozenset(
    {"education", "career", "exploration", "certification"}
)
VALID_EDGE_TYPES = frozenset(
    {"progression", "alternative", "conditional", "dependency", "prerequisite"}
)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class EvidenceRecord(StrictModel):
    evidence_id: ReferenceId
    title: str = Field(min_length=1, max_length=300)
    url: str = Field(min_length=1, max_length=2000)
    source_name: str = Field(min_length=1, max_length=200)
    retrieved_at: str | None = Field(default=None, max_length=50)
    supports: str = Field(min_length=1, max_length=1000)
    confidence: Literal["high", "medium", "low", "unverified"] = "unverified"


class Milestone(StrictModel):
    milestone_id: ReferenceId
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    status: Literal[
        "not_started",
        "in_progress",
        "completed",
        "blocked",
        "decision_pending",
    ] = "not_started"
    start_date: str | None = None
    deadline: str | None = None
    decision_date: str | None = None
    duration_months: FiniteFloat | None = Field(default=None, ge=0)
    prerequisite_milestone_ids: list[ReferenceId] = Field(
        default_factory=list, max_length=100
    )
    requirement_notes: list[str] = Field(default_factory=list, max_length=30)
    cost_amount: FiniteFloat | None = Field(default=None, ge=0)
    cost_currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    funding_notes: list[str] = Field(default_factory=list, max_length=30)
    evidence_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def validate_cost_currency(self):
        if self.cost_amount is not None and self.cost_currency is None:
            raise ValueError(
                "cost_currency is required when cost_amount is provided"
            )
        if self.cost_amount is None and self.cost_currency is not None:
            raise ValueError("cost_currency requires a cost_amount")
        return self


class InstitutionRecord(StrictModel):
    institution_id: ReferenceId
    name: str = Field(min_length=1, max_length=300)
    country: str = Field(min_length=1, max_length=100)
    region: str | None = Field(default=None, max_length=100)
    program_name: str = Field(min_length=1, max_length=300)
    duration_months: FiniteFloat | None = Field(default=None, ge=0)
    admission_requirements: list[str] = Field(default_factory=list, max_length=50)
    application_deadline: str | None = None
    tuition_amount: FiniteFloat | None = Field(default=None, ge=0)
    tuition_currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    evidence_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def validate_tuition_currency(self):
        if self.tuition_amount is not None and self.tuition_currency is None:
            raise ValueError(
                "tuition_currency is required when tuition_amount is provided"
            )
        if self.tuition_amount is None and self.tuition_currency is not None:
            raise ValueError("tuition_currency requires a tuition_amount")
        return self


class FundingOpportunity(StrictModel):
    funding_id: ReferenceId
    name: str = Field(min_length=1, max_length=300)
    funding_type: Literal["scholarship", "grant", "loan", "savings", "other"]
    amount: FiniteFloat | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    application_deadline: str | None = None
    eligibility_notes: list[str] = Field(default_factory=list, max_length=50)
    repayment_interest_rate_percent: FiniteFloat | None = Field(default=None, ge=0)
    repayment_term_months: int | None = Field(default=None, ge=1)
    evidence_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)

    @model_validator(mode="after")
    def validate_funding_currency(self):
        if self.amount is not None and self.currency is None:
            raise ValueError("currency is required when amount is provided")
        if self.amount is None and self.currency is not None:
            raise ValueError("currency requires an amount")
        if self.funding_type != "loan" and (
            self.repayment_interest_rate_percent is not None
            or self.repayment_term_months is not None
        ):
            raise ValueError("repayment fields are only valid for loans")
        return self


class StagedPayment(StrictModel):
    payment_id: ReferenceId | None = None
    stage_name: str = Field(min_length=1, max_length=200)
    amount: FiniteFloat = Field(ge=0)
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    due_date: str | None = None
    covered_by: Literal["budget", "scholarship", "loan", "unfunded"] = "budget"


class RealLifeBenchmark(StrictModel):
    institution_name: str = Field(min_length=1, max_length=300)
    program_name: str | None = Field(default=None, max_length=200)
    actual_tuition: FiniteFloat | None = Field(default=None, ge=0)
    actual_living: FiniteFloat | None = Field(default=None, ge=0)
    actual_fees: FiniteFloat | None = Field(default=None, ge=0)
    actual_total: FiniteFloat | None = Field(default=None, ge=0)
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    source_citation: str = Field(min_length=1, max_length=500)
    academic_year: str | None = Field(default=None, max_length=50)
    variance_note: str | None = Field(default=None, max_length=1000)


class InstituteItem(StrictModel):
    name: str = Field(min_length=1, max_length=300)
    location: str = Field(min_length=1, max_length=200)
    fit_reason: str = Field(min_length=1, max_length=1000)
    estimated_annual_cost: FiniteFloat | None = Field(default=None, ge=0)
    admission_cutoff: str | None = Field(default=None, max_length=200)
    badge: str | None = Field(default=None, max_length=100)


class CategorizedInstitutes(StrictModel):
    location_based: list[InstituteItem] = Field(default_factory=list, max_length=10)
    merit_based: list[InstituteItem] = Field(default_factory=list, max_length=10)
    best_suited: list[InstituteItem] = Field(default_factory=list, max_length=10)


class Node(StrictModel):
    node_id: ReferenceId
    node_type: NodeType
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    duration_estimate_months: FiniteFloat | None = Field(default=None, ge=0)
    cost_estimate: FiniteFloat | None = Field(default=None, ge=0)
    cost_currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    milestone_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    institution_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    evidence_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    prerequisite_node_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)

    # 1. Decision and Purpose
    purpose_fit: str | None = Field(default=None, max_length=4000)
    alternatives_summary: str | None = Field(default=None, max_length=2000)
    potential_outcomes: list[str] = Field(default_factory=list, max_length=50)

    # 2. Requirements and Prerequisites
    required_subjects: list[str] = Field(default_factory=list, max_length=30)
    min_grade_or_score: str | None = Field(default=None, max_length=200)
    entrance_exams: list[str] = Field(default_factory=list, max_length=30)
    eligibility_conditions: list[str] = Field(default_factory=list, max_length=50)
    application_materials: list[str] = Field(default_factory=list, max_length=50)
    unqualified_consequence: str | None = Field(default=None, max_length=2000)

    # 3. Timeline and Deadlines
    start_date: str | None = None
    application_window: str | None = Field(default=None, max_length=200)
    expected_decision_date: str | None = None
    next_decision_date: str | None = None

    # 4. Financial Feasibility & Staged Cash Flow
    tuition_amount: FiniteFloat | None = Field(default=None, ge=0)
    living_expenses: FiniteFloat | None = Field(default=None, ge=0)
    fees_estimate: FiniteFloat | None = Field(default=None, ge=0)
    staged_payments: list[StagedPayment] = Field(default_factory=list, max_length=50)
    scholarship_eligibility: list[str] = Field(default_factory=list, max_length=30)
    funding_gap: FiniteFloat | None = Field(default=None, ge=0)
    loan_interest_rate: FiniteFloat | None = Field(default=None, ge=0)
    loan_monthly_payment: FiniteFloat | None = Field(default=None, ge=0)
    financial_status: Literal["feasible", "tight", "funding_gap", "unfeasible"] | None = None

    # 5. Evidence, Uncertainty, and Fallback
    source_links: list[str] = Field(default_factory=list, max_length=50)
    source_dates: list[str] = Field(default_factory=list, max_length=50)
    verified_status: Literal["verified", "unverified", "estimate"] = "unverified"
    admission_uncertainty: Literal["low", "medium", "high"] | None = None
    scholarship_uncertainty: Literal["low", "medium", "high"] | None = None
    blocked_requirements: list[str] = Field(default_factory=list, max_length=30)
    actionable_fallback: str | None = Field(default=None, max_length=2000)
    pathway_id: str | None = Field(default=None, max_length=128)
    feasibility_status: Literal["FEASIBLE", "CONDITIONAL", "BLOCKED"] = "FEASIBLE"

    # 6. Cost Evidence, Real-Life Benchmark & Categorized Institutes
    cost_evidence_description: str | None = Field(default=None, max_length=3000)
    cost_source_citation: str | None = Field(default=None, max_length=500)
    real_life_benchmark: RealLifeBenchmark | None = None
    categorized_institutes: CategorizedInstitutes | None = None

    @field_validator("node_type", mode="before")
    @classmethod
    def normalize_node_type(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().casefold()
        return value

    @model_validator(mode="after")
    def validate_cost_currency(self):
        if self.cost_estimate is not None and self.cost_currency is None:
            raise ValueError(
                "cost_currency is required when cost_estimate is provided"
            )
        if self.cost_estimate is None and self.cost_currency is not None:
            raise ValueError("cost_currency requires a cost_estimate")
        return self


class Edge(StrictModel):
    edge_id: ReferenceId
    source_node_id: ReferenceId
    target_node_id: ReferenceId
    edge_type: EdgeType
    condition: str | None = Field(default=None, max_length=1000)

    @field_validator("edge_type", mode="before")
    @classmethod
    def normalize_edge_type(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().casefold()
        return value

    @model_validator(mode="after")
    def validate_condition(self):
        if self.edge_type == "conditional":
            if self.condition is None or not self.condition.strip():
                raise ValueError(
                    "condition must be a non-empty string when "
                    "edge_type is 'conditional'"
                )
        elif self.condition is not None:
            raise ValueError(
                "condition is only allowed when edge_type is 'conditional', "
                f"but got edge_type '{self.edge_type}'"
            )
        return self


class PathwayRoute(StrictModel):
    pathway_id: ReferenceId
    route_name: str = Field(min_length=1, max_length=200)
    category: str = Field(default="general", max_length=100)
    summary: str = Field(min_length=1, max_length=2000)
    total_duration_months: FiniteFloat = Field(ge=0)
    total_cost: FiniteFloat = Field(ge=0)
    currency: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    staged_payments: list[StagedPayment] = Field(default_factory=list, max_length=50)
    available_funding: list[str] = Field(default_factory=list, max_length=50)
    net_cost_after_aid: FiniteFloat = Field(ge=0, default=0.0)
    entry_requirements: list[str] = Field(default_factory=list, max_length=50)
    potential_outcomes: list[str] = Field(default_factory=list, max_length=50)
    risks: list[str] = Field(default_factory=list, max_length=50)
    fallback_route: str = Field(min_length=1, max_length=2000)
    is_academically_eligible: bool = True
    is_cash_flow_feasible: bool = True
    feasibility_status: Literal["FEASIBLE", "CONDITIONAL", "BLOCKED"] = "FEASIBLE"
    feasibility_reasons: list[str] = Field(default_factory=list, max_length=50)
    ranking_score: FiniteFloat = 0.0
    node_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)


class PathwayGraph(StrictModel):
    pathway_id: ReferenceId
    nodes: list[Node] = Field(max_length=MAX_GRAPH_NODES)
    edges: list[Edge] = Field(max_length=MAX_GRAPH_EDGES)
    target_outcome: str | None = Field(default=None, max_length=1000)
    schema_version: str = Field(default="1.0", min_length=1, max_length=32)

    evidence_records: list[EvidenceRecord] = Field(
        default_factory=list, max_length=1000
    )
    milestones: list[Milestone] = Field(default_factory=list, max_length=500)
    institutions: list[InstitutionRecord] = Field(
        default_factory=list, max_length=250
    )
    funding_opportunities: list[FundingOpportunity] = Field(
        default_factory=list, max_length=500
    )
    pathway_routes: list[PathwayRoute] = Field(
        default_factory=list, max_length=20
    )
    ranking_explanations: list[str] = Field(
        default_factory=list, max_length=50
    )
    comparison_matrix: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_unique_record_ids(self):
        collections = [
            ("nodes", self.nodes, "node_id"),
            ("edges", self.edges, "edge_id"),
            ("evidence_records", self.evidence_records, "evidence_id"),
            ("milestones", self.milestones, "milestone_id"),
            ("institutions", self.institutions, "institution_id"),
            ("funding_opportunities", self.funding_opportunities, "funding_id"),
        ]

        for collection_name, records, id_field in collections:
            record_ids = [getattr(record, id_field) for record in records]
            if len(record_ids) != len(set(record_ids)):
                raise ValueError(f"Duplicate IDs found in {collection_name}")

        node_ids = {node.node_id for node in self.nodes}
        edge_ids = {edge.edge_id for edge in self.edges}
        evidence_ids = {record.evidence_id for record in self.evidence_records}
        milestone_ids = {milestone.milestone_id for milestone in self.milestones}
        institution_ids = {
            institution.institution_id for institution in self.institutions
        }
        funding_ids = {
            funding.funding_id for funding in self.funding_opportunities
        }

        for edge in self.edges:
            if edge.source_node_id not in node_ids:
                raise ValueError(
                    f"Edge '{edge.edge_id}' references unknown source node "
                    f"'{edge.source_node_id}'"
                )
            if edge.target_node_id not in node_ids:
                raise ValueError(
                    f"Edge '{edge.edge_id}' references unknown target node "
                    f"'{edge.target_node_id}'"
                )
            if edge.source_node_id == edge.target_node_id:
                raise ValueError(
                    f"Edge '{edge.edge_id}' cannot connect a node to itself"
                )

        for node in self.nodes:
            missing_evidence = set(node.evidence_ids) - evidence_ids
            if missing_evidence:
                raise ValueError(
                    f"Node '{node.node_id}' references unknown evidence IDs: "
                    f"{sorted(missing_evidence)}"
                )

            missing_milestones = set(node.milestone_ids) - milestone_ids
            if missing_milestones:
                raise ValueError(
                    f"Node '{node.node_id}' references unknown milestone IDs: "
                    f"{sorted(missing_milestones)}"
                )

            missing_institutions = set(node.institution_ids) - institution_ids
            if missing_institutions:
                raise ValueError(
                    f"Node '{node.node_id}' references unknown institution IDs: "
                    f"{sorted(missing_institutions)}"
                )

            missing_prerequisites = set(node.prerequisite_node_ids) - node_ids
            if missing_prerequisites:
                raise ValueError(
                    f"Node '{node.node_id}' references unknown prerequisite "
                    f"node IDs: {sorted(missing_prerequisites)}"
                )

            if node.node_id in node.prerequisite_node_ids:
                raise ValueError(
                    f"Node '{node.node_id}' cannot be its own prerequisite"
                )

        for milestone in self.milestones:
            missing_evidence = set(milestone.evidence_ids) - evidence_ids
            if missing_evidence:
                raise ValueError(
                    f"Milestone '{milestone.milestone_id}' references "
                    f"unknown evidence IDs: {sorted(missing_evidence)}"
                )

            missing_prerequisites = (
                set(milestone.prerequisite_milestone_ids) - milestone_ids
            )
            if missing_prerequisites:
                raise ValueError(
                    f"Milestone '{milestone.milestone_id}' references unknown "
                    f"prerequisite milestone IDs: {sorted(missing_prerequisites)}"
                )

        for institution in self.institutions:
            missing_evidence = set(institution.evidence_ids) - evidence_ids
            if missing_evidence:
                raise ValueError(
                    f"Institution '{institution.institution_id}' references "
                    f"unknown evidence IDs: {sorted(missing_evidence)}"
                )

        for funding in self.funding_opportunities:
            missing_evidence = set(funding.evidence_ids) - evidence_ids
            if missing_evidence:
                raise ValueError(
                    f"Funding opportunity '{funding.funding_id}' references "
                    f"unknown evidence IDs: {sorted(missing_evidence)}"
                )

        prerequisite_graph = {
            node.node_id: node.prerequisite_node_ids for node in self.nodes
        }

        visiting: set[str] = set()
        visited: set[str] = set()

        def visit_node(node_id: str) -> None:
            if node_id in visiting:
                raise ValueError(
                    f"Node prerequisite cycle detected at '{node_id}'"
                )
            if node_id in visited:
                return

            visiting.add(node_id)
            for prerequisite_id in prerequisite_graph[node_id]:
                visit_node(prerequisite_id)
            visiting.remove(node_id)
            visited.add(node_id)

        for node_id in prerequisite_graph:
            visit_node(node_id)

        prerequisite_graph_milestones = {
            milestone.milestone_id: milestone.prerequisite_milestone_ids
            for milestone in self.milestones
        }

        visiting_milestones: set[str] = set()
        visited_milestones: set[str] = set()

        def visit_milestone(milestone_id: str) -> None:
            if milestone_id in visiting_milestones:
                raise ValueError(
                    "Milestone prerequisite cycle detected at "
                    f"'{milestone_id}'"
                )
            if milestone_id in visited_milestones:
                return

            visiting_milestones.add(milestone_id)
            for prerequisite_id in prerequisite_graph_milestones[milestone_id]:
                visit_milestone(prerequisite_id)
            visiting_milestones.remove(milestone_id)
            visited_milestones.add(milestone_id)

        for milestone_id in prerequisite_graph_milestones:
            visit_milestone(milestone_id)

        return self


class GraphGenerationRequest(StrictModel):
    student_profile_snapshot: StudentProfileCreate | StudentProfileOut
    current_graph: PathwayGraph | None = None
    current_node_ids_to_expand: list[ReferenceId] = Field(
        default_factory=list, max_length=MAX_EXPANSION_NODE_IDS
    )
    candidate_node_count: int = Field(ge=1, le=MAX_CANDIDATE_NODES)
    generation_intent: Literal[
        "continue",
        "explore_alternatives",
        "recover_from_blocked_route",
    ]

    @model_validator(mode="after")
    def validate_expansion_nodes(self):
        if len(self.current_node_ids_to_expand) != len(
            set(self.current_node_ids_to_expand)
        ):
            raise ValueError(
                "current_node_ids_to_expand must not contain duplicates"
            )

        if self.current_graph is None:
            if self.current_node_ids_to_expand:
                raise ValueError(
                    "current_node_ids_to_expand requires current_graph"
                )
            return self

        from graph_engine import validate_graph

        validate_graph(self.current_graph)

        if not self.current_node_ids_to_expand:
            raise ValueError(
                "current_node_ids_to_expand must contain at least one node ID "
                "when current_graph is provided"
            )

        graph_node_ids = {node.node_id for node in self.current_graph.nodes}
        missing_ids = (
            set(self.current_node_ids_to_expand) - graph_node_ids
        )
        if missing_ids:
            raise ValueError(
                "current_node_ids_to_expand references missing nodes: "
                f"{sorted(missing_ids)}"
            )

        return self


class NodeEndpointRef(StrictModel):
    kind: Literal["existing_node", "candidate"]
    node_id: ReferenceId | None = None
    candidate_id: ReferenceId | None = None

    @model_validator(mode="after")
    def validate_reference(self):
        if self.kind == "existing_node":
            if self.node_id is None or self.candidate_id is not None:
                raise ValueError(
                    "existing_node reference requires 'node_id' and forbids "
                    "'candidate_id'"
                )
        elif self.candidate_id is None or self.node_id is not None:
            raise ValueError(
                "candidate reference requires 'candidate_id' and forbids "
                "'node_id'"
            )
        return self

    @property
    def target_id(self) -> str:
        return (
            self.node_id
            if self.kind == "existing_node"
            else self.candidate_id
        )  # type: ignore[return-value]

    @classmethod
    def existing(cls, node_id: str) -> "NodeEndpointRef":
        return cls(kind="existing_node", node_id=node_id)

    @classmethod
    def candidate(cls, candidate_id: str) -> "NodeEndpointRef":
        return cls(kind="candidate", candidate_id=candidate_id)


CandidatePrerequisiteRef = NodeEndpointRef


class CandidateNode(StrictModel):
    candidate_id: ReferenceId
    node_type: NodeType
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    duration_estimate_months: FiniteFloat | None = Field(default=None, ge=0)
    cost_estimate: FiniteFloat | None = Field(default=None, ge=0)
    cost_currency: str | None = Field(default=None, pattern=r"^[A-Z]{3}$")
    milestone_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    institution_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    evidence_ids: list[ReferenceId] = Field(default_factory=list, max_length=100)
    prerequisite_refs: list[NodeEndpointRef] = Field(default_factory=list, max_length=100)

    # 1. Decision and Purpose
    purpose_fit: str | None = Field(default=None, max_length=4000)
    alternatives_summary: str | None = Field(default=None, max_length=2000)
    potential_outcomes: list[str] = Field(default_factory=list, max_length=50)

    # 2. Requirements and Prerequisites
    required_subjects: list[str] = Field(default_factory=list, max_length=30)
    min_grade_or_score: str | None = Field(default=None, max_length=200)
    entrance_exams: list[str] = Field(default_factory=list, max_length=30)
    eligibility_conditions: list[str] = Field(default_factory=list, max_length=50)
    application_materials: list[str] = Field(default_factory=list, max_length=50)
    unqualified_consequence: str | None = Field(default=None, max_length=2000)

    # 3. Timeline and Deadlines
    start_date: str | None = None
    application_window: str | None = Field(default=None, max_length=200)
    expected_decision_date: str | None = None
    next_decision_date: str | None = None

    # 4. Financial Feasibility & Staged Cash Flow
    tuition_amount: FiniteFloat | None = Field(default=None, ge=0)
    living_expenses: FiniteFloat | None = Field(default=None, ge=0)
    fees_estimate: FiniteFloat | None = Field(default=None, ge=0)
    staged_payments: list[StagedPayment] = Field(default_factory=list, max_length=50)
    scholarship_eligibility: list[str] = Field(default_factory=list, max_length=30)
    funding_gap: FiniteFloat | None = Field(default=None, ge=0)
    loan_interest_rate: FiniteFloat | None = Field(default=None, ge=0)
    loan_monthly_payment: FiniteFloat | None = Field(default=None, ge=0)
    financial_status: Literal["feasible", "tight", "funding_gap", "unfeasible"] | None = None

    # 5. Evidence, Uncertainty, and Fallback
    source_links: list[str] = Field(default_factory=list, max_length=50)
    source_dates: list[str] = Field(default_factory=list, max_length=50)
    verified_status: Literal["verified", "unverified", "estimate"] = "unverified"
    admission_uncertainty: Literal["low", "medium", "high"] | None = None
    scholarship_uncertainty: Literal["low", "medium", "high"] | None = None
    blocked_requirements: list[str] = Field(default_factory=list, max_length=30)
    actionable_fallback: str | None = Field(default=None, max_length=2000)
    pathway_id: str | None = Field(default=None, max_length=128)
    feasibility_status: Literal["FEASIBLE", "CONDITIONAL", "BLOCKED"] = "FEASIBLE"

    @field_validator("node_type", mode="before")
    @classmethod
    def normalize_node_type(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().casefold()
        return value

    @model_validator(mode="after")
    def validate_cost_currency(self):
        if self.cost_estimate is not None and self.cost_currency is None:
            raise ValueError(
                "cost_currency is required when cost_estimate is provided"
            )
        if self.cost_estimate is None and self.cost_currency is not None:
            raise ValueError("cost_currency requires a cost_estimate")
        return self


class ProposedEdge(StrictModel):
    edge_key: ReferenceId
    source: NodeEndpointRef
    target: NodeEndpointRef
    edge_type: EdgeType
    condition: str | None = Field(default=None, max_length=1000)

    @field_validator("edge_type", mode="before")
    @classmethod
    def normalize_edge_type(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip().casefold()
        return value

    @model_validator(mode="after")
    def validate_condition(self):
        if self.edge_type == "conditional":
            if self.condition is None or not self.condition.strip():
                raise ValueError(
                    "condition must be a non-empty string when "
                    "edge_type is 'conditional'"
                )
        elif self.condition is not None:
            raise ValueError(
                "condition is only allowed when edge_type is 'conditional', "
                f"but got edge_type '{self.edge_type}'"
            )
        return self


class CandidateProposal(StrictModel):
    candidate_nodes: list[CandidateNode] = Field(
        max_length=MAX_CANDIDATE_NODES
    )
    proposed_edges: list[ProposedEdge] = Field(
        default_factory=list, max_length=MAX_PROPOSED_EDGES
    )

    @model_validator(mode="after")
    def validate_proposal_references(self):
        candidate_ids = [node.candidate_id for node in self.candidate_nodes]
        if len(candidate_ids) != len(set(candidate_ids)):
            raise ValueError("Duplicate candidate IDs found")

        candidate_id_set = set(candidate_ids)
        edge_keys = [edge.edge_key for edge in self.proposed_edges]
        if len(edge_keys) != len(set(edge_keys)):
            raise ValueError("Duplicate proposed edge keys found")

        for edge in self.proposed_edges:
            for endpoint in (edge.source, edge.target):
                if endpoint.kind == "candidate":
                    if endpoint.candidate_id not in candidate_id_set:
                        raise ValueError(
                            f"Proposed edge '{edge.edge_key}' references "
                            f"unknown candidate '{endpoint.candidate_id}'"
                        )

            if edge.source.target_id == edge.target.target_id:
                if edge.source.kind == edge.target.kind:
                    raise ValueError(
                        f"Proposed edge '{edge.edge_key}' cannot connect "
                        "an endpoint to itself"
                    )

        for node in self.candidate_nodes:
            seen_refs = set()
            for ref in node.prerequisite_refs:
                key = (ref.kind, ref.target_id)
                if key in seen_refs:
                    raise ValueError(
                        f"Candidate '{node.candidate_id}' has duplicate "
                        "prerequisite references"
                    )
                seen_refs.add(key)

                if ref.kind == "candidate" and ref.candidate_id not in candidate_id_set:
                    raise ValueError(
                        f"Candidate '{node.candidate_id}' references unknown "
                        f"prerequisite candidate '{ref.candidate_id}'"
                    )

                if (
                    ref.kind == "candidate"
                    and ref.candidate_id == node.candidate_id
                ):
                    raise ValueError(
                        f"Candidate '{node.candidate_id}' cannot be its own prerequisite"
                    )

        return self


GraphProposalOutput = CandidateProposal

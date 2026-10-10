from collections import deque
from collections.abc import Sequence
from typing import Any
import uuid

from pydantic import ValidationError

from domain_schemas import (
    MAX_CANDIDATE_NODES,
    MAX_GRAPH_EDGES,
    MAX_GRAPH_NODES,
    MAX_PROPOSED_EDGES,
    CandidateProposal,
    Edge,
    GraphGenerationRequest,
    Node,
    PathwayGraph,
)

# Progression and alternative edges may cycle; dependency and prerequisite
# relationships must remain acyclic.
DEPENDENCY_EDGE_TYPES = frozenset({"dependency", "prerequisite"})


class GraphValidationError(ValueError):
    def __init__(self, errors: Sequence[str]):
        self.errors = tuple(errors)
        super().__init__("Graph validation failed: " + "; ".join(self.errors))


def _check_acyclic(
    adjacency: dict[str, set[str]],
    error_label: str,
) -> list[str]:
    indegree = {node_id: 0 for node_id in adjacency}

    for source_id, targets in adjacency.items():
        for target_id in targets:
            if target_id in indegree:
                indegree[target_id] += 1

    ready = deque(
        node_id for node_id, count in indegree.items() if count == 0
    )
    visited_count = 0

    while ready:
        node_id = ready.popleft()
        visited_count += 1

        for target_id in adjacency[node_id]:
            indegree[target_id] -= 1
            if indegree[target_id] == 0:
                ready.append(target_id)

    if visited_count == len(adjacency):
        return []

    cyclic_nodes = sorted(
        node_id for node_id, count in indegree.items() if count > 0
    )
    return [f"{error_label} cycle detected involving nodes {cyclic_nodes}"]


def validate_graph(graph: PathwayGraph) -> PathwayGraph:
    errors: list[str] = []

    if len(graph.nodes) > MAX_GRAPH_NODES:
        errors.append(f"graph exceeds the {MAX_GRAPH_NODES}-node limit")

    if len(graph.edges) > MAX_GRAPH_EDGES:
        errors.append(f"graph exceeds the {MAX_GRAPH_EDGES}-edge limit")

    nodes_by_id: dict[str, Node] = {}

    for node in graph.nodes:
        if node.node_id in nodes_by_id:
            errors.append(f"node '{node.node_id}' has a duplicate node_id")
        else:
            nodes_by_id[node.node_id] = node

    edge_ids: set[str] = set()
    dependency_adjacency: dict[str, set[str]] = {
        node_id: set() for node_id in nodes_by_id
    }

    for node in graph.nodes:
        for prerequisite_id in node.prerequisite_node_ids:
            if prerequisite_id not in nodes_by_id:
                errors.append(
                    f"node '{node.node_id}' references missing prerequisite "
                    f"node '{prerequisite_id}'"
                )
            else:
                dependency_adjacency[prerequisite_id].add(node.node_id)

    for edge in graph.edges:
        if edge.edge_id in edge_ids:
            errors.append(f"edge '{edge.edge_id}' has a duplicate edge_id")
        edge_ids.add(edge.edge_id)

        if edge.source_node_id == edge.target_node_id:
            errors.append(
                f"edge '{edge.edge_id}' is a self-loop on node "
                f"'{edge.source_node_id}'"
            )

        source_exists = edge.source_node_id in nodes_by_id
        target_exists = edge.target_node_id in nodes_by_id

        if not source_exists:
            errors.append(
                f"edge '{edge.edge_id}' references missing source node "
                f"'{edge.source_node_id}'"
            )

        if not target_exists:
            errors.append(
                f"edge '{edge.edge_id}' references missing target node "
                f"'{edge.target_node_id}'"
            )

        if (
            edge.edge_type in DEPENDENCY_EDGE_TYPES
            and source_exists
            and target_exists
        ):
            dependency_adjacency[edge.source_node_id].add(edge.target_node_id)

    errors.extend(
        _check_acyclic(dependency_adjacency, "dependency")
    )

    if errors:
        raise GraphValidationError(errors)

    return graph


def update_graph(
    existing_graph: PathwayGraph,
    candidate_nodes: Sequence[Node | dict[str, Any]],
    proposed_edges: Sequence[Edge | dict[str, Any]],
) -> PathwayGraph:
    if len(candidate_nodes) > MAX_CANDIDATE_NODES:
        raise GraphValidationError(
            [
                f"update exceeds the {MAX_CANDIDATE_NODES}-candidate-node "
                "batch limit"
            ]
        )

    if len(proposed_edges) > MAX_PROPOSED_EDGES:
        raise GraphValidationError(
            [
                f"update exceeds the {MAX_PROPOSED_EDGES}-proposed-edge "
                "batch limit"
            ]
        )

    validate_graph(existing_graph)

    parsed_nodes: list[Node] = []
    for node in candidate_nodes:
        if isinstance(node, Node):
            parsed_nodes.append(node)
        else:
            try:
                parsed_nodes.append(Node.model_validate(node))
            except ValidationError as exc:
                raise GraphValidationError(
                    [f"invalid node data: {exc}"]
                ) from exc

    parsed_edges: list[Edge] = []
    for edge in proposed_edges:
        if isinstance(edge, Edge):
            parsed_edges.append(edge)
        else:
            try:
                parsed_edges.append(Edge.model_validate(edge))
            except ValidationError as exc:
                raise GraphValidationError(
                    [f"invalid edge data: {exc}"]
                ) from exc

    existing_node_ids = {node.node_id for node in existing_graph.nodes}
    existing_edge_ids = {edge.edge_id for edge in existing_graph.edges}

    candidate_node_ids = [node.node_id for node in parsed_nodes]
    candidate_edge_ids = [edge.edge_id for edge in parsed_edges]

    if len(candidate_node_ids) != len(set(candidate_node_ids)):
        raise GraphValidationError(
            ["update contains duplicate candidate node IDs"]
        )

    if len(candidate_edge_ids) != len(set(candidate_edge_ids)):
        raise GraphValidationError(
            ["update contains duplicate proposed edge IDs"]
        )

    node_collisions = existing_node_ids.intersection(candidate_node_ids)
    if node_collisions:
        raise GraphValidationError(
            [f"candidate node IDs collide with existing nodes: {sorted(node_collisions)}"]
        )

    edge_collisions = existing_edge_ids.intersection(candidate_edge_ids)
    if edge_collisions:
        raise GraphValidationError(
            [f"proposed edge IDs collide with existing edges: {sorted(edge_collisions)}"]
        )

    combined = PathwayGraph.model_validate(
        {
            **existing_graph.model_dump(),
            "nodes": [
                *(node.model_dump() for node in existing_graph.nodes),
                *(node.model_dump() for node in parsed_nodes),
            ],
            "edges": [
                *(edge.model_dump() for edge in existing_graph.edges),
                *(edge.model_dump() for edge in parsed_edges),
            ],
        }
    )

    return validate_graph(combined)


def apply_candidate_proposal(
    request: GraphGenerationRequest | dict[str, Any],
    proposal: CandidateProposal | dict[str, Any],
) -> PathwayGraph:
    if isinstance(request, dict):
        try:
            request = GraphGenerationRequest.model_validate(request)
        except ValidationError as exc:
            raise GraphValidationError(
                [f"invalid graph generation request: {exc}"]
            ) from exc

    if isinstance(proposal, dict):
        try:
            proposal = CandidateProposal.model_validate(proposal)
        except ValidationError as exc:
            raise GraphValidationError(
                [f"malformed candidate proposal: {exc}"]
            ) from exc

    errors: list[str] = []

    # Enforce the exact requested number of candidate nodes.
    if len(proposal.candidate_nodes) != request.candidate_node_count:
        errors.append(
            f"candidate proposal contains {len(proposal.candidate_nodes)} "
            f"nodes, expected exactly {request.candidate_node_count}"
        )

    if len(proposal.candidate_nodes) > MAX_CANDIDATE_NODES:
        errors.append(
            f"candidate proposal exceeds the {MAX_CANDIDATE_NODES}-node limit"
        )

    if len(proposal.proposed_edges) > MAX_PROPOSED_EDGES:
        errors.append(
            f"candidate proposal exceeds the {MAX_PROPOSED_EDGES}-edge limit"
        )

    candidate_ids = {
        candidate.candidate_id for candidate in proposal.candidate_nodes
    }

    existing_graph = request.current_graph
    existing_node_ids: set[str] = set()

    if existing_graph is not None:
        validate_graph(existing_graph)
        existing_node_ids = {
            node.node_id for node in existing_graph.nodes
        }

    # Candidate IDs are temporary identifiers and must not collide with
    # existing permanent node IDs.
    for candidate in proposal.candidate_nodes:
        if candidate.candidate_id in existing_node_ids:
            errors.append(
                f"candidate_id '{candidate.candidate_id}' collides with "
                "an existing graph node_id"
            )

    # Validate candidate prerequisites.
    for candidate in proposal.candidate_nodes:
        seen_prerequisites: set[tuple[str, str]] = set()

        for prerequisite in candidate.prerequisite_refs:
            prerequisite_key = (
                prerequisite.kind,
                prerequisite.target_id,
            )

            if prerequisite_key in seen_prerequisites:
                errors.append(
                    f"candidate node '{candidate.candidate_id}' has a "
                    f"duplicate prerequisite reference to "
                    f"'{prerequisite.target_id}'"
                )
            seen_prerequisites.add(prerequisite_key)

            if prerequisite.kind == "candidate":
                prerequisite_id = prerequisite.candidate_id

                if prerequisite_id == candidate.candidate_id:
                    errors.append(
                        f"candidate node '{candidate.candidate_id}' cannot "
                        "have itself as a prerequisite"
                    )
                elif prerequisite_id not in candidate_ids:
                    errors.append(
                        f"candidate node '{candidate.candidate_id}' "
                        f"references missing candidate prerequisite "
                        f"'{prerequisite_id}'"
                    )

            elif prerequisite.kind == "existing_node":
                prerequisite_id = prerequisite.node_id

                if existing_graph is None:
                    errors.append(
                        f"candidate node '{candidate.candidate_id}' "
                        f"references existing node '{prerequisite_id}' "
                        "in an initial generation request"
                    )
                elif prerequisite_id not in existing_node_ids:
                    errors.append(
                        f"candidate node '{candidate.candidate_id}' "
                        f"references missing existing prerequisite node "
                        f"'{prerequisite_id}'"
                    )

    # Validate proposed edge endpoints and self-loops.
    for edge in proposal.proposed_edges:
        for endpoint_name, endpoint in (
            ("source", edge.source),
            ("target", edge.target),
        ):
            if endpoint.kind == "candidate":
                if endpoint.candidate_id not in candidate_ids:
                    errors.append(
                        f"proposed edge '{edge.edge_key}' references "
                        f"missing candidate {endpoint_name} "
                        f"'{endpoint.candidate_id}'"
                    )
            elif endpoint.kind == "existing_node":
                if existing_graph is None:
                    errors.append(
                        f"proposed edge '{edge.edge_key}' references "
                        f"existing {endpoint_name} node "
                        f"'{endpoint.node_id}' in an initial generation request"
                    )
                elif endpoint.node_id not in existing_node_ids:
                    errors.append(
                        f"proposed edge '{edge.edge_key}' references "
                        f"missing existing {endpoint_name} node "
                        f"'{endpoint.node_id}'"
                    )

        if (
            edge.source.kind == edge.target.kind
            and edge.source.target_id == edge.target.target_id
        ):
            errors.append(
                f"proposed edge '{edge.edge_key}' is a self-loop on "
                f"'{edge.source.target_id}'"
            )

    # Expansion requests must connect at least one candidate to the selected
    # existing nodes. Connectivity here is undirected so either edge direction
    # is acceptable for reaching an expansion anchor.
    if existing_graph is not None and request.current_node_ids_to_expand:
        expansion_ids = set(request.current_node_ids_to_expand)

        adjacency: dict[str, set[str]] = {
            candidate.candidate_id: set()
            for candidate in proposal.candidate_nodes
        }

        for expansion_id in expansion_ids:
            adjacency.setdefault(expansion_id, set())

        for edge in proposal.proposed_edges:
            source_id = edge.source.target_id
            target_id = edge.target.target_id

            if source_id in adjacency and target_id in adjacency:
                adjacency[source_id].add(target_id)
                adjacency[target_id].add(source_id)

        for candidate in proposal.candidate_nodes:
            for prerequisite in candidate.prerequisite_refs:
                prerequisite_id = prerequisite.target_id

                if (
                    candidate.candidate_id in adjacency
                    and prerequisite_id in adjacency
                ):
                    adjacency[candidate.candidate_id].add(prerequisite_id)
                    adjacency[prerequisite_id].add(candidate.candidate_id)

        visited = set(expansion_ids)
        queue = deque(sorted(expansion_ids))

        while queue:
            current_id = queue.popleft()

            for neighbor_id in adjacency.get(current_id, set()):
                if neighbor_id not in visited:
                    visited.add(neighbor_id)
                    queue.append(neighbor_id)

        unreachable_candidates = sorted(
            candidate.candidate_id
            for candidate in proposal.candidate_nodes
            if candidate.candidate_id not in visited
        )

        if unreachable_candidates:
            if len(unreachable_candidates) == len(proposal.candidate_nodes):
                errors.append(
                    "expansion proposal must contain at least one connection "
                    f"to selected expansion nodes {sorted(expansion_ids)}"
                )
            else:
                errors.append(
                    "expansion proposal contains disconnected candidate nodes "
                    f"{unreachable_candidates} not connected to expansion "
                    f"nodes {sorted(expansion_ids)}"
                )

    if errors:
        raise GraphValidationError(errors)

    # Allocate permanent IDs for candidate nodes.
    candidate_to_node_id = {
        candidate.candidate_id: f"node_{uuid.uuid4().hex}"
        for candidate in proposal.candidate_nodes
    }

    def resolve_endpoint(endpoint) -> str:
        if endpoint.kind == "existing_node":
            return endpoint.node_id  # type: ignore[return-value]
        return candidate_to_node_id[endpoint.candidate_id]  # type: ignore[index]

    new_nodes: list[Node] = []

    for candidate in proposal.candidate_nodes:
        prerequisite_ids = [
            resolve_endpoint(prerequisite)
            for prerequisite in candidate.prerequisite_refs
        ]

        new_nodes.append(
            Node(
                node_id=candidate_to_node_id[candidate.candidate_id],
                node_type=candidate.node_type,
                title=candidate.title,
                description=candidate.description,
                duration_estimate_months=candidate.duration_estimate_months,
                cost_estimate=candidate.cost_estimate,
                cost_currency=candidate.cost_currency,
                milestone_ids=[],
                institution_ids=[],
                evidence_ids=[],
                prerequisite_node_ids=prerequisite_ids,
            )
        )

    new_edges: list[Edge] = []

    for proposed_edge in proposal.proposed_edges:
        new_edges.append(
            Edge(
                edge_id=f"edge_{uuid.uuid4().hex}",
                source_node_id=resolve_endpoint(proposed_edge.source),
                target_node_id=resolve_endpoint(proposed_edge.target),
                edge_type=proposed_edge.edge_type,
                condition=proposed_edge.condition,
            )
        )

    # Ensure every candidate prerequisite is represented by a visible
    # prerequisite edge. Avoid adding duplicate relationships.
    existing_prerequisite_pairs: set[tuple[str, str]] = set()

    if existing_graph is not None:
        for edge in existing_graph.edges:
            if edge.edge_type in DEPENDENCY_EDGE_TYPES:
                existing_prerequisite_pairs.add(
                    (edge.source_node_id, edge.target_node_id)
                )

    for edge in new_edges:
        if edge.edge_type in DEPENDENCY_EDGE_TYPES:
            existing_prerequisite_pairs.add(
                (edge.source_node_id, edge.target_node_id)
            )

    for candidate in proposal.candidate_nodes:
        target_id = candidate_to_node_id[candidate.candidate_id]

        for prerequisite in candidate.prerequisite_refs:
            source_id = resolve_endpoint(prerequisite)
            prerequisite_pair = (source_id, target_id)

            if prerequisite_pair not in existing_prerequisite_pairs:
                new_edges.append(
                    Edge(
                        edge_id=f"edge_{uuid.uuid4().hex}",
                        source_node_id=source_id,
                        target_node_id=target_id,
                        edge_type="prerequisite",
                        condition=None,
                    )
                )
                existing_prerequisite_pairs.add(prerequisite_pair)

    if existing_graph is None:
        combined = PathwayGraph(
            pathway_id=f"pathway_{uuid.uuid4().hex}",
            nodes=new_nodes,
            edges=new_edges,
            target_outcome=None,
            schema_version="1.0",
        )
    else:
        combined = PathwayGraph.model_validate(
            {
                **existing_graph.model_dump(),
                "nodes": [
                    *(node.model_dump() for node in existing_graph.nodes),
                    *(node.model_dump() for node in new_nodes),
                ],
                "edges": [
                    *(edge.model_dump() for edge in existing_graph.edges),
                    *(edge.model_dump() for edge in new_edges),
                ],
            }
        )

    return validate_graph(combined)

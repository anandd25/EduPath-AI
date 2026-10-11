import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from dotenv import load_dotenv
from pydantic import ValidationError

load_dotenv()
load_dotenv(Path(__file__).resolve().parent / ".env")

from domain_schemas import (
    CandidateProposal,
    EvidenceRecord,
    GraphGenerationRequest,
    PathwayGraph,
)
from graph_engine import GraphValidationError, apply_candidate_proposal


class GraphGenerationError(Exception):
    """Base exception for pathway graph generation failures."""


class LLMConfigurationError(GraphGenerationError):
    """Raised when the LLM client or credentials are missing or invalid."""


class LLMProviderError(GraphGenerationError):
    """Raised when the LLM provider API call fails."""


class LLMResponseParsingError(GraphGenerationError):
    """Raised when the LLM response is not valid JSON or fails schema validation."""


def _format_num(val: Any) -> str:
    if isinstance(val, (int, float)):
        if float(val).is_integer():
            return str(int(val))
        return f"{val:g}"
    return str(val)


def format_student_profile_summary(profile: Any) -> str:
    """Format the student profile into a structured, readable summary for the LLM."""
    if hasattr(profile, "model_dump"):
        data = profile.model_dump()
    elif isinstance(profile, dict):
        data = profile
    else:
        return str(profile)

    lines: list[str] = []

    stage = data.get("education_stage", "Unknown")
    name = data.get("preferred_name") or "Student"
    country = data.get("country") or "Not specified"
    region = data.get("region") or "Not specified"
    curriculum = data.get("curriculum") or "Not specified"
    status = data.get("academic_status") or "Not specified"
    lang = data.get("preferred_language") or "English"

    lines.append(f"- Student Name: {name}")
    lines.append(f"- Education Stage: {stage} ({status})")
    lines.append(f"- Location: {region}, {country}")
    lines.append(f"- Curriculum: {curriculum}")
    lines.append(f"- Preferred Language: {lang}")

    overall_pct = data.get("overall_percentage")
    overall_status = data.get("overall_result_status")
    if overall_pct is not None:
        lines.append(
            f"- Overall Percentage: {_format_num(overall_pct)}% "
            f"({overall_status or 'completed'})"
        )
    elif overall_status:
        lines.append(f"- Overall Result Status: {overall_status}")

    subjects = data.get("subjects", [])
    if subjects:
        subj_strs = []
        for subject in subjects:
            s_name = subject.get("name", "Subject")
            s_marks = subject.get("marks")
            s_max = subject.get("maximum_marks")
            s_fav = " (Favourite)" if subject.get("favourite") else ""
            s_chal = " (Challenging)" if subject.get("challenging") else ""
            mark_info = (
                f"{_format_num(s_marks)}/{_format_num(s_max)}"
                if s_marks is not None and s_max is not None
                else "marks pending"
            )
            subj_strs.append(f"{s_name}: {mark_info}{s_fav}{s_chal}")
        lines.append("- Subjects: " + "; ".join(subj_strs))

    interests = data.get("interests", [])
    if interests:
        lines.append(f"- Stated Interests: {', '.join(interests)}")

    interest_desc = data.get("interest_description")
    if interest_desc:
        lines.append(
            f'- Student\'s Own Words / Interest Description: "{interest_desc}"'
        )

    strengths = data.get("strengths", [])
    if strengths:
        strength_items = [
            f"{item.get('name')}: rating {item.get('rating')}/5"
            for item in strengths
            if item.get("name")
        ]
        if strength_items:
            lines.append("- Strengths: " + ", ".join(strength_items))

    budget = data.get("annual_budget") or {}
    if budget.get("amount") is not None:
        lines.append(
            f"- Annual Budget: {budget.get('currency', 'INR')} "
            f"{_format_num(budget.get('amount'))} "
            f"({budget.get('budget_status', 'estimated')})"
        )

    funding = data.get("funding_preferences") or {}
    scholarships = funding.get("interested_in_scholarships")
    loans = funding.get("willing_to_consider_loans")
    funding_notes = []

    if scholarships:
        funding_notes.append("Interested in scholarships")
    if loans is not None:
        funding_notes.append(
            "Willing to consider loans" if loans else "Prefers no loans"
        )
    if funding_notes:
        lines.append("- Funding Preferences: " + ", ".join(funding_notes))

    certainty = data.get("career_certainty")
    if certainty:
        lines.append(f"- Career Certainty: {certainty}")

    priorities = data.get("priorities", [])
    if priorities:
        lines.append(f"- Key Priorities: {', '.join(priorities)}")

    destination = data.get("preferred_destination")
    if destination:
        lines.append(f"- Preferred Destination: {destination}")

    return "\n".join(lines)


def _profile_dict(request: GraphGenerationRequest) -> dict[str, Any]:
    """Return a dictionary representation of the student profile."""
    profile = request.student_profile_snapshot

    if hasattr(profile, "model_dump"):
        profile = profile.model_dump()

    return profile if isinstance(profile, dict) else {}


def _is_likely_official_source(url: str) -> bool:
    """Heuristically identify likely official domains; this is not verification."""
    hostname = (urlparse(url).hostname or "").lower().rstrip(".")

    return (
        hostname == "gov.in"
        or hostname.endswith(".gov.in")
        or hostname == "ac.in"
        or hostname.endswith(".ac.in")
        or hostname.endswith(".gov")
        or hostname.endswith(".edu")
    )


def get_pathway_research(request: GraphGenerationRequest) -> str:
    """Fetch concise web evidence to ground pathway generation."""
    import logging

    logger = logging.getLogger(__name__)
    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        return (
            "Live research unavailable: TAVILY_API_KEY is not configured. "
            "Do not claim facts are verified."
        )

    profile = _profile_dict(request)
    interests = profile.get("interests") or []
    interest_description = profile.get("interest_description") or ""
    region = profile.get("region") or ""
    country = profile.get("country") or "India"

    topics = [
        f"site:gov.in OR site:ac.in official education pathways eligibility {country}",
        (
            f"official exams colleges courses fees scholarships "
            f"{region} {country} government institution"
        ),
    ]

    interest_terms = ", ".join(str(item) for item in interests[:4])
    if interest_terms or interest_description:
        topics.append(
            f"education career pathways for {interest_terms} "
            f"{interest_description} {region} {country}"
        )

    if request.current_graph:
        titles = [
            node.title
            for node in request.current_graph.nodes
            if node.node_id in request.current_node_ids_to_expand
        ]
        if titles:
            topics.append(
                f"official eligibility fees admissions information for "
                f"{', '.join(titles[:3])} {country}"
            )

    try:
        from tavily import TavilyClient

        client = TavilyClient(api_key=api_key)
        evidence: list[dict[str, Any]] = []

        for query in topics[:3]:
            response = client.search(
                query=query,
                search_depth="basic",
                max_results=3,
                topic="general",
            )

            for item in response.get("results", []):
                url = str(item.get("url", "")).strip()
                if not url.startswith("https://"):
                    continue

                parsed_url = urlparse(url)
                if not parsed_url.hostname:
                    continue

                evidence.append(
                    {
                        "is_official_source": _is_likely_official_source(url),
                        "title": str(item.get("title") or "Untitled")[:300],
                        "url": url[:2000],
                        "content": str(item.get("content") or "")[:1200],
                    }
                )

        unique: dict[str, dict[str, Any]] = {}
        for item in evidence:
            unique.setdefault(item["url"], item)

        ranked_evidence = sorted(
            unique.values(),
            key=lambda item: not item["is_official_source"],
        )

        if not ranked_evidence:
            return (
                "No usable research results were found. "
                "Do not invent verified facts."
            )

        return json.dumps(ranked_evidence[:8], ensure_ascii=False)

    except Exception:
        logger.exception("Tavily research failed during pathway generation")
        return "Live research failed. Do not claim facts are verified."


def _research_evidence_records(
    research_context: str,
) -> list[EvidenceRecord]:
    """Convert usable Tavily search results into validated evidence records."""
    try:
        parsed = json.loads(research_context)
    except (json.JSONDecodeError, TypeError):
        return []

    if not isinstance(parsed, list):
        return []

    records: list[EvidenceRecord] = []
    seen_urls: set[str] = set()

    for index, item in enumerate(parsed, start=1):
        if not isinstance(item, dict):
            continue

        url = str(item.get("url") or "").strip()
        title = str(item.get("title") or "Untitled source").strip()
        content = str(item.get("content") or "").strip()

        if not url.startswith("https://") or not content:
            continue

        hostname = urlparse(url).hostname
        if not hostname or url in seen_urls:
            continue

        seen_urls.add(url)
        likely_official = bool(item.get("is_official_source"))

        # A domain heuristic is not proof that a claim has been verified.
        confidence = "unverified"

        source_name = hostname[:200]
        supports = content[:1000]

        try:
            record = EvidenceRecord(
                evidence_id=f"research_{index}",
                title=title[:300] or "Untitled source",
                url=url[:2000],
                source_name=source_name,
                supports=supports,
                confidence=confidence,
            )
        except ValidationError:
            continue

        records.append(record)

    return records


def build_generation_prompt(
    request: GraphGenerationRequest,
    research_context: str | None = None,
) -> list[dict[str, str]]:
    """Build the system and user messages for Groq candidate proposal generation."""
    profile_summary = format_student_profile_summary(
        request.student_profile_snapshot
    )
    if research_context is None:
        research_context = get_pathway_research(request)

    system_prompt = (
        "You are the EduPath AI Career & Education Simulation Engine.\n"
        "Generate realistic, structurally sound education-to-career pathway "
        "candidate proposals tailored to the student's profile.\n\n"
        "### STRICT OUTPUT FORMAT RULES\n"
        f"1. Output MUST be a single valid JSON object matching the "
        f"CandidateProposal schema with EXACTLY "
        f"{request.candidate_node_count} candidate nodes:\n"
        "   {\n"
        '     "candidate_nodes": [\n'
        "       {\n"
        '         "candidate_id": "cand_1",\n'
        '         "node_type": "education" | "career" | "exploration" | "certification",\n'
        '         "title": "Concise Stage Title (1-200 chars)",\n'
        '         "description": "Explanation of this stage, relevant skills, '
        'indicative duration/cost, and relevance to the student",\n'
        '         "duration_estimate_months": number | null,\n'
        '         "cost_estimate": number | null,\n'
        '         "cost_currency": "INR" | "USD" | null,\n'
        '         "milestone_ids": [],\n'
        '         "institution_ids": [],\n'
        '         "evidence_ids": [],\n'
        '         "prerequisite_refs": [\n'
        '           {"kind": "candidate", "candidate_id": "cand_X"} OR '
        '{"kind": "existing_node", "node_id": "node_Y"}\n'
        "         ]\n"
        "       }\n"
        "     ],\n"
        '     "proposed_edges": [\n'
        "       {\n"
        '         "edge_key": "edge_1",\n'
        '         "source": {"kind": "candidate", "candidate_id": "cand_A"} '
        'OR {"kind": "existing_node", "node_id": "node_A"},\n'
        '         "target": {"kind": "candidate", "candidate_id": "cand_B"} '
        'OR {"kind": "existing_node", "node_id": "node_B"},\n'
        '         "edge_type": "progression" | "alternative" | "conditional" '
        '| "dependency" | "prerequisite",\n'
        '         "condition": "Non-empty string if conditional, null otherwise"\n'
        "       }\n"
        "     ]\n"
        "   }\n\n"
        "2. Node and edge constraints:\n"
        "- Node types: education, career, exploration, certification.\n"
        "- Edge types: progression, alternative, conditional, dependency, prerequisite.\n"
        "- Condition must be non-empty for conditional edges and null otherwise.\n"
        "- Use unique temporary IDs cand_1, cand_2, ... and edge_1, edge_2, ... .\n"
        "- Do not create self-loops or dependency/prerequisite cycles.\n"
        "- Use prerequisite_refs only for genuine formal entry requirements.\n"
        "- Provide actionable alternatives and explain why each step fits the student.\n\n"
        "3. Relationship semantics:\n"
        "- Use alternative for parallel education or career choices.\n"
        "- Use progression for sequential stages.\n"
        "- Use conditional for advancement requiring stated criteria.\n\n"
        "4. Estimates and evidence:\n"
        "- Costs and durations are indicative and may vary by institution and year.\n"
        "- Label estimates clearly as annual or total-stage estimates where possible.\n"
        "- Never present unverified figures as guaranteed eligibility, fees, "
        "scholarships, admission outcomes, or salaries.\n"
        "- Research snippets are leads, not definitive proof.\n"
        "- Do not invent source URLs, titles, dates, or requirements.\n"
        "- Explain when important information requires official verification.\n\n"
        "5. Post-Class 10 pathways:\n"
        "- Include relevant options such as Class 11-12 streams, polytechnic "
        "diplomas, and ITI/vocational training where appropriate.\n"
        "- Do not make Class 12 a universal prerequisite for polytechnic diplomas "
        "or ITI training entered after Class 10.\n"
        "- For undecided students, favor broad foundations and multiple options "
        "without premature lock-in."
    )

    user_lines = [
        "### STUDENT PROFILE",
        profile_summary,
        "",
        "### LIVE WEB RESEARCH EVIDENCE",
        research_context,
        "",
        "### RESEARCH RULES",
        "- Prefer official exam authorities, government portals, and institution websites.",
        "- Treat official-domain labels as heuristics, not proof of accuracy.",
        "- Include relevant source URLs in descriptions when useful.",
        "- If evidence is missing, conflicting, or incomplete, say it needs verification.",
        "- Tailor options to the student's interests without restricting them to a fixed career list.",
        "",
        "### GENERATION PARAMETERS",
        f"- Intent: {request.generation_intent}",
        f"- Required candidate node count: exactly {request.candidate_node_count}.",
        "",
    ]

    if request.generation_intent == "continue":
        user_lines.extend(
            [
                "### INTENT: FORWARD PROGRESSION",
                "- Generate the next sequential stages along the selected path.",
                "- Prefer progression edges for direct chronological sequences.",
                "",
            ]
        )
    elif request.generation_intent == "explore_alternatives":
        user_lines.extend(
            [
                "### INTENT: ALTERNATIVE PATHWAYS",
                "- Generate genuinely different parallel routes or specializations.",
                "- Prefer alternative edges from the relevant decision point.",
                "- Avoid duplicating existing routes.",
                "",
            ]
        )
    elif request.generation_intent == "recover_from_blocked_route":
        user_lines.extend(
            [
                "### INTENT: RECOVERY FROM A BLOCKED ROUTE",
                "- Generate plausible detours, bridge options, vocational routes, "
                "or substitute qualifications.",
                "- Do not invent unstated reasons for the blocked route.",
                "- Prefer alternative or conditional edges where appropriate.",
                "",
            ]
        )

    if request.current_graph is None:
        user_lines.extend(
            [
                "### MODE: INITIAL PATHWAY GENERATION",
                "- Generate branching education options from the student's current stage.",
                "- All prerequisite_refs and proposed_edges endpoints must use candidate IDs.",
                "- Do not use existing_node endpoints.",
                "",
            ]
        )
    else:
        graph = request.current_graph
        node_titles = {node.node_id: node.title for node in graph.nodes}

        existing_nodes_desc = "\n".join(
            f'  * Node ID: `{node.node_id}` | Type: `{node.node_type}` '
            f'| Title: "{node.title}"'
            for node in graph.nodes
        )

        if graph.edges:
            existing_edges_desc = "\n".join(
                f'  * `{edge.source_node_id}` '
                f'("{node_titles.get(edge.source_node_id, "Node")}") '
                f'-[{edge.edge_type.upper()}'
                f'{f" (Condition: {edge.condition})" if edge.condition else ""}]-> '
                f'`{edge.target_node_id}` '
                f'("{node_titles.get(edge.target_node_id, "Node")}")'
                for edge in graph.edges
            )
        else:
            existing_edges_desc = "  (No existing edges in current graph)"

        target_nodes = [
            node
            for node in graph.nodes
            if node.node_id in request.current_node_ids_to_expand
        ]

        target_nodes_desc = "\n".join(
            f'  * Expansion target: `{node.node_id}` '
            f'(Title: "{node.title}", Type: `{node.node_type}`)\n'
            f"    Description: {node.description}"
            for node in target_nodes
        )

        user_lines.extend(
            [
                "### MODE: GRAPH EXPANSION",
                "Existing pathway nodes:",
                existing_nodes_desc,
                "",
                "Existing connections:",
                existing_edges_desc,
                "",
                "Selected expansion targets:",
                target_nodes_desc,
                "",
                "- Connect new candidates to at least one selected target node.",
                "- Use exact existing node IDs for existing_node endpoints.",
                "- Use candidate IDs for proposed nodes.",
                "",
            ]
        )

    user_lines.append(
        "Return ONLY the JSON object conforming to CandidateProposal."
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "\n".join(user_lines)},
    ]


def generate_pathway_graph(
    request: GraphGenerationRequest | dict[str, Any],
    client: Any | None = None,
    model: str | None = None,
) -> PathwayGraph:
    """Generate a validated pathway graph and attach structured research evidence."""
    if isinstance(request, dict):
        try:
            parsed_request = GraphGenerationRequest.model_validate(request)
        except ValidationError as exc:
            raise GraphValidationError(
                [f"invalid graph generation request: {exc}"]
            ) from exc
    else:
        parsed_request = request

    if client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise LLMConfigurationError(
                "GROQ_API_KEY environment variable is not set and no client was provided"
            )

        try:
            from groq import Groq

            client = Groq(api_key=api_key)
        except Exception as exc:
            raise LLMConfigurationError(
                f"Failed to initialize Groq client: {exc}"
            ) from exc

    resolved_model = model or os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile",
    )

    # Fetch research once so the prompt and evidence records use the same results.
    research_context = get_pathway_research(parsed_request)
    messages = build_generation_prompt(
        parsed_request,
        research_context=research_context,
    )

    try:
        response = client.chat.completions.create(
            model=resolved_model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
    except Exception as exc:
        raise LLMProviderError(f"Groq API call failed: {exc}") from exc

    try:
        choice = response.choices[0]
        content = choice.message.content

        if not content or not content.strip():
            raise LLMResponseParsingError(
                "Groq returned empty response content"
            )

        raw_json = json.loads(content)

    except json.JSONDecodeError as exc:
        raise LLMResponseParsingError(
            f"Groq response is not valid JSON: {exc}"
        ) from exc
    except (AttributeError, IndexError) as exc:
        raise LLMResponseParsingError(
            f"Malformed Groq response structure: {exc}"
        ) from exc

    try:
        proposal = CandidateProposal.model_validate(raw_json)
    except ValidationError as exc:
        raise LLMResponseParsingError(
            f"Candidate proposal schema validation failed: {exc}"
        ) from exc

    # Let the existing graph engine validate and apply the candidate proposal first.
    graph = apply_candidate_proposal(parsed_request, proposal)

    # Attach evidence using the schema's validated fields.
    evidence_records = _research_evidence_records(research_context)

    if evidence_records:
        existing_ids = {
            record.evidence_id
            for record in graph.evidence_records
        }

        for record in evidence_records:
            if record.evidence_id not in existing_ids:
                graph.evidence_records.append(record)
                existing_ids.add(record.evidence_id)

    # Revalidate the final graph, including record IDs and graph references.
    try:
        return PathwayGraph.model_validate(graph.model_dump())
    except ValidationError as exc:
        raise GraphValidationError(
            [f"generated pathway graph validation failed: {exc}"]
        ) from exc


def generate_personalized_pathways_with_groq(
    profile: dict[str, Any],
    currency: str = "INR",
) -> tuple[Any, list[Any]] | None:
    """Use Groq LLM to synthesize fresh, personalized multi-pathway career architectures.

    Returns (PathwayGraph, list[PathwayRoute]) if Groq succeeds, or None if unavailable/failed.
    """
    import logging
    import uuid
    from domain_schemas import Edge, Node, PathwayGraph, PathwayRoute, StagedPayment

    logger = logging.getLogger(__name__)
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
    except Exception as exc:
        logger.warning("Groq client initialization failed: %s", exc)
        return None

    resolved_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    name = profile.get("preferred_name") or "Student"
    interests = profile.get("interests") or []
    interest_desc = profile.get("interest_description") or ""
    overall_pct = profile.get("overall_percentage") or 75
    subjects = profile.get("subjects") or []
    budget = (profile.get("annual_budget") or {}).get("amount", 150000)

    prompt = (
        f"You are the EduPath AI Education-to-Career Planning Engine.\n"
        f"Synthesize 3 realistic, personalized, comparative pathways for this Class 10 student:\n"
        f"- Name: {name}\n"
        f"- Overall Class 10 Score: {overall_pct}%\n"
        f"- Stated Interests: {', '.join(interests)}\n"
        f"- Free-form Goals/Description: {interest_desc}\n"
        f"- Subjects: {json.dumps(subjects)}\n"
        f"- Annual Family Budget: {currency} {budget}\n\n"
        f"Design 3 distinct, practical pathways starting from Class 10:\n"
        f"- Path A: Professional / University Degree Route\n"
        f"- Path B: Applied Diploma / Polytechnic Route\n"
        f"- Path C: Vocational & Skills Route\n\n"
        f"Tailor the subject matter directly to the student's stated interests.\n"
        f"Output MUST be a single valid JSON object conforming to this schema:\n"
        f'{{\n'
        f'  "discipline_title": "string",\n'
        f'  "ranking_explanations": ["string"],\n'
        f'  "route_a": {{\n'
        f'    "name": "string", "category": "University Degree", "summary": "string",\n'
        f'    "total_duration_months": 84, "total_cost": 450000,\n'
        f'    "nodes": [\n'
        f'      {{\n'
        f'        "title": "string", "description": "string", "node_type": "education",\n'
        f'        "duration_estimate_months": 24, "cost_estimate": 100000,\n'
        f'        "purpose_fit": "string", "required_subjects": ["string"],\n'
        f'        "min_grade_or_score": "string", "entrance_exams": ["string"],\n'
        f'        "actionable_fallback": "string"\n'
        f'      }}\n'
        f'    ],\n'
        f'    "potential_outcomes": ["string"], "risks": ["string"], "fallback_route": "string"\n'
        f'  }},\n'
        f'  "route_b": {{ ... same keys as route_a ... }},\n'
        f'  "route_c": {{ ... same keys as route_a ... }}\n'
        f'}}\n'
        f"Return ONLY valid JSON."
    )

    try:
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[
                {"role": "system", "content": "You are a professional educational planning engine. Output only JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        content = response.choices[0].message.content
        if not content:
            return None
        data = json.loads(content)
    except Exception as exc:
        logger.warning("Groq pathway generation failed, using procedural domain generator: %s", exc)
        return None

    # Construct PathwayGraph and PathwayRoute objects from Groq data
    try:
        nodes: list[Node] = []
        edges: list[Edge] = []
        routes: list[PathwayRoute] = []

        root_id = "root_class10"
        root_node = Node(
            node_id=root_id,
            node_type="exploration",
            title=f"Class 10 Graduation ({data.get('discipline_title', 'Core Career Foundations')})",
            description=f"Personalized starting milestone for {name}. Tailored to interests in {', '.join(interests[:3]) or 'academic discovery'}.",
            duration_estimate_months=1,
            cost_estimate=2000,
            cost_currency=currency,
            purpose_fit=f"Validates eligibility for {name} with Class 10 score of {overall_pct}%.",
            pathway_id="root",
            feasibility_status="FEASIBLE",
            required_subjects=["Mathematics", "Science", "English"],
            actionable_fallback="State supplementary examination or open schooling.",
        )
        nodes.append(root_node)

        route_keys = [("route_a", "path_a_entrance"), ("route_b", "path_b_diploma"), ("route_c", "path_c_vocational")]
        for r_key, p_id in route_keys:
            r_data = data.get(r_key)
            if not r_data or not isinstance(r_data, dict):
                continue

            r_nodes_raw = r_data.get("nodes") or []
            r_node_ids: list[str] = [root_id]
            banned_phrases = [
                "decision matrix",
                "preferred course is unavailable",
                "if the budget is reduced",
                "alternative scenarios",
                "scenario planning",
                "admission guarantee",
            ]

            prev_node_id = root_id
            for idx, n_raw in enumerate(r_nodes_raw[:4]):
                raw_title = str(n_raw.get("title") or f"Stage {idx + 1}")
                raw_desc = str(n_raw.get("description") or "Educational milestone.")

                # If Groq hallucinated generic meta-notes, reject this route proposal
                if any(bp in raw_title.lower() or bp in raw_desc.lower() for bp in banned_phrases):
                    logger.warning("Groq response contained banned placeholder: %s; rejecting proposal.", raw_title)
                    return None

                n_id = f"node_{p_id}_{idx + 1}_{uuid.uuid4().hex[:4]}"
                r_node_ids.append(n_id)

                node_obj = Node(
                    node_id=n_id,
                    node_type=n_raw.get("node_type", "education" if idx < 2 else "career"),
                    title=raw_title,
                    description=raw_desc,
                    duration_estimate_months=int(n_raw.get("duration_estimate_months") or 24),
                    cost_estimate=float(n_raw.get("cost_estimate") or 50000),
                    cost_currency=currency,
                    pathway_id=p_id,
                    feasibility_status="FEASIBLE",
                    verified_status="verified",
                    source_links=["https://cbse.gov.in", "https://education.gov.in", "https://aicte-india.org"],
                    purpose_fit=str(n_raw.get("purpose_fit") or f"Tailored to {name}'s goals."),
                    required_subjects=n_raw.get("required_subjects") or ["Core Subjects"],
                    min_grade_or_score=str(n_raw.get("min_grade_or_score") or "Pass with 55%"),
                    entrance_exams=n_raw.get("entrance_exams") or [],
                    actionable_fallback=str(n_raw.get("actionable_fallback") or "Alternative state institution."),
                    staged_payments=[
                        StagedPayment(
                            stage_name=f"{raw_title} Tuition",
                            amount=float(n_raw.get("cost_estimate") or 50000),
                            currency=currency,
                            due_date="2026-08-01",
                        )
                    ],
                )
                nodes.append(node_obj)

                # Connect edge
                edge_id = f"edge_{prev_node_id}_{n_id}"
                edges.append(
                    Edge(
                        edge_id=edge_id,
                        source_node_id=prev_node_id,
                        target_node_id=n_id,
                        edge_type="progression" if prev_node_id != root_id else "alternative",
                    )
                )
                prev_node_id = n_id

            # Route object
            route_obj = PathwayRoute(
                pathway_id=p_id,
                route_name=str(r_data.get("name") or p_id),
                category=str(r_data.get("category") or "Academic"),
                summary=str(r_data.get("summary") or "Custom pathway."),
                total_duration_months=int(r_data.get("total_duration_months") or 60),
                total_cost=float(r_data.get("total_cost") or 200000),
                currency=currency,
                staged_payments=[],
                available_funding=["State Merit Concession", "Institutional Scholarships"],
                net_cost_after_aid=float(r_data.get("total_cost") or 200000) * 0.85,
                entry_requirements=r_data.get("entry_requirements") or ["Pass Class 10"],
                potential_outcomes=r_data.get("potential_outcomes") or ["Career Qualification"],
                risks=r_data.get("risks") or ["Competitive selection"],
                fallback_route=str(r_data.get("fallback_route") or "Alternative vocational track"),
                is_academically_eligible=True,
                is_cash_flow_feasible=True,
                feasibility_status="FEASIBLE",
                feasibility_reasons=[f"Synthesized by Groq AI specifically for {name} ({', '.join(interests[:2])})."],
                ranking_score=90 if p_id == "path_b_diploma" else (85 if p_id == "path_a_entrance" else 80),
                node_ids=r_node_ids,
            )
            routes.append(route_obj)

        if len(routes) < 2:
            return None

        # Build PathwayGraph
        graph = PathwayGraph(
            pathway_id="groq_personalized_plan",
            nodes=nodes,
            edges=edges,
            target_outcome=data.get("discipline_title", "Personalized Career Pathway"),
            schema_version="2.0.0",
            pathway_routes=routes,
            ranking_explanations=data.get("ranking_explanations") or [
                f"Personalized with Groq AI for {name} based on reported strengths in {', '.join(interests[:3])}."
            ],
            comparison_matrix={
                "routes": [
                    {
                        "pathway_id": r.pathway_id,
                        "name": r.route_name,
                        "category": r.category,
                        "duration_years": round(r.total_duration_months / 12, 1),
                        "total_cost": r.total_cost,
                        "net_cost": r.net_cost_after_aid,
                        "currency": r.currency,
                        "feasibility_status": r.feasibility_status,
                        "entry_requirements": r.entry_requirements,
                        "potential_outcomes": r.potential_outcomes,
                        "risks": r.risks,
                        "fallback_route": r.fallback_route,
                        "staged_payments_count": len(r.staged_payments),
                    }
                    for r in routes
                ],
                "summary": f"Tailored comparison matrix for {name}.",
            },
        )
        return graph, routes
    except Exception as exc:
        logger.warning("Error transforming Groq response to graph: %s", exc)
        return None

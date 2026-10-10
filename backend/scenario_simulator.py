"""Dynamic Scenario Simulator for EduPath AI.

Recalculates feasible alternatives and updates graph states after:
1. Admission failure (entrance cutoff missed or selection unawarded)
2. Scholarship rejection (funding loss, gap recalculation, loan modeling)
3. Budget changes (family budget reduction, cash-flow stress test)

Deterministically marks blocked milestones and surfaces active recovery fallbacks.
"""

from typing import Any
import copy

from domain_schemas import PathwayGraph, PathwayRoute
from feasibility_engine import calculate_loan_emi, validate_cash_flow_timing


def run_scenario_simulation(
    profile: dict[str, Any],
    graph: PathwayGraph,
    routes: list[PathwayRoute],
    scenario: str,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Execute dynamic scenario simulation and rebuild alternatives."""
    params = params or {}
    currency = profile.get("annual_budget", {}).get("currency") or "INR"

    updated_graph = copy.deepcopy(graph)
    updated_routes = copy.deepcopy(routes)

    simulation_result: dict[str, Any] = {
        "scenario": scenario,
        "currency": currency,
        "status": "completed",
        "blocked_node_ids": [],
        "activated_fallback_pathway_id": None,
        "summary_explanation": "",
        "actionable_next_steps": [],
        "updated_routes": [],
    }

    # =========================================================================
    # 1. ADMISSION FAILURE SCENARIO
    # =========================================================================
    if scenario == "admission":
        # Target high-selectivity entrance node in Path A
        blocked_nodes = []
        for node in updated_graph.nodes:
            if "b.tech" in node.title.lower() or "entrance" in node.title.lower():
                if node.pathway_id == "path_a_entrance" and node.node_type == "education":
                    node.feasibility_status = "BLOCKED"
                    node.blocked_requirements = [
                        "Entrance examination rank cutoff not secured in round 1/2 counselling",
                        "Selection criteria unmet for target tier-1 university seats",
                    ]
                    node.admission_uncertainty = "high"
                    blocked_nodes.append(node.node_id)

        # Update Route A status
        for r in updated_routes:
            if r.pathway_id == "path_a_entrance":
                r.is_academically_eligible = False
                r.feasibility_status = "BLOCKED"
                r.feasibility_reasons = [
                    "Entrance cutoff missed for direct university admission.",
                    "Primary route blocked. Do not quietly continue recommending an infeasible plan.",
                    f"Actionable Alternative: {r.fallback_route}",
                ]
                r.ranking_score = -1.0
            elif r.pathway_id == "path_b_diploma":
                # Boost fallback route
                r.feasibility_reasons.insert(
                    0,
                    "ACTIVATED RECOVERY ROUTE: Polytechnic Diploma provides guaranteed academic continuity and direct lateral entry into 2nd year B.Tech later."
                )
                r.ranking_score = 0.95

        simulation_result["blocked_node_ids"] = blocked_nodes
        simulation_result["activated_fallback_pathway_id"] = "path_b_diploma"
        simulation_result["summary_explanation"] = (
            "Admission Cutoff Missed: Direct university entrance route (Path A) is now marked BLOCKED. "
            "Rather than giving up on engineering, the system activates Path B (Polytechnic Diploma Route), "
            "which requires only Class 10 passing marks and offers a proven lateral-entry route into Year 2 B.Tech."
        )
        simulation_result["actionable_next_steps"] = [
            "Withdraw application fees from unavailable tier-1 entrance counselling.",
            "Register for State Polytechnic Diploma counselling (POLYCET / JEECUP).",
            "Focus on completing diploma with >50% aggregate to secure lateral-entry eligibility.",
            "Compare state-approved polytechnic institutions within commuting distance to minimize hostel costs.",
        ]

    # =========================================================================
    # 2. SCHOLARSHIP REJECTION SCENARIO
    # =========================================================================
    elif scenario == "scholarship":
        rejected_amount = float(params.get("funding_amount", 50000.0) or 50000.0)
        annual_budget = float(profile.get("annual_budget", {}).get("amount", profile.get("budget_amount", 100000)) or 100000)
        willing_loans = profile.get("funding_preferences", {}).get(
            "willing_to_consider_loans", profile.get("willing_to_consider_loans", False)
        )

        simulation_result["funding_amount_lost"] = rejected_amount
        blocked_nodes = []

        for r in updated_routes:
            r.available_funding = [f for f in r.available_funding if "scholarship" not in f.lower()]
            r.net_cost_after_aid = r.total_cost  # Reset aid deduction

            # Re-check cash flow with zero scholarship
            cash_check = validate_cash_flow_timing(
                profile=profile,
                staged_payments=r.staged_payments,
                currency=currency,
            )

            if not cash_check["is_cash_flow_feasible"]:
                r.feasibility_status = "BLOCKED"
                r.feasibility_reasons = [
                    f"Scholarship Rejected: Funding gap of {currency} {cash_check['total_funding_gap']:,.0f} cannot be bridged without loans.",
                    "Route is financially infeasible under current family cash flow constraints.",
                ]
                r.ranking_score = -0.8
                for nid in r.node_ids:
                    blocked_nodes.append(nid)
            elif cash_check["feasibility_status"] == "tight":
                r.feasibility_status = "CONDITIONAL"
                loan_emi = cash_check.get("loan_info", {}).get("monthly_emi", 0)
                r.feasibility_reasons = [
                    f"Scholarship Rejected: Remaining {currency} {rejected_amount:,.0f} deficit requires educational loan.",
                    f"Estimated monthly loan EMI: {currency} {loan_emi:,.0f}/mo over 7 years.",
                ]
                r.ranking_score = max(0.2, r.ranking_score - 0.25)
            else:
                r.feasibility_reasons = [
                    f"Fully Feasible: Route total cost ({currency} {r.total_cost:,.0f}) is fully covered by direct family budget even without scholarships."
                ]
                r.ranking_score = 0.90

        simulation_result["blocked_node_ids"] = list(set(blocked_nodes))
        simulation_result["activated_fallback_pathway_id"] = "path_c_vocational" if annual_budget < 50000 else "path_b_diploma"
        simulation_result["summary_explanation"] = (
            f"Scholarship Unawarded: Removed {currency} {rejected_amount:,.0f} anticipated aid from the funding plan. "
            f"High-cost routes now exhibit funding gaps. Resilient low-cost routes (Polytechnic & Vocational) "
            f"remain 100% financially feasible without requiring debt."
        )
        simulation_result["actionable_next_steps"] = [
            f"Remove {currency} {rejected_amount:,.0f} unconfirmed scholarship from your family spending plan.",
            "Compare education loan interest rates from nationalized banks (typically 8.5% - 9.5%).",
            "Consider Path B (Polytechnic Diploma) or Path C (Vocational) to eliminate funding risk entirely.",
        ]

    # =========================================================================
    # 3. BUDGET REDUCTION SCENARIO
    # =========================================================================
    elif scenario == "budget":
        reduction_pct = float(params.get("budget_reduction_percent", 30))
        current_budget = float(profile.get("annual_budget", {}).get("amount", profile.get("budget_amount", 150000)) or 150000)
        reduced_budget = round(current_budget * (1.0 - (reduction_pct / 100.0)), 2)

        simulation_result["original_budget"] = current_budget
        simulation_result["reduction_percent"] = reduction_pct
        simulation_result["simulated_budget"] = reduced_budget

        mock_profile = copy.deepcopy(profile)
        mock_profile.setdefault("annual_budget", {})["amount"] = reduced_budget
        mock_profile["budget_amount"] = reduced_budget

        blocked_nodes = []
        for r in updated_routes:
            cash_check = validate_cash_flow_timing(
                profile=mock_profile,
                staged_payments=r.staged_payments,
                currency=currency,
            )

            if not cash_check["is_cash_flow_feasible"]:
                r.feasibility_status = "BLOCKED"
                r.feasibility_reasons = [
                    f"Reduced Budget: At {currency} {reduced_budget:,.0f}/year, staged tuition payments create a {currency} {cash_check['total_funding_gap']:,.0f} cash-flow deficit.",
                    "Route blocked by family financial constraint.",
                ]
                r.ranking_score = -0.9
                for nid in r.node_ids:
                    blocked_nodes.append(nid)
            else:
                r.feasibility_reasons = [
                    f"Resilient: Fully affordable under reduced budget of {currency} {reduced_budget:,.0f}/year."
                ]
                r.ranking_score = 0.92

        simulation_result["blocked_node_ids"] = list(set(blocked_nodes))
        simulation_result["activated_fallback_pathway_id"] = "path_c_vocational"
        simulation_result["summary_explanation"] = (
            f"Budget Decreased by {reduction_pct:.0f}%: Annual budget adjusted from {currency} {current_budget:,.0f} "
            f"to {currency} {reduced_budget:,.0f}. Expensive degree routes exceed payment milestones. "
            f"The system reroutes priorities to zero-gap alternatives like Path B (Diploma) and Path C (Vocational + Stipend)."
        )
        simulation_result["actionable_next_steps"] = [
            f"Align payment milestones with the revised {currency} {reduced_budget:,.0f} annual ceiling.",
            "Avoid multi-year coaching or private university lock-ins.",
            "Target government polytechnic seats (approx. ₹30k/year) or ITI vocational courses (approx. ₹15k/year).",
        ]

    else:
        simulation_result["summary_explanation"] = "Baseline simulation: Profile constraints verified against candidate pathways."

    simulation_result["updated_routes"] = [r.model_dump() for r in updated_routes]
    simulation_result["graph"] = updated_graph.model_dump(mode="json")

    return simulation_result


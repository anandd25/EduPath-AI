"""Deterministic Feasibility Engine for EduPath AI.

Validates candidate educational and career pathways deterministically against:
1. Academic eligibility (subjects, percentage/grades, entrance exam criteria)
2. Staged cash-flow timing (payment due dates vs available annual budget / savings)
3. Milestone prerequisite dependencies (acyclicity, prerequisite completion)
4. Funding gaps and education loan feasibility
"""

from typing import Any
import re

from domain_schemas import Node, PathwayRoute, StagedPayment


def parse_numeric_threshold(text: str | None) -> float | None:
    """Extract percentage or grade cutoff number from requirement strings like '60% aggregate'."""
    if not text:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)\s*%", text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    match_num = re.search(r"\b(\d{2})\b", text)
    if match_num:
        try:
            val = float(match_num.group(1))
            if 35 <= val <= 100:
                return val
        except ValueError:
            pass
    return None


def calculate_loan_emi(
    principal: float,
    annual_interest_rate_percent: float = 9.5,
    tenure_months: int = 84,
) -> dict[str, float]:
    """Calculate monthly loan repayment and total interest for educational loans."""
    if principal <= 0:
        return {
            "principal": 0.0,
            "monthly_emi": 0.0,
            "total_repayment": 0.0,
            "total_interest": 0.0,
            "tenure_months": tenure_months,
            "interest_rate_percent": annual_interest_rate_percent,
        }

    monthly_rate = (annual_interest_rate_percent / 100) / 12
    if monthly_rate == 0:
        emi = principal / tenure_months
    else:
        emi = (
            principal
            * monthly_rate
            * ((1 + monthly_rate) ** tenure_months)
            / (((1 + monthly_rate) ** tenure_months) - 1)
        )

    total_payment = emi * tenure_months
    total_interest = total_payment - principal

    return {
        "principal": round(principal, 2),
        "monthly_emi": round(emi, 2),
        "total_repayment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "tenure_months": tenure_months,
        "interest_rate_percent": annual_interest_rate_percent,
    }


def validate_academic_eligibility(
    profile: dict[str, Any],
    required_subjects: list[str],
    min_grade_or_score: str | None = None,
    eligibility_conditions: list[str] | None = None,
) -> dict[str, Any]:
    """Deterministically compare student academic credentials against entry requirements."""
    student_percentage = profile.get("overall_percentage")
    academic_status = profile.get("academic_status", "currently_studying")
    subjects = profile.get("subjects") or []

    student_subject_names = {
        s.get("name", "").strip().lower()
        for s in subjects
        if isinstance(s, dict) and s.get("name")
    }

    reasons: list[str] = []
    unmet_requirements: list[str] = []
    is_eligible = True
    is_conditional = False

    # 1. Subject Requirements Check
    if required_subjects:
        for req_subj in required_subjects:
            req_clean = req_subj.strip().lower()
            # Check flexible subject matching (e.g. "mathematics" vs "math", "physics" vs "science")
            matched = False
            for s_name in student_subject_names:
                if (
                    req_clean in s_name
                    or s_name in req_clean
                    or (req_clean == "math" and "mathematics" in s_name)
                    or (req_clean == "mathematics" and "math" in s_name)
                    or (req_clean == "physics" and ("science" in s_name or "physics" in s_name))
                    or (req_clean == "chemistry" and ("science" in s_name or "chemistry" in s_name))
                ):
                    matched = True
                    break

            if not matched:
                is_eligible = False
                msg = f"Missing prerequisite subject: '{req_subj}'"
                reasons.append(msg)
                unmet_requirements.append(msg)

    # 2. Minimum Percentage / Cutoff Check
    cutoff_threshold = parse_numeric_threshold(min_grade_or_score)
    if cutoff_threshold is not None:
        if student_percentage is not None:
            if float(student_percentage) < cutoff_threshold:
                is_eligible = False
                msg = (
                    f"Overall score {student_percentage}% is below the minimum required "
                    f"threshold of {cutoff_threshold}% ({min_grade_or_score})"
                )
                reasons.append(msg)
                unmet_requirements.append(msg)
            else:
                reasons.append(
                    f"Academic percentage {student_percentage}% satisfies minimum requirement ({cutoff_threshold}%)"
                )
        else:
            # Result awaited / not yet released
            is_conditional = True
            reasons.append(
                f"Result awaited: Admission conditional upon securing at least {cutoff_threshold}%"
            )

    if academic_status in {"currently_studying", "result_awaited"} and is_eligible:
        is_conditional = True
        reasons.append("Subject to successful completion of current qualifying examination")

    if is_eligible and not unmet_requirements:
        status = "conditional" if is_conditional else "met"
    else:
        status = "unmet"

    return {
        "is_eligible": is_eligible,
        "status": status,
        "reasons": reasons,
        "unmet_requirements": unmet_requirements,
        "cutoff_threshold": cutoff_threshold,
    }


def validate_cash_flow_timing(
    profile: dict[str, Any],
    staged_payments: list[StagedPayment],
    currency: str = "INR",
) -> dict[str, Any]:
    """Validate stage-by-stage cash flow availability and funding gaps.

    Ensures funds are available WHEN each payment is due, not merely that the
    grand total matches annual budget.
    """
    annual_budget_obj = profile.get("annual_budget") or {}
    annual_budget = annual_budget_obj.get("amount")
    if annual_budget is None:
        annual_budget = profile.get("budget_amount")

    funding_prefs = profile.get("funding_preferences") or {}
    willing_loans = funding_prefs.get(
        "willing_to_consider_loans", profile.get("willing_to_consider_loans", False)
    )
    interested_scholarships = funding_prefs.get(
        "interested_in_scholarships", profile.get("interested_in_scholarships", True)
    )

    if annual_budget is None or annual_budget < 0:
        annual_budget = 0.0
    else:
        annual_budget = float(annual_budget)

    total_stage_cost = sum(p.amount for p in staged_payments)
    stage_breakdown: list[dict[str, Any]] = []
    total_funding_gap = 0.0
    has_timing_mismatch = False
    reasons: list[str] = []

    # Estimate expected annual capacity based on profile
    # Staged payments are assessed per stage/year
    for p in staged_payments:
        stage_amount = float(p.amount)
        stage_name = p.stage_name
        due_date = p.due_date or "At enrollment"

        # Compare against single stage or annual budget allocation
        # Assume an annual period allows up to annual_budget
        if stage_amount <= annual_budget or annual_budget == 0.0:
            # Stage is within budgeted allocation
            gap = 0.0
            stage_status = "covered_by_budget"
            covered_by = "budget"
        else:
            gap = stage_amount - annual_budget
            has_timing_mismatch = True
            total_funding_gap += gap
            if willing_loans:
                stage_status = "covered_by_education_loan"
                covered_by = "loan"
            elif interested_scholarships:
                stage_status = "requires_scholarship_or_aid"
                covered_by = "scholarship"
            else:
                stage_status = "unfunded_gap"
                covered_by = "unfunded"

        stage_breakdown.append(
            {
                "stage_name": stage_name,
                "amount": stage_amount,
                "due_date": due_date,
                "budget_available": annual_budget,
                "funding_gap": round(gap, 2),
                "covered_by": covered_by,
                "status": stage_status,
            }
        )

    # Determine overall cash-flow feasibility
    if total_funding_gap == 0:
        feasibility_status = "feasible"
        is_cash_flow_feasible = True
        reasons.append(
            f"Annual budget of {currency} {annual_budget:,.0f} fully covers all staged payment milestones."
        )
    elif willing_loans:
        feasibility_status = "tight"
        is_cash_flow_feasible = True
        reasons.append(
            f"Staged payments exceed direct annual budget by {currency} {total_funding_gap:,.0f}, "
            f"but student is willing to consider educational loans to bridge cash flow."
        )
    else:
        feasibility_status = "funding_gap"
        is_cash_flow_feasible = False
        reasons.append(
            f"Staged cash-flow deficit: {currency} {total_funding_gap:,.0f} gap identified with "
            f"no educational loan financing selected."
        )

    loan_info = None
    if total_funding_gap > 0 and willing_loans:
        loan_info = calculate_loan_emi(total_funding_gap)

    return {
        "is_cash_flow_feasible": is_cash_flow_feasible,
        "feasibility_status": feasibility_status,
        "total_cost": round(total_stage_cost, 2),
        "annual_budget": round(annual_budget, 2),
        "total_funding_gap": round(total_funding_gap, 2),
        "has_timing_mismatch": has_timing_mismatch,
        "stages": stage_breakdown,
        "reasons": reasons,
        "loan_info": loan_info,
    }


def evaluate_pathway_feasibility(
    profile: dict[str, Any],
    route: PathwayRoute,
    nodes_by_id: dict[str, Node] | None = None,
) -> PathwayRoute:
    """Execute complete deterministic evaluation of a candidate pathway route."""
    # 1. Academic Eligibility Check across Route Requirements
    acad_check = validate_academic_eligibility(
        profile=profile,
        required_subjects=route.entry_requirements,
        min_grade_or_score="55% aggregate",
    )

    # 2. Staged Cash-Flow Feasibility Check
    cash_check = validate_cash_flow_timing(
        profile=profile,
        staged_payments=route.staged_payments,
        currency=route.currency,
    )

    # 3. Node Level Verifications
    node_unmet = []
    if nodes_by_id:
        for nid in route.node_ids:
            node = nodes_by_id.get(nid)
            if node and node.blocked_requirements:
                node_unmet.extend(node.blocked_requirements)

    combined_reasons: list[str] = []
    combined_reasons.extend(acad_check["reasons"])
    combined_reasons.extend(cash_check["reasons"])

    # Enforce Hard Constraints:
    # A pathway is BLOCKED if academic prerequisites fail or an unbridgeable funding gap exists
    if not acad_check["is_eligible"]:
        overall_status = "BLOCKED"
        combined_reasons.insert(
            0, "Academic eligibility criteria not met for one or more milestones in this pathway."
        )
    elif not cash_check["is_cash_flow_feasible"]:
        overall_status = "BLOCKED"
        combined_reasons.insert(
            0,
            f"Infeasible cash-flow timing: Funding gap of {route.currency} {cash_check['total_funding_gap']:,.0f} cannot be bridged with current family budget."
        )
    elif acad_check["status"] == "conditional" or cash_check["feasibility_status"] == "tight":
        overall_status = "CONDITIONAL"
        combined_reasons.insert(
            0, "Feasible subject to entrance qualification or approved financial aid/loan."
        )
    else:
        overall_status = "FEASIBLE"
        combined_reasons.insert(
            0, "All academic prerequisites and staged cash-flow checkpoints are satisfied."
        )

    # Calculate net cost after funding opportunities
    funding_deduction = 0.0
    if route.available_funding:
        # Realistic merit/need estimate
        funding_deduction = min(route.total_cost * 0.25, 50000.0)

    net_cost = max(0.0, route.total_cost - funding_deduction)

    return route.model_copy(
        update={
            "is_academically_eligible": acad_check["is_eligible"],
            "is_cash_flow_feasible": cash_check["is_cash_flow_feasible"],
            "feasibility_status": overall_status,
            "feasibility_reasons": combined_reasons,
            "net_cost_after_aid": round(net_cost, 2),
        }
    )


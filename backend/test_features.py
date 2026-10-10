"""Comprehensive test suite for EduPath AI.

Tests:
1. Multi-pathway generation across two countries (India and United Kingdom)
2. Complete node quality (all 5 dimensions verified: Decision, Prerequisites, Timing, Finances, Evidence/Fallback)
3. Feasibility engine: academic eligibility, staged cash flow, funding gap, loan calculations
4. Pairwise preference learning: weight updates, re-ranking, transparent explanations
5. Hard constraint enforcement (blocked routes cannot outrank feasible routes)
6. Baseline evaluation against static weights
7. Scenario simulation (admission failure, scholarship rejection, budget reduction)
"""

import unittest
from domain_schemas import PathwayGraph, PathwayRoute
from feasibility_engine import (
    validate_academic_eligibility,
    validate_cash_flow_timing,
    calculate_loan_emi,
    evaluate_pathway_feasibility,
)
from pathway_comparison import build_complete_pathways
from preference_engine import (
    get_cold_start_weights,
    rank_pathways,
    update_preference_weights,
    evaluate_against_static_baseline,
)
from scenario_simulator import run_scenario_simulation


class TestEduPathFeatures(unittest.TestCase):
    def setUp(self):
        # Profile 1: India, Class 10, interested in technology/machines, budget 150000 INR
        self.profile_india = {
            "id": 1,
            "preferred_name": "Aarav",
            "education_stage": "class10",
            "country": "India",
            "region": "Maharashtra",
            "curriculum": "CBSE",
            "academic_status": "completed",
            "overall_percentage": 78.5,
            "overall_result_status": "completed",
            "subjects": [
                {"name": "Mathematics", "marks": 82, "maximum_marks": 100},
                {"name": "Science", "marks": 80, "maximum_marks": 100},
                {"name": "Social Science", "marks": 75, "maximum_marks": 100},
                {"name": "English", "marks": 77, "maximum_marks": 100},
            ],
            "interests": ["technology_coding", "mathematics_logic"],
            "interest_description": "I love machines, physics, and solving technical problems.",
            "annual_budget": {"amount": 120000, "currency": "INR"},
            "funding_preferences": {
                "interested_in_scholarships": True,
                "willing_to_consider_loans": True,
            },
            "priorities": ["affordability", "career_opportunities"],
        }

        # Profile 2: UK, interested in applied computing/engineering, budget £8,000
        self.profile_uk = {
            "id": 2,
            "preferred_name": "Oliver",
            "education_stage": "class10",
            "country": "United Kingdom",
            "region": "London",
            "curriculum": "GCSE",
            "academic_status": "currently_studying",
            "overall_percentage": 72.0,
            "overall_result_status": "awaited",
            "subjects": [
                {"name": "Mathematics", "marks": 74, "maximum_marks": 100},
                {"name": "Physics", "marks": 70, "maximum_marks": 100},
                {"name": "Chemistry", "marks": 68, "maximum_marks": 100},
                {"name": "English", "marks": 76, "maximum_marks": 100},
            ],
            "interests": ["technology_coding", "design"],
            "interest_description": "Hands-on engineering, building robots and coding.",
            "annual_budget": {"amount": 8000, "currency": "GBP"},
            "funding_preferences": {
                "interested_in_scholarships": True,
                "willing_to_consider_loans": False,
            },
            "priorities": ["affordability", "hands_on_learning"],
        }

    def test_01_multi_pathway_generation_and_node_quality(self):
        """Verify that multi-pathway generation creates Path A, B, and C with full 5-dimension nodes."""
        graph, routes = build_complete_pathways(self.profile_india, currency="INR")

        self.assertIsInstance(graph, PathwayGraph)
        self.assertGreaterEqual(len(routes), 3)

        categories = {r.category for r in routes}
        self.assertIn("engineering_entrance", categories)
        self.assertIn("diploma", categories)
        self.assertIn("vocational", categories)

        # Verify all nodes have rich decision-support attributes
        for node in graph.nodes:
            self.assertIsNotNone(node.title)
            self.assertIsNotNone(node.description)
            # Dimension 1: Decision & Purpose
            self.assertIsNotNone(node.purpose_fit)
            # Dimension 2: Requirements & Prerequisites
            self.assertIsInstance(node.required_subjects, list)
            # Dimension 3: Timeline & Deadlines
            self.assertIsNotNone(node.duration_estimate_months)
            # Dimension 4: Financial Feasibility
            self.assertIsInstance(node.staged_payments, list)
            # Dimension 5: Evidence, Uncertainty, and Fallback
            self.assertIsNotNone(node.verified_status)
            self.assertIsNotNone(node.actionable_fallback)

    def test_02_country_adaptation(self):
        """Verify multi-pathway generation adapts properly to different country contexts."""
        graph_uk, routes_uk = build_complete_pathways(self.profile_uk, currency="GBP")
        self.assertEqual(routes_uk[0].currency, "GBP")
        self.assertGreaterEqual(len(routes_uk), 3)

    def test_03_feasibility_engine_academic_and_cash_flow(self):
        """Verify deterministic validation of academic eligibility and staged cash flow."""
        # Test Academic Check
        acad_pass = validate_academic_eligibility(
            profile=self.profile_india,
            required_subjects=["Mathematics", "Science"],
            min_grade_or_score="60%",
        )
        self.assertTrue(acad_pass["is_eligible"])
        self.assertEqual(acad_pass["status"], "met")

        acad_fail = validate_academic_eligibility(
            profile=self.profile_india,
            required_subjects=["Biology", "Biotechnology"],
            min_grade_or_score="85%",
        )
        self.assertFalse(acad_fail["is_eligible"])
        self.assertEqual(acad_fail["status"], "unmet")
        self.assertGreater(len(acad_fail["unmet_requirements"]), 0)

        # Test Cash Flow Check with timing
        _, routes = build_complete_pathways(self.profile_india, currency="INR")
        route_a = next(r for r in routes if r.category == "engineering_entrance")

        cash_eval = validate_cash_flow_timing(
            profile=self.profile_india,
            staged_payments=route_a.staged_payments,
            currency="INR",
        )
        self.assertIn("is_cash_flow_feasible", cash_eval)
        self.assertIn("stages", cash_eval)
        self.assertGreater(len(cash_eval["stages"]), 0)

        # Test Loan EMI calculation
        loan_calc = calculate_loan_emi(principal=100000, annual_interest_rate_percent=9.5, tenure_months=84)
        self.assertGreater(loan_calc["monthly_emi"], 0)
        self.assertGreater(loan_calc["total_repayment"], 100000)

    def test_04_preference_learning_and_weight_adaptation(self):
        """Verify preference weight learning, rank updates, and explanation generation."""
        cold_weights = get_cold_start_weights(self.profile_india)
        self.assertAlmostEqual(sum(cold_weights.values()), 1.0, places=2)

        _, routes = build_complete_pathways(self.profile_india, currency="INR")
        route_a = next(r for r in routes if r.category == "engineering_entrance")
        route_b = next(r for r in routes if r.category == "diploma")

        # Student prefers Route B (Diploma) because of lower cost and shorter timeline
        updated_weights, explanation = update_preference_weights(
            current_weights=cold_weights,
            route_a=route_a,
            route_b=route_b,
            preferred_route_id=route_b.pathway_id,
            selected_reasons=["lower_cost", "faster_completion"],
        )

        self.assertGreater(updated_weights["affordability"], cold_weights["affordability"])
        self.assertGreater(updated_weights["duration"], cold_weights["duration"])
        self.assertIn("affordability", explanation.lower())

        ranked = rank_pathways(routes, updated_weights)
        self.assertEqual(len(ranked), len(routes))

    def test_05_hard_constraint_enforcement(self):
        """Ensure that even if a student prefers an infeasible route, hard constraints keep it flagged as BLOCKED."""
        _, routes = build_complete_pathways(self.profile_india, currency="INR")
        route_a = next(r for r in routes if r.category == "engineering_entrance")

        # Manually force route_a to be BLOCKED due to budget/eligibility
        blocked_route_a = route_a.model_copy(
            update={
                "feasibility_status": "BLOCKED",
                "is_academically_eligible": False,
                "feasibility_reasons": ["Academic prerequisite missing"],
            }
        )

        other_routes = [r for r in routes if r.pathway_id != route_a.pathway_id]
        test_routes = [blocked_route_a] + other_routes

        weights = {"career_growth": 0.8, "affordability": 0.1, "duration": 0.05, "low_risk": 0.05}
        ranked = rank_pathways(test_routes, weights)

        # The BLOCKED route must NOT be at rank 0
        self.assertNotEqual(ranked[0].pathway_id, blocked_route_a.pathway_id)
        # Blocked route has negative ranking score
        self.assertLess(ranked[-1].ranking_score, 0.0)

    def test_06_baseline_evaluation_against_static_weights(self):
        """Test holdout evaluation of learned weights against static equal-weight baseline."""
        _, routes = build_complete_pathways(self.profile_india, currency="INR")
        history = [
            {"pathway_a_id": "path_a_entrance", "pathway_b_id": "path_b_diploma", "preferred_pathway_id": "path_b_diploma"},
            {"pathway_a_id": "path_a_entrance", "pathway_b_id": "path_c_vocational", "preferred_pathway_id": "path_c_vocational"},
        ]
        learned_weights = {"affordability": 0.50, "duration": 0.30, "career_growth": 0.10, "low_risk": 0.10}

        eval_report = evaluate_against_static_baseline(history, learned_weights, routes)
        self.assertEqual(eval_report["evaluated_samples"], 2)
        self.assertGreaterEqual(eval_report["learned_model_accuracy"], 0.5)

    def test_07_scenario_simulations(self):
        """Test scenario simulation: admission failure, scholarship rejection, budget reduction."""
        graph, routes = build_complete_pathways(self.profile_india, currency="INR")

        # 1. Admission Failure Simulation
        sim_admission = run_scenario_simulation(
            profile=self.profile_india,
            graph=graph,
            routes=routes,
            scenario="admission",
        )
        self.assertIn("blocked_node_ids", sim_admission)
        self.assertGreater(len(sim_admission["blocked_node_ids"]), 0)
        self.assertEqual(sim_admission["activated_fallback_pathway_id"], "path_b_diploma")

        # 2. Scholarship Rejection Simulation
        sim_scholarship = run_scenario_simulation(
            profile=self.profile_india,
            graph=graph,
            routes=routes,
            scenario="scholarship",
            params={"funding_amount": 75000},
        )
        self.assertEqual(sim_scholarship["funding_amount_lost"], 75000)

        # 3. Budget Reduction Simulation
        sim_budget = run_scenario_simulation(
            profile=self.profile_india,
            graph=graph,
            routes=routes,
            scenario="budget",
            params={"budget_reduction_percent": 40},
        )
        self.assertEqual(sim_budget["reduction_percent"], 40)
        self.assertLess(sim_budget["simulated_budget"], sim_budget["original_budget"])


if __name__ == "__main__":
    unittest.main()


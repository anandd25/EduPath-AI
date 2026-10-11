export interface StagedPayment {
  payment_id?: string;
  stage_name: string;
  amount: number;
  currency: string;
  due_date?: string | null;
  covered_by?: 'budget' | 'scholarship' | 'loan' | 'unfunded';
  status?: string;
  funding_gap?: number;
}

export interface DecisionNode {
  node_id: string;
  node_type: 'education' | 'career' | 'exploration' | 'certification';
  title: string;
  description: string;
  duration_estimate_months?: number | null;
  cost_estimate?: number | null;
  cost_currency?: string | null;
  milestone_ids?: string[];
  institution_ids?: string[];
  evidence_ids?: string[];
  prerequisite_node_ids?: string[];

  // 1. Decision and Purpose
  purpose_fit?: string | null;
  alternatives_summary?: string | null;
  potential_outcomes?: string[];

  // 2. Requirements and Prerequisites
  required_subjects?: string[];
  min_grade_or_score?: string | null;
  entrance_exams?: string[];
  eligibility_conditions?: string[];
  application_materials?: string[];
  unqualified_consequence?: string | null;

  // 3. Timeline and Deadlines
  start_date?: string | null;
  application_window?: string | null;
  expected_decision_date?: string | null;
  next_decision_date?: string | null;

  // 4. Financial Feasibility & Staged Cash Flow
  tuition_amount?: number | null;
  living_expenses?: number | null;
  fees_estimate?: number | null;
  staged_payments?: StagedPayment[];
  scholarship_eligibility?: string[];
  funding_gap?: number | null;
  loan_interest_rate?: number | null;
  loan_monthly_payment?: number | null;
  financial_status?: 'feasible' | 'tight' | 'funding_gap' | 'unfeasible' | null;

  // 5. Evidence, Uncertainty, and Fallback
  source_links?: string[];
  source_dates?: string[];
  verified_status?: 'verified' | 'unverified' | 'estimate';
  admission_uncertainty?: 'low' | 'medium' | 'high' | null;
  scholarship_uncertainty?: 'low' | 'medium' | 'high' | null;
  blocked_requirements?: string[];
  actionable_fallback?: string | null;
  pathway_id?: string | null;
  feasibility_status?: 'FEASIBLE' | 'CONDITIONAL' | 'BLOCKED';

  // 6. Cost Evidence, Real-Life Benchmark & Categorized Institutes
  cost_evidence_description?: string | null;
  cost_source_citation?: string | null;
  real_life_benchmark?: RealLifeBenchmark | null;
  categorized_institutes?: CategorizedInstitutes | null;
}

export interface RealLifeBenchmark {
  institution_name: string;
  program_name?: string | null;
  actual_tuition?: number | null;
  actual_living?: number | null;
  actual_fees?: number | null;
  actual_total?: number | null;
  currency: string;
  source_citation: string;
  academic_year?: string | null;
  variance_note?: string | null;
}

export interface InstituteItem {
  name: string;
  location: string;
  fit_reason: string;
  estimated_annual_cost?: number | null;
  admission_cutoff?: string | null;
  badge?: string | null;
}

export interface CategorizedInstitutes {
  location_based: InstituteItem[];
  merit_based: InstituteItem[];
  best_suited: InstituteItem[];
}

export interface PathwayEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: 'progression' | 'alternative' | 'conditional' | 'dependency' | 'prerequisite';
  condition?: string | null;
}

export interface PathwayRoute {
  pathway_id: string;
  route_name: string;
  category: string;
  summary: string;
  total_duration_months: number;
  total_cost: number;
  currency: string;
  staged_payments: StagedPayment[];
  available_funding: string[];
  net_cost_after_aid: number;
  entry_requirements: string[];
  potential_outcomes: string[];
  risks: string[];
  fallback_route: string;
  is_academically_eligible: boolean;
  is_cash_flow_feasible: boolean;
  feasibility_status: 'FEASIBLE' | 'CONDITIONAL' | 'BLOCKED';
  feasibility_reasons: string[];
  ranking_score?: number;
  node_ids: string[];
}

export interface PathwayGraphData {
  pathway_id: string;
  nodes: DecisionNode[];
  edges: PathwayEdge[];
  target_outcome?: string;
  schema_version?: string;
  pathway_routes?: PathwayRoute[];
  ranking_explanations?: string[];
  comparison_matrix?: {
    routes: Array<{
      pathway_id: string;
      name: string;
      category: string;
      duration_years: number;
      total_cost: number;
      net_cost: number;
      currency: string;
      feasibility_status: string;
      entry_requirements: string[];
      potential_outcomes: string[];
      risks: string[];
      fallback_route: string;
      staged_payments_count: number;
    }>;
    summary: string;
  };
}

export interface PreferenceComparisonResponse {
  status: string;
  updated_weights: Record<string, number>;
  explanation: string;
  constraint_enforcement_notice?: string | null;
  ranked_pathways: PathwayRoute[];
  baseline_evaluation: {
    evaluated_samples: number;
    learned_model_accuracy: number;
    static_baseline_accuracy: number;
    accuracy_improvement: number;
    concordance_tau: number;
    status: string;
    message: string;
  };
}

export interface ScenarioSimulationResponse {
  scenario: string;
  currency: string;
  status: string;
  blocked_node_ids: string[];
  activated_fallback_pathway_id?: string | null;
  summary_explanation: string;
  actionable_next_steps: string[];
  funding_amount_lost?: number;
  original_budget?: number;
  reduction_percent?: number;
  simulated_budget?: number;
  updated_routes: PathwayRoute[];
  graph?: PathwayGraphData;
}


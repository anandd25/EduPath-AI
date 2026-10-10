"""Complete Pathway Comparison Generator for EduPath AI.

Generates and compares complete post-Class 10 educational and career pathways:
- Path A · Engineering / Professional Entrance Route (Senior Secondary -> Entrance -> Degree -> Careers)
- Path B · Polytechnic Diploma Route (Class 10 -> Diploma -> Employment / Lateral Entry -> Careers)
- Path C · Vocational & Applied Skills Route (Class 10 -> ITI / Vocational -> Apprenticeship -> Careers)

Also adapts dynamically based on student profile (Commerce, Humanities, Healthcare, etc.).
Every node answers all 5 dimensions:
1. Decision and Purpose
2. Requirements and Prerequisites
3. Timeline and Deadlines
4. Financial Feasibility & Staged Cash Flow
5. Evidence, Uncertainty, and Fallback
"""

from typing import Any
import uuid

from domain_schemas import (
    Edge,
    EvidenceRecord,
    FundingOpportunity,
    InstitutionRecord,
    Milestone,
    Node,
    PathwayGraph,
    PathwayRoute,
    StagedPayment,
)
from feasibility_engine import evaluate_pathway_feasibility, calculate_loan_emi


def _fmt_curr(val: float, currency: str = "INR") -> str:
    return f"{currency} {val:,.0f}"


def build_complete_pathways(
    profile: dict[str, Any],
    currency: str = "INR",
) -> tuple[PathwayGraph, list[PathwayRoute]]:
    """Generate multi-route comparison pathways with rich decision-support nodes."""
    preferred_name = profile.get("preferred_name") or "Student"
    country = profile.get("country") or "India"
    region = profile.get("region") or "Maharashtra"
    interests = profile.get("interests") or []
    interest_desc = profile.get("interest_description") or ""
    annual_budget_obj = profile.get("annual_budget") or {}
    annual_budget = annual_budget_obj.get("amount", profile.get("budget_amount", 150000)) or 150000

    # Categorize student focus
    interest_str = " ".join(interests).lower() + " " + interest_desc.lower()
    is_commerce = any(k in interest_str for k in ["commerce", "finance", "business", "accounting", "economics"])
    is_medical = any(k in interest_str for k in ["medicine", "doctor", "health", "biology", "biotech"])
    is_arts = any(k in interest_str for k in ["arts", "humanities", "design", "law", "psychology", "media"])

    nodes: list[Node] = []
    edges: list[Edge] = []
    milestones: list[Milestone] = []
    institutions: list[InstitutionRecord] = []
    evidence_records: list[EvidenceRecord] = []
    funding_opportunities: list[FundingOpportunity] = []
    routes: list[PathwayRoute] = []

    # Common Root: Class 10 Stage
    root_node_id = f"node_class10_{uuid.uuid4().hex[:6]}"
    root_evidence_id = f"ev_gov_{uuid.uuid4().hex[:6]}"
    root_milestone_id = f"ms_class10_{uuid.uuid4().hex[:6]}"

    evidence_records.append(
        EvidenceRecord(
            evidence_id=root_evidence_id,
            title=f"National Education Board Guidelines & Post-10th Pathways ({country})",
            url="https://cbse.gov.in/cbsenew/examination.html" if country.lower() == "india" else "https://education.gov/standards",
            source_name=f"Ministry of Education / State Boards ({country})",
            retrieved_at="2026-03-15",
            supports="Curriculum progression guidelines and recognized routes after secondary completion.",
            confidence="high",
        )
    )

    milestones.append(
        Milestone(
            milestone_id=root_milestone_id,
            title="Class 10 Board Examination & Progression Gate",
            description="Complete secondary curriculum, obtain verified marksheet and transfer certificate.",
            status="completed" if profile.get("academic_status") == "completed" else "in_progress",
            duration_months=12,
            requirement_notes=["Pass all required core subjects", "Minimum 50% for science/math stream eligibility"],
            cost_amount=2500,
            cost_currency=currency,
            funding_notes=["Standard state board examination fee"],
            evidence_ids=[root_evidence_id],
        )
    )

    nodes.append(
        Node(
            node_id=root_node_id,
            node_type="education",
            title=f"Class 10 Foundation ({profile.get('curriculum', 'CBSE')})",
            description=(
                f"Starting milestone for {preferred_name}. Synthesizes academic performance across subjects "
                f"to make evidence-based choices across Senior Secondary, Polytechnic Diploma, and Vocational routes."
            ),
            duration_estimate_months=12,
            cost_estimate=15000,
            cost_currency=currency,
            milestone_ids=[root_milestone_id],
            institution_ids=[],
            evidence_ids=[root_evidence_id],
            prerequisite_node_ids=[],
            purpose_fit=f"Validates baseline academic foundations for {preferred_name} based on reported strengths.",
            alternatives_summary="Choose between Academic Stream (11-12), Applied Polytechnic Diploma, or Vocational Skill Qualification.",
            potential_outcomes=["Senior Secondary Education", "Polytechnic Diploma Admission", "Vocational Training"],
            required_subjects=["Mathematics", "Science", "Social Science", "English"],
            min_grade_or_score="Passing grade (35-50% depending on state)",
            entrance_exams=[],
            eligibility_conditions=["Successful completion of Class 10 board examinations"],
            application_materials=["Class 10 Marksheet", "Transfer Certificate", "Identity Proof"],
            unqualified_consequence="Supplementary examinations or National Institute of Open Schooling (NIOS) pathway.",
            start_date="April 2026",
            application_window="March - May 2026",
            expected_decision_date="May 2026",
            next_decision_date="June 2026",
            tuition_amount=10000,
            living_expenses=5000,
            fees_estimate=2500,
            staged_payments=[
                StagedPayment(stage_name="Exam & School Registration", amount=15000, currency=currency, due_date="April 2026")
            ],
            scholarship_eligibility=["National Means-cum-Merit Scholarship (NMMS)"],
            funding_gap=0,
            verified_status="verified",
            admission_uncertainty="low",
            actionable_fallback="Open Schooling (NIOS) or state compartment board re-sit.",
            pathway_id="root",
            feasibility_status="FEASIBLE",
        )
    )

    # -------------------------------------------------------------------------
    # Route Definitions depending on student discipline
    # -------------------------------------------------------------------------
    if is_commerce:
        # COMMERCE TRACK
        route_a_name = "Path A · Senior Secondary Commerce & Professional Degree (B.Com / CA)"
        route_b_name = "Path B · Diploma in Financial Accounting & Applied Management"
        route_c_name = "Path C · Vocational FinTech & Banking Operations Route"
        route_a_subjs = ["Accountancy", "Business Studies", "Economics", "Mathematics"]
        route_b_subjs = ["English", "Mathematics", "Business Basics"]
        route_c_subjs = ["Basic Arithmetic", "Computer Fundamentals"]
    elif is_medical:
        # MEDICAL / HEALTHCARE TRACK
        route_a_name = "Path A · Senior Secondary Science (PCB) & Medical Entrance Route"
        route_b_name = "Path B · Allied Health Sciences & Medical Lab Technology Diploma"
        route_c_name = "Path C · Vocational Emergency Medical Technician & Pharmacy Assistance"
        route_a_subjs = ["Physics", "Chemistry", "Biology"]
        route_b_subjs = ["Science", "English"]
        route_c_subjs = ["Basic Science", "General Fitness"]
    elif is_arts:
        # ARTS / DESIGN / HUMANITIES TRACK
        route_a_name = "Path A · Senior Secondary Humanities & University Degree (BA / Law / Design)"
        route_b_name = "Path B · Applied Arts & Commercial Design Diploma"
        route_c_name = "Path C · Vocational Media Production & Digital Content Training"
        route_a_subjs = ["English", "History", "Political Science", "Psychology"]
        route_b_subjs = ["Drawing & Visual Arts", "English"]
        route_c_subjs = ["Basic Computer Skills", "Communication"]
    else:
        # DEFAULT / ENGINEERING TRACK (Core canonical example)
        route_a_name = "Path A · Engineering Entrance Route (Class 11–12 PCM → Degree)"
        route_b_name = "Path B · Polytechnic Diploma Route (3-Year Diploma → Lateral Degree)"
        route_c_name = "Path C · Vocational Technical Route (ITI / Skill Training → Industry)"
        route_a_subjs = ["Physics", "Chemistry", "Mathematics"]
        route_b_subjs = ["Mathematics", "Science"]
        route_c_subjs = ["Class 10 Passing Subjects", "Practical Aptitude"]

    # =========================================================================
    # PATH A: SENIOR SECONDARY + DEGREE ROUTE
    # =========================================================================
    pA_node1_id = f"node_pA_step1_{uuid.uuid4().hex[:6]}"
    pA_node2_id = f"node_pA_step2_{uuid.uuid4().hex[:6]}"
    pA_node3_id = f"node_pA_step3_{uuid.uuid4().hex[:6]}"

    pA_inst_id = f"inst_pA_{uuid.uuid4().hex[:6]}"
    institutions.append(
        InstitutionRecord(
            institution_id=pA_inst_id,
            name=f"Top State & National Institutions ({region}, {country})",
            country=country,
            region=region,
            program_name="Senior Secondary Science / Engineering Entrance Program",
            duration_months=24,
            admission_requirements=["Class 10 score above 60% with Mathematics & Science"],
            tuition_amount=120000,
            tuition_currency=currency,
        )
    )

    pA_fund_id = f"fund_pA_{uuid.uuid4().hex[:6]}"
    funding_opportunities.append(
        FundingOpportunity(
            funding_id=pA_fund_id,
            name="Merit & Need-Based Higher Education Scholarship",
            funding_type="scholarship",
            amount=50000,
            currency=currency,
            eligibility_notes=["Requires >75% in qualifying examination and family income < 6 LPA"],
        )
    )

    # Node A1: Senior Secondary (Class 11-12)
    nodes.append(
        Node(
            node_id=pA_node1_id,
            node_type="education",
            title="Class 11–12 Academic Stream & Entrance Preparation",
            description=(
                f"Two-year rigorous foundation focusing on {', '.join(route_a_subjs[:3])}. "
                f"Combines higher secondary board syllabus with entrance examination coaching (e.g. JEE Main, State CET)."
            ),
            duration_estimate_months=24,
            cost_estimate=140000,
            cost_currency=currency,
            milestone_ids=[],
            institution_ids=[pA_inst_id],
            evidence_ids=[root_evidence_id],
            prerequisite_node_ids=[root_node_id],
            purpose_fit="Builds essential theoretical depth in mathematics and sciences required for university engineering programs.",
            alternatives_summary="Polytechnic Diploma route avoids intense entrance coaching pressure.",
            potential_outcomes=["Eligible for National & State University Engineering Admissions", "B.Sc. / Applied Sciences"],
            required_subjects=route_a_subjs,
            min_grade_or_score="60% in Class 10 with strong Math/Science score",
            entrance_exams=["School stream entrance or board merit cutoff"],
            eligibility_conditions=["Class 10 pass with required subject criteria"],
            application_materials=["Class 10 Marksheet", "School Recommendation", "Character Certificate"],
            unqualified_consequence="Switch to General Science without coaching, or transition to Polytechnic Diploma route.",
            start_date="June 2026",
            application_window="May - June 2026",
            expected_decision_date="June 2026",
            next_decision_date="December 2027",
            tuition_amount=90000,
            living_expenses=35000,
            fees_estimate=15000,
            staged_payments=[
                StagedPayment(stage_name="Class 11 Admission & Tuition", amount=70000, currency=currency, due_date="June 2026"),
                StagedPayment(stage_name="Class 12 Tuition & Coaching Fee", amount=70000, currency=currency, due_date="May 2027"),
            ],
            scholarship_eligibility=["State Merit Scholarship", "Inspire Scholarship (Post 12th)"],
            funding_gap=max(0, 70000 - annual_budget),
            loan_interest_rate=9.5,
            loan_monthly_payment=calculate_loan_emi(max(0, 140000 - (annual_budget * 2)))["monthly_emi"],
            financial_status="feasible" if (annual_budget * 2) >= 140000 else "tight",
            source_links=["https://nta.ac.in", "https://cbseacademic.nic.in"],
            source_dates=["2026-01-10"],
            verified_status="verified",
            admission_uncertainty="medium",
            scholarship_uncertainty="medium",
            actionable_fallback="Shift to state-funded junior college or focus on State CET rather than high-competition JEE.",
            pathway_id="path_a_entrance",
            feasibility_status="FEASIBLE",
        )
    )

    # Node A2: Bachelor's Degree
    nodes.append(
        Node(
            node_id=pA_node2_id,
            node_type="education",
            title="Bachelor of Technology (B.Tech / B.E.) Degree",
            description=(
                "4-year university undergraduate degree in Engineering / Technical Specialization. "
                "Covers core curriculum, lab practicums, industry internships, and capstone projects."
            ),
            duration_estimate_months=48,
            cost_estimate=480000,
            cost_currency=currency,
            milestone_ids=[],
            institution_ids=[pA_inst_id],
            evidence_ids=[root_evidence_id],
            prerequisite_node_ids=[pA_node1_id],
            purpose_fit="Core educational credential required for accredited professional engineering roles and corporate recruitment.",
            alternatives_summary="Lateral entry B.Tech via polytechnic diploma or B.Sc. in Computer Science/IT.",
            potential_outcomes=["Software Engineer", "Systems Engineer", "Mechanical Designer", "Graduate Studies (M.Tech/MS)"],
            required_subjects=route_a_subjs,
            min_grade_or_score="Minimum 50-60% aggregate in Class 12 PCM + Entrance Exam Rank",
            entrance_exams=["JEE Main", "State CET", "University Entrance Exam"],
            eligibility_conditions=["Pass Class 12 with Physics, Mathematics, and Chemistry/CS"],
            application_materials=["Entrance Scorecard", "Class 12 Marksheet", "Counselling Allotment Letter"],
            unqualified_consequence="Apply to private autonomous institutes, state regional engineering colleges, or repeat entrance exam.",
            start_date="August 2028",
            application_window="June - July 2028",
            expected_decision_date="July 2028",
            next_decision_date="May 2032",
            tuition_amount=360000,
            living_expenses=100000,
            fees_estimate=20000,
            staged_payments=[
                StagedPayment(stage_name="Year 1 University Tuition", amount=120000, currency=currency, due_date="August 2028"),
                StagedPayment(stage_name="Year 2 University Tuition", amount=120000, currency=currency, due_date="July 2029"),
                StagedPayment(stage_name="Year 3 University Tuition", amount=120000, currency=currency, due_date="July 2030"),
                StagedPayment(stage_name="Year 4 University Tuition", amount=120000, currency=currency, due_date="July 2031"),
            ],
            scholarship_eligibility=["AICTE Pragati / Saksham", "Central Sector Scholarship"],
            funding_gap=max(0, 120000 - annual_budget),
            loan_interest_rate=8.85,
            loan_monthly_payment=calculate_loan_emi(max(0, 480000 - (annual_budget * 4)))["monthly_emi"],
            financial_status="tight" if annual_budget < 120000 else "feasible",
            source_links=["https://aicte-india.org"],
            verified_status="verified",
            admission_uncertainty="high",
            actionable_fallback="Government-subsidized state engineering colleges or lateral polytechnic bridge.",
            pathway_id="path_a_entrance",
            feasibility_status="FEASIBLE",
        )
    )

    # Node A3: Engineering Career
    nodes.append(
        Node(
            node_id=pA_node3_id,
            node_type="career",
            title="Graduate Professional Engineer / Technical Specialist",
            description=(
                "Full-time technical employment in engineering design, software development, or industrial operations. "
                "Typical campus placement or graduate recruitment pipeline."
            ),
            duration_estimate_months=24,
            cost_estimate=0,
            cost_currency=currency,
            prerequisite_node_ids=[pA_node2_id],
            purpose_fit="Realizes long-term career outcome aligned with physics, systems, and logical problem-solving strengths.",
            alternatives_summary="Higher technical specialization (M.Tech), MBA, or public sector engineering exams (GATE, ESE).",
            potential_outcomes=["Senior Engineer", "Project Lead", "Technical Consultant"],
            required_subjects=["Degree in Engineering"],
            min_grade_or_score="60% or 6.5+ CGPA in B.Tech",
            unqualified_consequence="Target entry-level technician or service engineer roles and build practical portfolio.",
            start_date="July 2032",
            staged_payments=[],
            verified_status="unverified",
            admission_uncertainty="low",
            actionable_fallback="Graduate apprenticeship (NATS scheme) or skill bootcamp certification.",
            pathway_id="path_a_entrance",
            feasibility_status="FEASIBLE",
        )
    )

    edges.append(Edge(edge_id=f"edge_A1_{uuid.uuid4().hex[:6]}", source_node_id=root_node_id, target_node_id=pA_node1_id, edge_type="progression"))
    edges.append(Edge(edge_id=f"edge_A2_{uuid.uuid4().hex[:6]}", source_node_id=pA_node1_id, target_node_id=pA_node2_id, edge_type="conditional", condition="Requires meeting qualifying cutoff in entrance examination"))
    edges.append(Edge(edge_id=f"edge_A3_{uuid.uuid4().hex[:6]}", source_node_id=pA_node2_id, target_node_id=pA_node3_id, edge_type="progression"))

    route_a = PathwayRoute(
        pathway_id="path_a_entrance",
        route_name=route_a_name,
        category="engineering_entrance",
        summary="Comprehensive academic route through Class 11-12 PCM and university entrance into a full 4-year degree.",
        total_duration_months=72,
        total_cost=620000,
        currency=currency,
        staged_payments=[
            StagedPayment(stage_name="Class 11 Tuition & Fees", amount=70000, currency=currency, due_date="June 2026"),
            StagedPayment(stage_name="Class 12 Tuition & Coaching", amount=70000, currency=currency, due_date="May 2027"),
            StagedPayment(stage_name="B.Tech Year 1", amount=120000, currency=currency, due_date="August 2028"),
            StagedPayment(stage_name="B.Tech Year 2", amount=120000, currency=currency, due_date="July 2029"),
            StagedPayment(stage_name="B.Tech Year 3", amount=120000, currency=currency, due_date="July 2030"),
            StagedPayment(stage_name="B.Tech Year 4", amount=120000, currency=currency, due_date="July 2031"),
        ],
        available_funding=["AICTE Pragati / Saksham Scholarships", "State Post-Matric Scholarships", "Need-Based Fee Waivers"],
        entry_requirements=route_a_subjs,
        potential_outcomes=["Graduate Engineer", "Software Developer", "Technical Analyst", "Higher Education (MS/M.Tech)"],
        risks=["High entrance exam competition", "Substantial multi-year financial commitment", "Coaching burnout risk"],
        fallback_route="If entrance cutoff missed: Transfer to government polytechnic diploma or state regional affiliated colleges.",
        node_ids=[pA_node1_id, pA_node2_id, pA_node3_id],
    )
    routes.append(evaluate_pathway_feasibility(profile, route_a))

    # =========================================================================
    # PATH B: POLYTECHNIC DIPLOMA ROUTE
    # =========================================================================
    pB_node1_id = f"node_pB_step1_{uuid.uuid4().hex[:6]}"
    pB_node2_id = f"node_pB_step2_{uuid.uuid4().hex[:6]}"
    pB_node3_id = f"node_pB_step3_{uuid.uuid4().hex[:6]}"

    # Node B1: Polytechnic Diploma (3 Years directly after Class 10)
    nodes.append(
        Node(
            node_id=pB_node1_id,
            node_type="education",
            title="3-Year Polytechnic Diploma in Applied Engineering",
            description=(
                "Applied 3-year technical diploma directly after Class 10. Emphasizes workshop practice, "
                "laboratory engineering, applied mathematics, and hands-on technical skills."
            ),
            duration_estimate_months=36,
            cost_estimate=105000,
            cost_currency=currency,
            prerequisite_node_ids=[root_node_id],
            purpose_fit="Ideal for students seeking practical, hands-on learning without 2 years of high-stress entrance exam coaching.",
            alternatives_summary="Can either enter technical workforce after Year 3 or lateral-enter directly into 2nd year B.Tech.",
            potential_outcomes=["Junior Engineer / Technical Supervisor", "Eligible for Lateral Entry B.Tech Year 2"],
            required_subjects=route_b_subjs,
            min_grade_or_score="Class 10 pass with min 35-50% in Science and Math",
            entrance_exams=["State Polytechnic Entrance Exam (e.g. JEECUP / POLYCET) or 10th Merit"],
            eligibility_conditions=["Class 10 passed from recognized board"],
            application_materials=["Class 10 Marksheet", "Domicile Certificate", "Category Certificate (if applicable)"],
            unqualified_consequence="Direct admission in approved private polytechnics or 1-year ITI certification.",
            start_date="July 2026",
            application_window="April - June 2026",
            expected_decision_date="June 2026",
            next_decision_date="May 2029",
            tuition_amount=60000,
            living_expenses=35000,
            fees_estimate=10000,
            staged_payments=[
                StagedPayment(stage_name="Diploma Year 1 Tuition", amount=35000, currency=currency, due_date="July 2026"),
                StagedPayment(stage_name="Diploma Year 2 Tuition", amount=35000, currency=currency, due_date="July 2027"),
                StagedPayment(stage_name="Diploma Year 3 Tuition", amount=35000, currency=currency, due_date="July 2028"),
            ],
            scholarship_eligibility=["State Polytechnic Scholarship", "AICTE Swanath Scholarship"],
            funding_gap=max(0, 35000 - annual_budget),
            financial_status="feasible",
            source_links=["https://www.aicte-india.org/bureaus/policy-academic-planning/polytechnic"],
            verified_status="verified",
            admission_uncertainty="low",
            actionable_fallback="Apply to second-round state polytechnic counselling or community polytechnics.",
            pathway_id="path_b_diploma",
            feasibility_status="FEASIBLE",
        )
    )

    # Node B2: Lateral Entry B.Tech or Technical Employment
    nodes.append(
        Node(
            node_id=pB_node2_id,
            node_type="education",
            title="Lateral Entry B.Tech (Direct 2nd Year) OR Technical Employment",
            description=(
                "Flexible junction point: Diploma graduates can either join industry as Junior Engineers "
                "or enter Year 2 of B.Tech through lateral entry (LEET) quota, completing the degree in 3 years."
            ),
            duration_estimate_months=36,
            cost_estimate=270000,
            cost_currency=currency,
            prerequisite_node_ids=[pB_node1_id],
            purpose_fit="Allows the student to start earning immediately or upgrade to full B.Tech with identical qualification validity.",
            alternatives_summary="Immediate employment in manufacturing, maintenance, or technical services.",
            potential_outcomes=["B.Tech Graduate Engineer", "Junior Technical Specialist"],
            required_subjects=["Polytechnic Diploma in relevant engineering branch"],
            min_grade_or_score="Minimum 45-50% in Diploma",
            entrance_exams=["State Lateral Entry Entrance Test (LEET)"],
            eligibility_conditions=["3-year Diploma passed"],
            unqualified_consequence="Work for 1-2 years and pursue Part-Time / AMIE degree while earning.",
            start_date="August 2029",
            staged_payments=[
                StagedPayment(stage_name="Lateral B.Tech Year 2", amount=90000, currency=currency, due_date="August 2029"),
                StagedPayment(stage_name="Lateral B.Tech Year 3", amount=90000, currency=currency, due_date="July 2030"),
                StagedPayment(stage_name="Lateral B.Tech Year 4", amount=90000, currency=currency, due_date="July 2031"),
            ],
            verified_status="verified",
            admission_uncertainty="medium",
            actionable_fallback="Take employment as Junior Engineer and pursue distance/part-time technical credentials.",
            pathway_id="path_b_diploma",
            feasibility_status="FEASIBLE",
        )
    )

    # Node B3: Engineering Career
    nodes.append(
        Node(
            node_id=pB_node3_id,
            node_type="career",
            title="Field / Junior Engineer to Project Engineer",
            description=(
                "Strong technical trajectory combining hands-on diploma craftsmanship with engineering theoretical skills. "
                "Highly favored in plant operations, site engineering, and automation industries."
            ),
            duration_estimate_months=24,
            cost_estimate=0,
            cost_currency=currency,
            prerequisite_node_ids=[pB_node2_id],
            purpose_fit="Accelerates practical industry readiness with lower debt and financial stress on parents.",
            alternatives_summary="Specialized technical certifications in PLC, CAD, or Cloud infrastructure.",
            potential_outcomes=["Plant Supervisor", "Maintenance Lead", "Commissioning Engineer"],
            required_subjects=["Diploma or B.Tech in Engineering"],
            staged_payments=[],
            verified_status="unverified",
            actionable_fallback="Apprenticeship under NATS or state public sector undertaking exams.",
            pathway_id="path_b_diploma",
            feasibility_status="FEASIBLE",
        )
    )

    edges.append(Edge(edge_id=f"edge_B1_{uuid.uuid4().hex[:6]}", source_node_id=root_node_id, target_node_id=pB_node1_id, edge_type="alternative"))
    edges.append(Edge(edge_id=f"edge_B2_{uuid.uuid4().hex[:6]}", source_node_id=pB_node1_id, target_node_id=pB_node2_id, edge_type="progression"))
    edges.append(Edge(edge_id=f"edge_B3_{uuid.uuid4().hex[:6]}", source_node_id=pB_node2_id, target_node_id=pB_node3_id, edge_type="progression"))

    route_b = PathwayRoute(
        pathway_id="path_b_diploma",
        route_name=route_b_name,
        category="diploma",
        summary="Affordable, applied 3-year polytechnic diploma with dual-exit: direct technical job or 2nd-year lateral B.Tech entry.",
        total_duration_months=36,
        total_cost=105000,
        currency=currency,
        staged_payments=[
            StagedPayment(stage_name="Diploma Year 1 Tuition", amount=35000, currency=currency, due_date="July 2026"),
            StagedPayment(stage_name="Diploma Year 2 Tuition", amount=35000, currency=currency, due_date="July 2027"),
            StagedPayment(stage_name="Diploma Year 3 Tuition", amount=35000, currency=currency, due_date="July 2028"),
        ],
        available_funding=["State Government Fee Reimbursement", "AICTE Swanath Scheme", "Apprenticeship Stipend"],
        entry_requirements=route_b_subjs,
        potential_outcomes=["Junior Engineer", "CAD / Design Specialist", "Technical Officer", "Lateral Entry B.Tech"],
        risks=["Lower starting salary than premier IIT/NIT graduates", "Must maintain 50%+ for smooth lateral entry"],
        fallback_route="If lateral entry seats unavailable: Enter industry as Junior Engineer directly after Year 3.",
        node_ids=[pB_node1_id, pB_node2_id, pB_node3_id],
    )
    routes.append(evaluate_pathway_feasibility(profile, route_b))

    # =========================================================================
    # PATH C: VOCATIONAL & APPLIED SKILLS ROUTE
    # =========================================================================
    pC_node1_id = f"node_pC_step1_{uuid.uuid4().hex[:6]}"
    pC_node2_id = f"node_pC_step2_{uuid.uuid4().hex[:6]}"
    pC_node3_id = f"node_pC_step3_{uuid.uuid4().hex[:6]}"

    # Node C1: Vocational / ITI Qualification (1-2 Years)
    nodes.append(
        Node(
            node_id=pC_node1_id,
            node_type="certification",
            title="Industrial Training Institute (ITI) / National Skills Qualification",
            description=(
                "Intensive 1-2 year technical or vocational trade qualification (e.g. Electrician, Fitter, Mechatronics, "
                "Computer Operator & Programming Assistant). Highly subsidized tuition with direct workshop mastery."
            ),
            duration_estimate_months=24,
            cost_estimate=25000,
            cost_currency=currency,
            prerequisite_node_ids=[root_node_id],
            purpose_fit="Fastest route to formal technical qualification and direct income generation with minimal upfront expense.",
            alternatives_summary="Can advance to Diploma or National Craft Instructor Certificate later.",
            potential_outcomes=["Certified Trade Technician", "Apprentice in Public/Private Sector"],
            required_subjects=route_c_subjs,
            min_grade_or_score="Class 10 pass",
            entrance_exams=["State ITI merit counselling"],
            eligibility_conditions=["Age 14+ and passed secondary school"],
            application_materials=["Class 10 Certificate", "Age Proof"],
            unqualified_consequence="Short-term Pradhan Mantri Kaushal Vikas Yojana (PMKVY) skill courses.",
            start_date="August 2026",
            application_window="June - July 2026",
            expected_decision_date="July 2026",
            next_decision_date="July 2028",
            tuition_amount=12000,
            living_expenses=10000,
            fees_estimate=3000,
            staged_payments=[
                StagedPayment(stage_name="ITI Year 1 Course & Tool Kit", amount=13000, currency=currency, due_date="August 2026"),
                StagedPayment(stage_name="ITI Year 2 Course Fee", amount=12000, currency=currency, due_date="August 2027"),
            ],
            scholarship_eligibility=["National Apprenticeship Promotion Scheme (NAPS) Stipend"],
            funding_gap=0,
            financial_status="feasible",
            source_links=["https://dgt.gov.in"],
            verified_status="verified",
            admission_uncertainty="low",
            actionable_fallback="Government Skill Training Centre or district vocational institute.",
            pathway_id="path_c_vocational",
            feasibility_status="FEASIBLE",
        )
    )

    # Node C2: Apprenticeship & Industrial Training
    nodes.append(
        Node(
            node_id=pC_node2_id,
            node_type="exploration",
            title="National Apprenticeship Scheme (NATS / NAPS) & On-The-Job Training",
            description=(
                "1-year paid industry apprenticeship with monthly stipend (₹8,000–₹12,000/mo). "
                "Converts academic technical qualification into real factory and site operating experience."
            ),
            duration_estimate_months=12,
            cost_estimate=0,
            cost_currency=currency,
            prerequisite_node_ids=[pC_node1_id],
            purpose_fit="Provides cash flow positivity: student earns stipend while learning rather than paying tuition.",
            alternatives_summary="Immediate entry into SME manufacturing or repair service workshops.",
            potential_outcomes=["National Apprenticeship Certificate (NAC)", "Permanent Industry Technician Offer"],
            required_subjects=["National Trade Certificate (NTC) from ITI"],
            staged_payments=[],
            verified_status="verified",
            admission_uncertainty="low",
            actionable_fallback="Direct entry into local service center or electrical contracting apprenticeship.",
            pathway_id="path_c_vocational",
            feasibility_status="FEASIBLE",
        )
    )

    # Node C3: Skilled Technical Employment & Progression
    nodes.append(
        Node(
            node_id=pC_node3_id,
            node_type="career",
            title="Certified Skilled Technician / Self-Employed Technical Contractor",
            description=(
                "Reliable, high-demand skilled employment across railways, public utilities, manufacturing plants, "
                "or independent technical entrepreneurship. Option to pursue lateral diploma while working."
            ),
            duration_estimate_months=24,
            cost_estimate=0,
            cost_currency=currency,
            prerequisite_node_ids=[pC_node2_id],
            purpose_fit="Zero educational debt, immediate independence, and verified pathway to lateral qualifications later in career.",
            alternatives_summary="Start independent servicing or electrical/mechanical contracting enterprise.",
            potential_outcomes=["Master Technician", "Plant Operator", "Workshop Business Owner"],
            required_subjects=["Trade certification"],
            staged_payments=[],
            verified_status="unverified",
            actionable_fallback="State technical board evening classes for diploma upgrade.",
            pathway_id="path_c_vocational",
            feasibility_status="FEASIBLE",
        )
    )

    edges.append(Edge(edge_id=f"edge_C1_{uuid.uuid4().hex[:6]}", source_node_id=root_node_id, target_node_id=pC_node1_id, edge_type="alternative"))
    edges.append(Edge(edge_id=f"edge_C2_{uuid.uuid4().hex[:6]}", source_node_id=pC_node1_id, target_node_id=pC_node2_id, edge_type="progression"))
    edges.append(Edge(edge_id=f"edge_C3_{uuid.uuid4().hex[:6]}", source_node_id=pC_node2_id, target_node_id=pC_node3_id, edge_type="progression"))

    route_c = PathwayRoute(
        pathway_id="path_c_vocational",
        route_name=route_c_name,
        category="vocational",
        summary="Rapid, low-cost technical skill route with paid apprenticeship, zero debt, and fastest timeline to independent income.",
        total_duration_months=24,
        total_cost=25000,
        currency=currency,
        staged_payments=[
            StagedPayment(stage_name="ITI Course & Tools", amount=13000, currency=currency, due_date="August 2026"),
            StagedPayment(stage_name="ITI Examination & Practical", amount=12000, currency=currency, due_date="August 2027"),
        ],
        available_funding=["NAPS Monthly Apprenticeship Stipend", "State Free Tool Kit Scheme"],
        entry_requirements=route_c_subjs,
        potential_outcomes=["Certified Technician", "Factory Specialist", "Independent Contractor", "Railway / Utility Technician"],
        risks=["Lower starting educational ceiling without later diploma upgrade", "Physically demanding work environments"],
        fallback_route="If trade enrollment unavailable: State short-term PMKVY certified skill programs.",
        node_ids=[pC_node1_id, pC_node2_id, pC_node3_id],
    )
    routes.append(evaluate_pathway_feasibility(profile, route_c))

    # Cross-pathway alternative edges
    edges.append(
        Edge(
            edge_id=f"edge_cross_AB_{uuid.uuid4().hex[:6]}",
            source_node_id=pA_node1_id,
            target_node_id=pB_node1_id,
            edge_type="conditional",
            condition="Fallback route if entrance prep or senior secondary stream is not preferred",
        )
    )
    edges.append(
        Edge(
            edge_id=f"edge_cross_BC_{uuid.uuid4().hex[:6]}",
            source_node_id=pB_node1_id,
            target_node_id=pC_node1_id,
            edge_type="conditional",
            condition="Alternative if urgent employment or hands-on trade training is required",
        )
    )

    # Build Comparison Matrix
    comparison_matrix = {
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
        "summary": (
            f"Multi-pathway analysis for {preferred_name}: Compare Path A (University/Entrance route), "
            f"Path B (Polytechnic Diploma route), and Path C (Vocational skill route). "
            f"Review trade-offs across duration, staged cost, entrance risk, and career ceiling."
        ),
    }

    graph = PathwayGraph(
        pathway_id=f"comparison-graph-{profile.get('id', 'student')}",
        nodes=nodes,
        edges=edges,
        target_outcome=(
            f"Personalized multi-pathway decision support for {preferred_name}. "
            "Compare timeline, staged cash-flow feasibility, prerequisites, evidence, and actionable fallbacks."
        ),
        schema_version="2.0",
        evidence_records=evidence_records,
        milestones=milestones,
        institutions=institutions,
        funding_opportunities=funding_opportunities,
        pathway_routes=routes,
        ranking_explanations=[
            "Rankings prioritize feasibility first (academic eligibility and cash flow availability), then balance cost, duration, and career ceiling.",
            "Use pairwise preference comparison to tune rankings to your family's personal priorities."
        ],
        comparison_matrix=comparison_matrix,
    )

    return graph, routes

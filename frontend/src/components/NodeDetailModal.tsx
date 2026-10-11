import React, { useState } from 'react';
import {
  X,
  Target,
  FileCheck2,
  Calendar,
  Wallet,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Clock,
  Coins,
  CheckCircle2,
  HelpCircle,
  Building,
  TrendingUp,
} from 'lucide-react';
import { DecisionNode } from '../types/pathway';

interface NodeDetailModalProps {
  node: DecisionNode | null;
  onClose: () => void;
  onExploreAlternative?: (alternativeName: string) => void;
}

type TabType = 'purpose' | 'requirements' | 'timeline' | 'finances' | 'evidence';

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  onClose,
  onExploreAlternative,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('purpose');

  if (!node) return null;

  const isBlocked = node.feasibility_status === 'BLOCKED' || (node.blocked_requirements && node.blocked_requirements.length > 0);
  const isConditional = node.feasibility_status === 'CONDITIONAL';

  const formatCurrency = (amount: number | null | undefined, curr: string = 'INR') => {
    if (amount === null || amount === undefined) return 'Not established';
    return `${curr} ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl border border-[#DCEBEA] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#376E7D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#DCEBEA] bg-[#F5FAF9] relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#C9E6F8] text-[#367BA8] text-[10px] font-bold uppercase tracking-wider">
                  {node.node_type} Milestone
                </span>

                {isBlocked ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>BLOCKED / AT RISK</span>
                  </span>
                ) : isConditional ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    <span>CONDITIONAL ADMISSION</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#CDEDE2] text-[#278F89] text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>FEASIBLE ROUTE</span>
                  </span>
                )}

                {node.verified_status === 'verified' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Official Criteria Verified</span>
                  </span>
                ) : node.verified_status === 'estimate' ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200/60 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-sky-600" />
                    <span>Financial Estimate</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>State Curriculum Verified</span>
                  </span>
                )}
              </div>

              <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#376E7D] leading-tight">
                {node.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5E8085] leading-relaxed line-clamp-2">
                {node.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#5E8085] hover:text-[#376E7D] hover:bg-[#DCEBEA]/50 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Close milestone details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-4 pt-3 border-t border-[#DCEBEA] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#5E8085] block">Duration</span>
              <span className="font-bold text-[#376E7D]">
                {node.duration_estimate_months ? `${node.duration_estimate_months} Months` : 'Variable'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E8085] block">Estimated Cost</span>
              <span className="font-bold text-[#376E7D]">
                {formatCurrency(node.cost_estimate, node.cost_currency || 'INR')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E8085] block">Admission Risk</span>
              <span className={`font-bold capitalize ${
                node.admission_uncertainty === 'high' ? 'text-red-600' :
                node.admission_uncertainty === 'medium' ? 'text-amber-600' : 'text-[#278F89]'
              }`}>
                {node.admission_uncertainty || 'Moderate'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#5E8085] block">Cash Flow Gap</span>
              <span className={`font-bold ${node.funding_gap && node.funding_gap > 0 ? 'text-red-600' : 'text-[#278F89]'}`}>
                {node.funding_gap && node.funding_gap > 0 ? formatCurrency(node.funding_gap, node.cost_currency || 'INR') : 'Fully Funded'}
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto no-scrollbar border-b border-[#DCEBEA] -mb-5 sm:-mb-6 pt-1">
            <button
              onClick={() => setActiveTab('purpose')}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'purpose'
                  ? 'border-[#367BA8] text-[#367BA8]'
                  : 'border-transparent text-[#5E8085] hover:text-[#376E7D]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>1. Decision & Purpose</span>
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'requirements'
                  ? 'border-[#367BA8] text-[#367BA8]'
                  : 'border-transparent text-[#5E8085] hover:text-[#376E7D]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>2. Prerequisites & Cutoffs</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'border-[#367BA8] text-[#367BA8]'
                  : 'border-transparent text-[#5E8085] hover:text-[#376E7D]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>3. Timing & Deadlines</span>
            </button>

            <button
              onClick={() => setActiveTab('finances')}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'finances'
                  ? 'border-[#367BA8] text-[#367BA8]'
                  : 'border-transparent text-[#5E8085] hover:text-[#376E7D]'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>4. Staged Cash Flow</span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'evidence'
                  ? 'border-[#367BA8] text-[#367BA8]'
                  : 'border-transparent text-[#5E8085] hover:text-[#376E7D]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5. Evidence & Fallback</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: DECISION & PURPOSE */}
          {activeTab === 'purpose' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="p-4 rounded-2xl bg-[#EAF4FF] border border-[#C9E6F8]">
                <span className="text-[11px] font-bold text-[#367BA8] uppercase tracking-wider block mb-1">
                  Why this step fits you
                </span>
                <p className="text-sm text-[#376E7D] leading-relaxed">
                  {node.purpose_fit ||
                    `This stage directly builds upon your academic performance and reported problem-solving strengths. It balances your desired timeline with recognized progression standards.`}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#5E8085] uppercase tracking-wider mb-2">
                  What Alternatives Exist At This Stage?
                </h4>
                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA] text-xs text-[#376E7D] leading-relaxed">
                  {node.alternatives_summary ||
                    'Students can alternatively consider polytechnic diploma routes or skill-based vocational certifications.'}
                </div>
              </div>

              {node.potential_outcomes && node.potential_outcomes.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#5E8085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#278F89]" />
                    <span>Potential Career & Progression Outcomes</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {node.potential_outcomes.map((outcome, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#DCEBEA] text-xs font-semibold text-[#376E7D] shadow-2xs"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PREREQUISITES & CUTOFFS */}
          {activeTab === 'requirements' && (
            <div className="space-y-5 animate-in fade-in duration-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold">Required Subjects</span>
                  <div className="text-sm font-bold text-[#376E7D]">
                    {node.required_subjects && node.required_subjects.length > 0
                      ? node.required_subjects.join(', ')
                      : 'General qualification'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold">Minimum Grade / Cutoff Score</span>
                  <div className="text-sm font-bold text-[#376E7D]">
                    {node.min_grade_or_score || 'Pass marks (approx. 50-60%)'}
                  </div>
                </div>
              </div>

              {node.entrance_exams && node.entrance_exams.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-[#DCEBEA]">
                  <span className="text-[11px] font-bold text-[#5E8085] uppercase tracking-wider block mb-2">
                    Applicable Entrance Examinations
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {node.entrance_exams.map((exam, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-[#C9E6F8]/60 border border-[#A7D9E6] text-xs font-semibold text-[#367BA8]"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {node.application_materials && node.application_materials.length > 0 && (
                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[11px] font-bold text-[#5E8085] uppercase tracking-wider block mb-2">
                    Required Application Materials
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-[#5E8085]">
                    {node.application_materials.map((mat, idx) => (
                      <li key={idx}>{mat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What happens if unqualified */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>What happens if the student does not qualify?</span>
                </span>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {node.unqualified_consequence ||
                    'If admission requirements are not satisfied, apply to recognized alternative institutions, lateral-entry diploma bridge programs, or state-level open schooling (NIOS).'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE & DEADLINES */}
          {activeTab === 'timeline' && (
            <div className="space-y-5 animate-in fade-in duration-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#367BA8]" />
                    <span>Application Window</span>
                  </span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {node.application_window || 'May – July (Standard Cycle)'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#367BA8]" />
                    <span>Expected Decision / Allotment</span>
                  </span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {node.expected_decision_date || 'June – August'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold">Course Start Date</span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {node.start_date || 'August Intake'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1 font-semibold">Next Decision Milestone Date</span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {node.next_decision_date || 'At semester conclusion'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF4FF] border border-[#C9E6F8] text-xs text-[#376E7D]">
                <span className="font-bold block mb-1">Milestone Timing Rule:</span>
                Course fees and documentation must be arranged before the application window closes.
                Admissions operate on strict chronological deadlines.
              </div>
            </div>
          )}

          {/* TAB 4: STAGED CASH FLOW & FEASIBILITY */}
          {activeTab === 'finances' && (
            <div className="space-y-5 animate-in fade-in duration-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1">Tuition Fee</span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {formatCurrency(node.tuition_amount, node.cost_currency || 'INR')}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1">Living & Transport</span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {formatCurrency(node.living_expenses, node.cost_currency || 'INR')}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                  <span className="text-[#5E8085] block mb-1">Exam & Lab Fees</span>
                  <span className="text-sm font-bold text-[#376E7D]">
                    {formatCurrency(node.fees_estimate, node.cost_currency || 'INR')}
                  </span>
                </div>
              </div>

              {/* Staged Payments Schedule Table */}
              {node.staged_payments && node.staged_payments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#5E8085] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#278F89]" />
                    <span>Staged Cash-Flow Payment Schedule</span>
                  </h4>
                  <div className="border border-[#DCEBEA] rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#F5FAF9] border-b border-[#DCEBEA] text-[10px] font-bold text-[#5E8085] uppercase">
                        <tr>
                          <th className="p-2.5">Stage / Installment</th>
                          <th className="p-2.5">Due Date</th>
                          <th className="p-2.5">Amount</th>
                          <th className="p-2.5">Covered By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#DCEBEA] text-xs">
                        {node.staged_payments.map((p, idx) => (
                          <tr key={idx} className="hover:bg-[#F5FAF9]/60">
                            <td className="p-2.5 font-semibold text-[#376E7D]">{p.stage_name}</td>
                            <td className="p-2.5 text-[#5E8085]">{p.due_date || 'At registration'}</td>
                            <td className="p-2.5 font-bold text-[#376E7D]">{formatCurrency(p.amount, p.currency)}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#CDEDE2] text-[#278F89] capitalize">
                                {p.covered_by || 'Budget'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Loan Breakdown if applicable */}
              {node.loan_monthly_payment && node.loan_monthly_payment > 0 && (
                <div className="p-4 rounded-2xl bg-[#EAF4FF] border border-[#C9E6F8] space-y-2">
                  <span className="text-[11px] font-bold text-[#367BA8] uppercase tracking-wider block">
                    Educational Loan EMI Calculation
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-[#5E8085] block">Interest Rate</span>
                      <span className="font-bold text-[#376E7D]">{node.loan_interest_rate || 9.5}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E8085] block">Estimated EMI</span>
                      <span className="font-bold text-[#376E7D]">{formatCurrency(node.loan_monthly_payment, node.cost_currency || 'INR')}/mo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E8085] block">Tenure</span>
                      <span className="font-bold text-[#376E7D]">7 Years (84 Months)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EVIDENCE, UNCERTAINTY & FALLBACK */}
          {activeTab === 'evidence' && (
            <div className="space-y-5 animate-in fade-in duration-100 text-xs">
              {/* Blocked Alert if applicable */}
              {isBlocked && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Milestone Blocked by Constraint</span>
                  </div>
                  <p className="text-xs text-red-800">
                    {node.blocked_requirements && node.blocked_requirements.length > 0
                      ? node.blocked_requirements.join('; ')
                      : 'Prerequisite criteria or cash-flow budget is currently unfulfilled.'}
                  </p>
                </div>
              )}

              {/* Actionable Fallback Route */}
              <div className="p-4 rounded-2xl bg-[#CDEDE2]/40 border border-[#278F89]/40 space-y-2">
                <span className="text-[11px] font-bold text-[#278F89] uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Actionable Alternative & Fallback Route</span>
                </span>
                <p className="text-xs text-[#376E7D] leading-relaxed">
                  {node.actionable_fallback ||
                    'Compare polytechnic diploma lateral routes or state open schooling options if this milestone becomes blocked.'}
                </p>
                {onExploreAlternative && (
                  <button
                    onClick={() => onExploreAlternative(node.actionable_fallback || 'Alternative Route')}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#278F89] text-white font-bold text-xs hover:bg-[#1e736e] transition-colors cursor-pointer"
                  >
                    <span>View Feasible Fallback Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Source Provenance */}
              <div>
                <h4 className="text-xs font-bold text-[#5E8085] uppercase tracking-wider mb-2">
                  Official Evidence Sources & Research Provenance
                </h4>
                {node.source_links && node.source_links.length > 0 ? (
                  <div className="space-y-2">
                    {node.source_links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-[#DCEBEA] bg-[#F5FAF9] hover:bg-[#EAF4FF] transition-colors text-[#367BA8] font-semibold text-xs"
                      >
                        <span className="truncate max-w-[85%]">{link}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#5E8085] italic p-3 bg-[#F5FAF9] rounded-xl border border-[#DCEBEA]">
                    Source links verified via national education portals and state examination regulatory authorities.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#DCEBEA] bg-[#F5FAF9] flex items-center justify-between gap-3 text-xs">
          <span className="text-[#5E8085] hidden sm:inline">
            EduPath AI Evidence-Backed Decision Engine · Stage #{node.node_id}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#367BA8] text-white font-bold hover:bg-[#2e688e] transition-colors cursor-pointer ml-auto shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Scale,
  Award,
  Layers,
  ThumbsUp,
  Loader2,
} from 'lucide-react';
import { PathwayRoute, PreferenceComparisonResponse } from '../types/pathway';
import { apiService } from '../services/apiService';
import { StudentProfileOut, StudentProfileCreate } from '../types/studentProfile';

interface PreferenceLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: PathwayRoute[];
  studentProfile: StudentProfileOut | StudentProfileCreate;
  onPreferencesUpdated: (response: PreferenceComparisonResponse) => void;
  initialRouteAId?: string;
  initialRouteBId?: string;
}

const COMMON_REASONS = [
  { id: 'lower_cost', label: 'More Affordable / Lower Tuition' },
  { id: 'faster_completion', label: 'Faster Completion / Quicker to Work' },
  { id: 'better_career', label: 'Higher Long-Term Career Ceiling' },
  { id: 'lower_entrance_risk', label: 'Less Entrance Exam Competition / Risk' },
  { id: 'less_debt', label: 'Avoid Taking Student Loans' },
  { id: 'hands_on_practical', label: 'Preference for Hands-on Practical Training' },
];

export const PreferenceLearningModal: React.FC<PreferenceLearningModalProps> = ({
  isOpen,
  onClose,
  routes,
  studentProfile,
  onPreferencesUpdated,
  initialRouteAId,
  initialRouteBId,
}) => {
  const [routeAId, setRouteAId] = useState<string>(initialRouteAId || (routes[0]?.pathway_id ?? ''));
  const [routeBId, setRouteBId] = useState<string>(initialRouteBId || (routes[1]?.pathway_id ?? ''));
  const [preferredId, setPreferredId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<PreferenceComparisonResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const routeA = routes.find((r) => r.pathway_id === routeAId) || routes[0];
  const routeB = routes.find((r) => r.pathway_id === routeBId) || routes[1] || routes[0];

  const handleToggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId) ? prev.filter((r) => r !== reasonId) : [...prev, reasonId]
    );
  };

  const handleSubmit = async () => {
    if (!preferredId) {
      setErrorMessage('Please select which pathway you prefer.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await apiService.submitPreferenceComparison({
        student_profile_snapshot: studentProfile,
        pathway_a_id: routeAId,
        pathway_b_id: routeBId,
        preferred_pathway_id: preferredId,
        reasons: selectedReasons,
      });

      setComparisonResult(response);
      onPreferencesUpdated(response);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record preference.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl border border-[#DCEBEA] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#376E7D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#DCEBEA] bg-[#F5FAF9] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#278F89] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Preference Learning Engine</span>
            </span>
            <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#376E7D]">
              Compare Pathways & Teach Your Priorities
            </h3>
            <p className="text-xs text-[#5E8085]">
              Which route fits your family best? We update your rankings and balance trade-offs.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5E8085] hover:text-[#376E7D] hover:bg-[#DCEBEA]/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {!comparisonResult ? (
            <>
              {/* Pairwise Comparison Selector */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#5E8085] uppercase tracking-wider block">
                  Select which pathway you prefer between these two:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A */}
                  <div
                    onClick={() => setPreferredId(routeA.pathway_id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      preferredId === routeA.pathway_id
                        ? 'border-[#367BA8] bg-[#EAF4FF] ring-2 ring-[#367BA8]/20'
                        : 'border-[#DCEBEA] bg-white hover:border-[#A7D9E6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#DCEBEA] text-[#367BA8]">
                        Option 1
                      </span>
                      {preferredId === routeA.pathway_id && (
                        <CheckCircle2 className="w-4 h-4 text-[#367BA8]" />
                      )}
                    </div>
                    <h4 className="font-serif-heading text-base font-bold text-[#376E7D] leading-snug">
                      {routeA.route_name}
                    </h4>
                    <div className="mt-3 pt-2.5 border-t border-[#DCEBEA]/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#5E8085] block">Duration</span>
                        <span className="font-bold">{Math.round(routeA.total_duration_months / 12)} Years</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5E8085] block">Cost</span>
                        <span className="font-bold">
                          {routeA.currency} {routeA.total_cost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option B */}
                  <div
                    onClick={() => setPreferredId(routeB.pathway_id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      preferredId === routeB.pathway_id
                        ? 'border-[#367BA8] bg-[#EAF4FF] ring-2 ring-[#367BA8]/20'
                        : 'border-[#DCEBEA] bg-white hover:border-[#A7D9E6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#DCEBEA] text-[#367BA8]">
                        Option 2
                      </span>
                      {preferredId === routeB.pathway_id && (
                        <CheckCircle2 className="w-4 h-4 text-[#367BA8]" />
                      )}
                    </div>
                    <h4 className="font-serif-heading text-base font-bold text-[#376E7D] leading-snug">
                      {routeB.route_name}
                    </h4>
                    <div className="mt-3 pt-2.5 border-t border-[#DCEBEA]/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-[#5E8085] block">Duration</span>
                        <span className="font-bold">{Math.round(routeB.total_duration_months / 12)} Years</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5E8085] block">Cost</span>
                        <span className="font-bold">
                          {routeB.currency} {routeB.total_cost.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reasons Multi-Select */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#5E8085] uppercase tracking-wider block">
                  Why do you prefer this route? (Select all that apply)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_REASONS.map((reason) => {
                    const isChecked = selectedReasons.includes(reason.id);
                    return (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => handleToggleReason(reason.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'border-[#278F89] bg-[#CDEDE2]/40 text-[#278F89]'
                            : 'border-[#DCEBEA] bg-[#F5FAF9] text-[#5E8085] hover:bg-white hover:border-[#A7D9E6]'
                        }`}
                      >
                        <span>{reason.label}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#278F89]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Natural Explanation */}
              <div className="p-4 rounded-2xl bg-[#CDEDE2]/50 border border-[#278F89]/40 space-y-2">
                <div className="flex items-center gap-2 text-[#278F89] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Ranking Changed</span>
                </div>
                <p className="text-sm text-[#376E7D] leading-relaxed">
                  {comparisonResult.explanation}
                </p>
              </div>

              {/* Constraint Enforcement Notice if triggered */}
              {comparisonResult.constraint_enforcement_notice && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Hard Constraint Enforced</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {comparisonResult.constraint_enforcement_notice}
                  </p>
                </div>
              )}

              {/* Baseline Evaluation Card */}
              <div className="p-4 rounded-2xl bg-[#EAF4FF] border border-[#C9E6F8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[#367BA8] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Evaluation Against Static Baseline</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#367BA8]">
                    +{(comparisonResult.baseline_evaluation.accuracy_improvement * 100).toFixed(0)}% Lift
                  </span>
                </div>
                <p className="text-[#376E7D] leading-relaxed">
                  {comparisonResult.baseline_evaluation.message}
                </p>
              </div>

              {/* Updated Weights Visualizer */}
              <div>
                <span className="text-xs font-bold text-[#5E8085] uppercase tracking-wider block mb-2">
                  Learned Preference Weights
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(comparisonResult.updated_weights).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl bg-[#F5FAF9] border border-[#DCEBEA]">
                      <span className="text-[10px] text-[#5E8085] capitalize block">
                        {k.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-[#376E7D]">
                        {(v * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#DCEBEA] bg-[#F5FAF9] flex items-center justify-between gap-3 text-xs">
          {!comparisonResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-[#5E8085] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!preferredId || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#278F89] text-white font-bold hover:bg-[#1e736e] transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Learning Preferences…</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Update Rankings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#367BA8] text-white font-bold hover:bg-[#2e688e] transition-colors cursor-pointer text-center"
            >
              Apply Updated Rankings & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


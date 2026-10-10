import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  ArrowRight,
  Loader2,
  TrendingDown,
  ShieldAlert,
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { StudentProfileCreate, StudentProfileOut } from '../types/studentProfile';
import { ScenarioSimulationResponse } from '../types/pathway';

interface ScenarioSimulationWidgetProps {
  studentProfile: StudentProfileOut | StudentProfileCreate;
  onSimulationApplied: (result: ScenarioSimulationResponse) => void;
  onResetBaseline: () => void;
}

export const ScenarioSimulationWidget: React.FC<ScenarioSimulationWidgetProps> = ({
  studentProfile,
  onSimulationApplied,
  onResetBaseline,
}) => {
  const [activeScenario, setActiveScenario] = useState<string>('baseline');
  const [budgetReduction, setBudgetReduction] = useState<number>(30);
  const [fundingAmount, setFundingAmount] = useState<number>(50000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ScenarioSimulationResponse | null>(null);

  const handleSimulate = async (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'baseline') {
      setLastResult(null);
      onResetBaseline();
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.simulateScenario({
        student_profile_snapshot: studentProfile,
        scenario: scenario,
        budget_reduction_percent: budgetReduction,
        funding_amount: fundingAmount,
      });

      setLastResult(response);
      onSimulationApplied(response);
    } catch (err) {
      console.error('Scenario simulation failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DCEBEA] p-5 sm:p-6 shadow-2xs space-y-5 text-[#376E7D]">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCEBEA]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#367BA8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#278F89]" />
            <span>Interactive What-If Decision Simulator</span>
          </span>
          <h4 className="font-serif-heading text-lg font-bold text-[#376E7D] mt-0.5">
            Test Plan Resilience Before Life Happens
          </h4>
          <p className="text-xs text-[#5E8085]">
            If a cutoff is missed or budget changes, we rebuild alternatives and show what is blocked.
          </p>
        </div>

        {activeScenario !== 'baseline' && (
          <button
            onClick={() => handleSimulate('baseline')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCEBEA] text-xs font-semibold text-[#5E8085] hover:text-[#376E7D] hover:bg-[#F5FAF9] transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        )}
      </div>

      {/* 3 Instant Scenario Trigger Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleSimulate('admission')}
          disabled={isLoading}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === 'admission'
              ? 'border-red-400 bg-red-50/80 ring-2 ring-red-400/20'
              : 'border-[#DCEBEA] bg-[#F5FAF9] hover:bg-white hover:border-[#A7D9E6]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-[#376E7D]">Admission Cutoff Missed</span>
          </div>
          <p className="text-[11px] text-[#5E8085] leading-relaxed">
            Test recovery if entrance exam ranks fall short of target university cutoffs.
          </p>
        </button>

        <button
          onClick={() => handleSimulate('scholarship')}
          disabled={isLoading}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === 'scholarship'
              ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20'
              : 'border-[#DCEBEA] bg-[#F5FAF9] hover:bg-white hover:border-[#A7D9E6]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-[#376E7D]">Scholarship Rejected</span>
          </div>
          <p className="text-[11px] text-[#5E8085] leading-relaxed">
            Remove unconfirmed grants and recalculate the exact cash-flow funding gap.
          </p>
        </button>

        <button
          onClick={() => handleSimulate('budget')}
          disabled={isLoading}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeScenario === 'budget'
              ? 'border-blue-400 bg-blue-50/80 ring-2 ring-blue-400/20'
              : 'border-[#DCEBEA] bg-[#F5FAF9] hover:bg-white hover:border-[#A7D9E6]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-[#367BA8] flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs text-[#376E7D]">Family Budget -30%</span>
          </div>
          <p className="text-[11px] text-[#5E8085] leading-relaxed">
            Stress-test staged tuition milestones against an unexpected financial change.
          </p>
        </button>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="p-4 text-center text-xs text-[#367BA8] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Recalculating alternative pathways and verifying feasibility constraints…</span>
        </div>
      )}

      {/* Simulation Feedback Card */}
      {lastResult && !isLoading && (
        <div className="p-4 rounded-2xl bg-[#F5FAF9] border border-[#DCEBEA] space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#278F89] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#278F89]" />
                <span>Simulation Diagnostic Output</span>
              </span>
              <p className="text-xs text-[#376E7D] leading-relaxed font-semibold">
                {lastResult.summary_explanation}
              </p>
            </div>
          </div>

          {lastResult.actionable_next_steps && lastResult.actionable_next_steps.length > 0 && (
            <div className="pt-2 border-t border-[#DCEBEA] space-y-1.5">
              <span className="text-[10px] font-bold text-[#5E8085] uppercase tracking-wider block">
                Actionable Next Steps:
              </span>
              <ul className="space-y-1 text-[#5E8085] pl-4 list-disc">
                {lastResult.actionable_next_steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


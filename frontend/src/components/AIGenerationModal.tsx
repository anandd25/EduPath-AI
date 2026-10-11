import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Brain,
  Zap,
} from 'lucide-react';
import { StudentProfileCreate, StudentProfileOut } from '../types/studentProfile';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfileCreate | StudentProfileOut | null;
  disciplineTitle: string;
  isGenerating?: boolean;
  onTriggerGenerate?: () => void;
}

interface Step {
  id: number;
  label: string;
  detail: string;
  status: 'pending' | 'running' | 'done';
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  studentProfile,
  disciplineTitle,
  isGenerating = false,
  onTriggerGenerate,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [completed, setCompleted] = useState(false);

  const name = studentProfile?.preferred_name || 'Student';
  const overallPct = studentProfile?.overall_percentage || 78;
  const interests = studentProfile?.interests || [];

  // When modal opens, trigger generation and step through telemetry
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setProgress(20);
      setCompleted(false);
      return;
    }

    if (onTriggerGenerate) {
      onTriggerGenerate();
    }

    const timer1 = setTimeout(() => {
      setCurrentStep(2);
      setProgress(50);
    }, 600);

    const timer2 = setTimeout(() => {
      setCurrentStep(3);
      setProgress(80);
    }, 1300);

    const timer3 = setTimeout(() => {
      setCurrentStep(4);
      setProgress(100);
      setCompleted(true);
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  // If backend finishes before or after timer, ensure step 4 marks done
  useEffect(() => {
    if (isOpen && !isGenerating && currentStep >= 3) {
      setCurrentStep(4);
      setProgress(100);
      setCompleted(true);
    }
  }, [isOpen, isGenerating, currentStep]);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      id: 1,
      label: 'Analyzing Student Profile & Academic Baseline',
      detail: `${name} · Class 10 score: ${overallPct}% · Interests: ${interests.join(', ') || 'Exploring'}`,
      status: currentStep > 1 ? 'done' : currentStep === 1 ? 'running' : 'pending',
    },
    {
      id: 2,
      label: 'Groq AI Synthesizing Multi-Pathway Options (llama-3.1-8b)',
      detail: `Synthesizing tailored Degree, Diploma, and Vocational tracks for ${disciplineTitle}...`,
      status: currentStep > 2 ? 'done' : currentStep === 2 ? 'running' : 'pending',
    },
    {
      id: 3,
      label: 'Deterministic Feasibility & Staged Cash-Flow Engine',
      detail: 'Validating prerequisite cutoffs, fee schedules, and loan EMI thresholds...',
      status: currentStep > 3 ? 'done' : currentStep === 3 ? 'running' : 'pending',
    },
    {
      id: 4,
      label: 'Calibrating Fallback Routes & Personalized Trade-Offs',
      detail: 'Attaching official verification evidence & actionable safety pivots...',
      status: completed ? 'done' : currentStep === 4 ? 'running' : 'pending',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#DCEBEA] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden relative">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#278F89] via-[#367BA8] to-purple-600" />

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EAF4FF] to-purple-100 text-purple-600 flex items-center justify-center shadow-xs shrink-0">
            <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                Groq AI LPU Engine
              </span>
              <span className="text-[10px] font-semibold text-[#10B981] flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live Generation
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1E3A4C] mt-0.5">
              {completed ? 'Roadmap Synthesized Successfully!' : 'Generating Personalized Roadmap'}
            </h2>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[#5E8085]">
            <span>Synthesis Telemetry</span>
            <span className="text-purple-700 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#278F89] via-[#367BA8] to-purple-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Progress Checklist */}
        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                s.status === 'running'
                  ? 'bg-purple-50/60 border-purple-300 shadow-xs'
                  : s.status === 'done'
                  ? 'bg-white border-[#E2E8F0]'
                  : 'bg-[#F8FAFC] border-transparent opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {s.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : s.status === 'running' ? (
                    <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1E3A4C]">
                    {s.label}
                  </p>
                  <p className="text-[11px] text-[#5E8085] leading-snug mt-0.5 truncate">
                    {s.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {completed ? (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#278F89] via-[#367BA8] to-purple-600 hover:opacity-95 shadow-md cursor-pointer transition-all animate-in zoom-in-95 duration-150"
            >
              <span>Explore My Personalized Pathways</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-center py-2 text-xs font-semibold text-purple-700 flex items-center justify-center gap-2 bg-purple-50 rounded-xl p-3 border border-purple-200">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span>Groq LPU is synthesizing tailored options for {name}...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

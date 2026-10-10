import React, { useMemo, useState } from 'react';
import type { StudentProfileOut } from '../types/studentProfile';
import {
  Wallet, ChevronRight, ChevronDown, X, GraduationCap, Globe2, BriefcaseBusiness,
  Award, Landmark, GitBranch, CircleHelp, CheckCircle2, Sparkles, ArrowUpRight,
} from 'lucide-react';

type RoadmapStep = { id: string; title: string; subtitle: string; detail: string; tasks: string[] };

const STEPS: RoadmapStep[] = [
  {
    id: 'profile', title: 'Student profile & fit', subtitle: 'Academics · aptitude · interests',
    detail: 'Combine academic performance, self-reported strengths, interests, language, location preferences and career certainty. Missing marks stay unknown rather than being treated as zero.',
    tasks: ['Review subject marks and result status', 'Connect interests and strengths to possible study areas', 'Record assumptions and information still needed'],
  },
  {
    id: 'routes', title: 'Class 10 → further study', subtitle: 'Multiple routes, not one answer',
    detail: 'Compare plausible routes such as Science, Commerce, Humanities and vocational or diploma options, then map prerequisites and possible transitions into higher education.',
    tasks: ['Compare eligibility and subject prerequisites', 'Show alternative routes if a preferred option is unavailable', 'Keep more than one pathway open'],
  },
  {
    id: 'global', title: 'Institutions & countries', subtitle: 'Cost · duration · admission · location',
    detail: 'Build a comparison framework across India and other countries according to the chosen destination preference. Institution-specific fees, entry requirements and visa rules must be verified against current official sources before acting.',
    tasks: ['Compare tuition and expected living costs', 'Compare course duration and entry requirements', 'Account for location, language and travel preferences'],
  },
  {
    id: 'funding', title: 'Scholarships & funding', subtitle: 'Grants · savings · education loans',
    detail: 'Identify potentially relevant funding categories and compare borrowing transparently. A real comparison should disclose interest rate, fees, repayment start, tenure, co-borrower or collateral requirements, and total repayment.',
    tasks: ['Check merit- and need-based scholarship eligibility', 'Compare funding gaps after available grants', 'Compare loan APR, fees, EMI and total borrowing cost'],
  },
  {
    id: 'scenarios', title: 'What-if scenarios', subtitle: 'Plan for uncertainty',
    detail: 'Explore alternatives such as not securing a preferred course, a reduced budget, a changed country preference or different academic results. Scenario outputs are planning aids, not admission or scholarship guarantees.',
    tasks: ['If MBBS is not secured, compare related healthcare routes', 'If budget falls, compare lower-cost institutions and grants', 'Show how each changed assumption affects trade-offs'],
  },
  {
    id: 'decision', title: 'Decision matrix & next steps', subtitle: 'Explain trade-offs and confidence',
    detail: 'Compare options against the student’s priorities instead of forcing a single recommendation. Clearly separate verified facts, estimates, assumptions and unknowns.',
    tasks: ['Score affordability, interest fit, entry fit and opportunity', 'List pros, cons, risks and evidence for each option', 'Create a verification checklist before final decisions'],
  },
];

const labelDestination = (value: string) => ({ india: 'India', abroad: 'Abroad', both: 'India + abroad', undecided: 'Undecided' }[value] || value);
const money = (value: number | null | undefined, currency = 'INR') => {
  if (value == null) return 'Not set yet';
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value); }
  catch { return `${currency} ${value.toLocaleString()}`; }
};

export const BudgetRoadmap: React.FC<{ profile: StudentProfileOut }> = ({ profile }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(STEPS[0].id);
  const [scenario, setScenario] = useState<'baseline' | 'budget' | 'course'>('baseline');

  const selectedStep = useMemo(() => STEPS.find((step) => step.id === activeStep) || STEPS[0], [activeStep]);
  const budgetText = profile.annual_budget.budget_status === 'not_sure'
    ? 'Budget not set yet'
    : money(profile.annual_budget.amount, profile.annual_budget.currency || 'INR');
  const visibleSteps = expanded ? STEPS : [];

  const openRoadmap = () => {
    setSidebarOpen(true);
    setActiveStep(STEPS[0].id);
  };

  return (
    <section className="rounded-3xl border border-[#DCEBEA] bg-white p-5 sm:p-8 shadow-2xs print-clean">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#278F89]">Interactive roadmap</span>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#376E7D] mt-1">Your education journey</h2>
          <p className="text-sm text-[#5E8085] mt-2 max-w-2xl">Start with the budget and planning node. Click it to inspect the phase, then expand the roadmap only when you ask.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCEBEA] bg-[#F5FAF9] px-3 py-1.5 text-[11px] font-semibold text-[#5E8085]">
          <CircleHelp className="w-3.5 h-3.5" /> Planning framework
        </span>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="absolute left-1/2 top-8 bottom-8 hidden sm:block border-l-2 border-dashed border-[#A7D9E6]" />
        <button
          type="button"
          onClick={openRoadmap}
          aria-label="Open Budget and Pathway Planning details"
          className="relative z-10 w-full text-left rounded-2xl border-2 border-[#367BA8] bg-gradient-to-br from-[#EFF8FF] to-[#F0FBF8] p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-[#367BA8]/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#367BA8] text-white flex items-center justify-center shrink-0"><Wallet className="w-6 h-6" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#367BA8]">Phase 1 · Start here</span>
                <span className="rounded-full bg-white/80 border border-[#A7D9E6] px-2 py-0.5 text-[10px] font-bold text-[#278F89]">Budget-aware</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#234B56] mt-1">Budget & Pathway Planning</h3>
              <p className="text-sm text-[#5E8085] mt-1">Profile fit, study routes, global institutions, scholarships, loan costs and alternative scenarios.</p>
              <div className="mt-4 rounded-xl bg-white/90 border border-[#DCEBEA] px-3.5 py-3 flex flex-wrap items-center justify-between gap-2">
                <div><span className="block text-[10px] uppercase tracking-wider font-bold text-[#5E8085]">Your annual study budget</span><span className="block text-base font-extrabold text-[#234B56] mt-0.5">{budgetText}</span></div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#367BA8]">Click to view details <ArrowUpRight className="w-4 h-4" /></span>
              </div>
            </div>
          </div>
        </button>

        {expanded && (
          <div className="relative z-10 mt-4 space-y-3">
            {visibleSteps.map((step, index) => (
              <button key={step.id} type="button" onClick={() => { setActiveStep(step.id); setSidebarOpen(true); }}
                className="w-full text-left flex items-center gap-3 p-4 rounded-2xl border border-[#DCEBEA] bg-white hover:border-[#367BA8] hover:bg-[#F5FAF9] transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#CDEDE2] text-[#278F89] flex items-center justify-center font-extrabold text-sm shrink-0">{index + 1}</span>
                <span className="flex-1 min-w-0"><span className="block text-sm font-bold text-[#376E7D]">{step.title}</span><span className="block text-xs text-[#5E8085] mt-0.5">{step.subtitle}</span></span>
                <ChevronRight className="w-4 h-4 text-[#367BA8]" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2 no-print">
        {!expanded ? (
          <button type="button" onClick={openRoadmap} className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-[#367BA8] text-white text-sm font-bold hover:bg-[#2e688e]">
            View phase details <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={() => setExpanded(false)} className="inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCEBEA] text-[#376E7D] text-sm font-bold hover:bg-[#F5FAF9]">
            Collapse roadmap <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] no-print" role="dialog" aria-modal="true" aria-labelledby="roadmap-sidebar-title">
          <button type="button" aria-label="Close roadmap details" onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-slate-950/40 cursor-default" />
          <aside className="absolute right-0 top-0 h-full w-full sm:max-w-xl bg-white shadow-2xl border-l border-[#DCEBEA] flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-5 sm:p-7 border-b border-[#DCEBEA] bg-[#F5FAF9]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#278F89]">EduPath · Roadmap phase</span>
                  <h2 id="roadmap-sidebar-title" className="font-serif-heading text-2xl font-bold text-[#234B56] mt-1">{selectedStep.title}</h2>
                  <p className="text-xs text-[#5E8085] mt-1">{selectedStep.subtitle}</p>
                </div>
                <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="p-2 rounded-xl border border-[#DCEBEA] bg-white text-[#376E7D] hover:bg-[#C9E6F8]"><X className="w-5 h-5" /></button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#DCEBEA] px-3 py-1.5 text-[#376E7D]"><Wallet className="w-3.5 h-3.5" /> {budgetText}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#DCEBEA] px-3 py-1.5 text-[#376E7D]"><Globe2 className="w-3.5 h-3.5" /> {labelDestination(profile.preferred_destination)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              <div><h3 className="text-sm font-extrabold text-[#376E7D] mb-2">What happens in this phase</h3><p className="text-sm leading-6 text-[#5E8085]">{selectedStep.detail}</p></div>
              <div><h3 className="text-sm font-extrabold text-[#376E7D] mb-3">Activities</h3><ul className="space-y-3">{selectedStep.tasks.map((task) => <li key={task} className="flex items-start gap-2.5 text-sm text-[#376E7D]"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#278F89] shrink-0" /><span>{task}</span></li>)}</ul></div>

              <div className="rounded-2xl border border-[#DCEBEA] bg-[#F5FAF9] p-4">
                <h3 className="text-sm font-extrabold text-[#376E7D] flex items-center gap-2"><GitBranch className="w-4 h-4 text-[#278F89]" /> Scenario explorer</h3>
                <p className="text-xs text-[#5E8085] mt-1">Choose a planning assumption to review. These are qualitative prompts, not live admissions predictions.</p>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  <button type="button" onClick={() => setScenario('baseline')} className={`text-left p-3 rounded-xl border text-xs font-semibold ${scenario === 'baseline' ? 'border-[#367BA8] bg-white text-[#234B56]' : 'border-[#DCEBEA] bg-transparent text-[#5E8085]'}`}>Baseline: use current profile and budget</button>
                  <button type="button" onClick={() => setScenario('budget')} className={`text-left p-3 rounded-xl border text-xs font-semibold ${scenario === 'budget' ? 'border-[#367BA8] bg-white text-[#234B56]' : 'border-[#DCEBEA] bg-transparent text-[#5E8085]'}`}>What if my budget is reduced?</button>
                  <button type="button" onClick={() => setScenario('course')} className={`text-left p-3 rounded-xl border text-xs font-semibold ${scenario === 'course' ? 'border-[#367BA8] bg-white text-[#234B56]' : 'border-[#DCEBEA] bg-transparent text-[#5E8085]'}`}>What if I do not get my first-choice course?</button>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-white border border-[#DCEBEA] text-xs leading-5 text-[#5E8085]">
                  {scenario === 'baseline' && 'Baseline: compare routes using the saved academic, interest, location and budget inputs. Confirm current course and institution requirements before deciding.'}
                  {scenario === 'budget' && 'Reduced-budget scenario: prioritize lower total cost, public institutions where suitable, scholarship eligibility, local study options and a no-loan alternative. Recalculate living costs and funding gap with current figures.'}
                  {scenario === 'course' && 'Alternative-course scenario: preserve related interests and compare adjacent degrees, allied fields, diploma routes or a later re-application plan. For MBBS specifically, compare healthcare alternatives only if they fit the student’s interests and prerequisites.'}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2"><CircleHelp className="w-4 h-4" /> Assumptions & uncertainty</h3>
                <p className="text-xs leading-5 text-amber-900/80 mt-1">This roadmap is a planning framework built from your profile, not a live list of verified institutions, scholarships or loan offers. Fees, eligibility, admission cut-offs, exchange rates and loan terms change. Verify official sources; no outcome is guaranteed.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#DCEBEA]"><span className="block text-[#5E8085]">Study destination</span><strong className="block text-[#376E7D] mt-1">{labelDestination(profile.preferred_destination)}</strong></div>
                <div className="p-3 rounded-xl border border-[#DCEBEA]"><span className="block text-[#5E8085]">Scholarship interest</span><strong className="block text-[#376E7D] mt-1">{profile.funding_preferences.interested_in_scholarships ? 'Include funding search' : 'Optional funding search'}</strong></div>
                <div className="p-3 rounded-xl border border-[#DCEBEA]"><span className="block text-[#5E8085]">Education loans</span><strong className="block text-[#376E7D] mt-1">{profile.funding_preferences.willing_to_consider_loans ? 'Include loan comparisons' : 'Prefer no-loan options first'}</strong></div>
                <div className="p-3 rounded-xl border border-[#DCEBEA]"><span className="block text-[#5E8085]">Annual budget</span><strong className="block text-[#376E7D] mt-1">{budgetText}</strong></div>
              </div>
            </div>

            <div className="p-4 sm:px-7 border-t border-[#DCEBEA] bg-white flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={() => { setExpanded(true); setSidebarOpen(false); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#367BA8] text-white px-4 py-3 text-sm font-bold hover:bg-[#2e688e]">
                Expand node <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setSidebarOpen(false)} className="px-4 py-3 rounded-xl border border-[#DCEBEA] text-sm font-bold text-[#376E7D] hover:bg-[#F5FAF9]">Close</button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

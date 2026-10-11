import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wallet,
  Sparkles,
  AlertTriangle,
  Scale,
  ExternalLink,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface HeroPathwayPreviewProps {
  onExploreClick: () => void;
  onCompareClick: () => void;
}

interface PreviewPathway {
  id: string;
  name: string;
  shortTag: string;
  category: string;
  duration: string;
  annualFee: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  feasibilityBadge: string;
  steps: Array<{
    title: string;
    sub: string;
    tag: string;
  }>;
  highlight: string;
  fallbackSummary: string;
}

const PREVIEW_DATA: Record<string, PreviewPathway> = {
  path_a: {
    id: 'path_a',
    name: 'Path A: University Engineering Degree',
    shortTag: 'Path A',
    category: 'Higher Secondary + B.Tech',
    duration: '6–7 Years (11-12 + 4 Yrs)',
    annualFee: '₹80K – ₹1.2L / yr',
    accent: '#367BA8',
    badgeBg: 'bg-[#C9E6F8]',
    badgeText: 'text-[#367BA8]',
    feasibilityBadge: 'FEASIBLE · CUTOFF ≥ 60%',
    steps: [
      {
        title: 'Class 11–12 PCM',
        sub: 'Senior secondary science foundation with entrance prep',
        tag: 'Stage 1 · 2 Yrs',
      },
      {
        title: 'JEE / State CET Gateway',
        sub: 'National & state engineering admission counseling',
        tag: 'Stage 2 · Exam',
      },
      {
        title: '4-Year B.Tech Degree',
        sub: 'Software, Mechanical, or Computer Science specialization',
        tag: 'Stage 3 · Degree',
      },
    ],
    highlight: 'Maximum career ceiling and campus placement opportunities (₹6L–₹14L/yr starting packages).',
    fallbackSummary: 'If JEE cutoff missed: Instant credit transfer to Polytechnic Lateral Entry.',
  },
  path_b: {
    id: 'path_b',
    name: 'Path B: Polytechnic Diploma & Lateral Entry',
    shortTag: 'Path B',
    category: 'Applied Diploma + Direct Degree',
    duration: '6 Years (3 Yrs Dip + 3 Yrs B.Tech)',
    annualFee: '₹25K – ₹45K / yr',
    accent: '#278F89',
    badgeBg: 'bg-[#CDEDE2]',
    badgeText: 'text-[#278F89]',
    feasibilityBadge: '100% BUDGET FEASIBLE',
    steps: [
      {
        title: '3-Year Polytechnic Diploma',
        sub: 'Hands-on practical engineering workshops right after Class 10',
        tag: 'Stage 1 · 3 Yrs',
      },
      {
        title: 'Direct 2nd Year Lateral Entry',
        sub: 'Join university B.Tech in 3rd semester without JEE stress',
        tag: 'Stage 2 · Direct',
      },
      {
        title: 'Same B.Tech Degree',
        sub: 'Graduate with identical university degree plus 3 yrs workshop skill',
        tag: 'Stage 3 · Degree',
      },
    ],
    highlight: '50% lower tuition, zero competitive exam burnout, and identical degree outcomes.',
    fallbackSummary: 'Option to enter industry early as Junior Engineer (₹4.5L/yr) or continue degree.',
  },
  path_c: {
    id: 'path_c',
    name: 'Path C: Vocational & Industry Apprenticeship',
    shortTag: 'Path C',
    category: 'Applied Trades & Certifications',
    duration: '2–3 Years (Trade + Apprentice)',
    annualFee: '₹12K / yr (Stipend Paid)',
    accent: '#D97706',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#D97706]',
    feasibilityBadge: 'EARN WHILE LEARNING',
    steps: [
      {
        title: '2-Year ITI / Technical Trade',
        sub: 'Specialized industrial automation, electronics, or IT trade',
        tag: 'Stage 1 · 2 Yrs',
      },
      {
        title: 'Paid Industry Apprenticeship',
        sub: 'Govt NAPS stipend (₹8,000–₹12,000/month) with hands-on training',
        tag: 'Stage 2 · Stipend',
      },
      {
        title: 'Certified Industry Specialist',
        sub: 'Full-time technical supervisor or precision technician roles',
        tag: 'Stage 3 · Career',
      },
    ],
    highlight: 'Fastest route to financial independence with zero debt and paid apprenticeship training.',
    fallbackSummary: 'Clear bridge into evening polytechnic diploma for upward promotions.',
  },
};

export const HeroPathwayPreview: React.FC<HeroPathwayPreviewProps> = ({
  onExploreClick,
  onCompareClick,
}) => {
  const [activeTab, setActiveTab] = useState<'path_b' | 'path_a' | 'path_c'>('path_b');
  const pathway = PREVIEW_DATA[activeTab];

  return (
    <div className="w-full rounded-3xl bg-white border border-[#EAE5E0] shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Top Banner / Tab Bar */}
      <div className="bg-[#FAF8F5] border-b border-[#EAE5E0] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#FF671B] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413]">
              3 Pathways Beyond Class 10
            </span>
          </div>

          <button
            type="button"
            onClick={onCompareClick}
            className="text-[11px] font-bold text-[#FF671B] hover:text-[#e5560f] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Matrix</span>
          </button>
        </div>

        {/* Pathway Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('path_b')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              activeTab === 'path_b'
                ? 'bg-white text-[#141413] border-[#FF671B] shadow-xs'
                : 'bg-white/60 text-[#6E6762] border-transparent hover:bg-white'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold text-[#0D9488]">Route B</span>
            <span className="truncate block font-bold text-xs text-[#141413]">Polytechnic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('path_a')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              activeTab === 'path_a'
                ? 'bg-white text-[#141413] border-[#FF671B] shadow-xs'
                : 'bg-white/60 text-[#6E6762] border-transparent hover:bg-white'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold text-[#2563EB]">Route A</span>
            <span className="truncate block font-bold text-xs text-[#141413]">Degree (JEE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('path_c')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
              activeTab === 'path_c'
                ? 'bg-white text-[#141413] border-[#FF671B] shadow-xs'
                : 'bg-white/60 text-[#6E6762] border-transparent hover:bg-white'
            }`}
          >
            <span className="block text-[10px] uppercase font-semibold text-[#D97706]">Route C</span>
            <span className="truncate block font-bold text-xs text-[#141413]">Vocational</span>
          </button>
        </div>
      </div>

      {/* Main Pathway Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Pathway Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#141413]">
              {pathway.name}
            </h3>
            <p className="text-xs text-[#6E6762]">
              {pathway.category}
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${pathway.badgeBg} ${pathway.badgeText} shrink-0`}>
            {pathway.feasibilityBadge}
          </span>
        </div>

        {/* 3-Step Interactive Milestone Progression */}
        <div className="space-y-2.5">
          {pathway.steps.map((step, idx) => (
            <div
              key={step.title}
              className="relative flex items-start gap-3 p-3 rounded-2xl bg-[#F9F7F5] border border-[#EAE5E0] hover:border-[#D5CFC9] transition-colors"
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs mt-0.5"
                style={{ backgroundColor: pathway.accent }}
              >
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#141413] truncate">
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-semibold text-[#6E6762] bg-white px-2 py-0.5 rounded-md border border-[#EAE5E0] shrink-0">
                    {step.tag}
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6762] leading-relaxed mt-0.5">
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Comparative Metrics Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5E0]">
            <span className="text-[10px] font-medium text-[#8C827A] block">Estimated Cost:</span>
            <span className="font-bold text-[#141413] text-xs sm:text-sm">{pathway.annualFee}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5E0]">
            <span className="text-[10px] font-medium text-[#8C827A] block">Total Duration:</span>
            <span className="font-bold text-[#141413] text-xs sm:text-sm">{pathway.duration}</span>
          </div>
        </div>

        {/* Verified Advantage & Fallback Note */}
        <div className="text-[11px] space-y-1.5 p-3 rounded-xl bg-[#FFF9F5] border border-[#FFECD9] text-[#9A3412]">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF671B] shrink-0 mt-0.5" />
            <span className="leading-snug">{pathway.highlight}</span>
          </div>
          <div className="flex items-start gap-1.5 text-[#7C2D12]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF671B] shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{pathway.fallbackSummary}</span>
          </div>
        </div>

        {/* Action Button: Opens the Full Decision Engine */}
        <div className="pt-1">
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] active:scale-98 shadow-sm transition-all cursor-pointer group"
          >
            <Layers className="w-4 h-4" />
            <span>Open Decision Engine &amp; Simulator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};


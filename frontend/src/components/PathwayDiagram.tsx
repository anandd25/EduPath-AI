import React from 'react';
import { FlaskConical, BarChart3, BookOpen, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';

interface BranchPathway {
  id: string;
  title: string;
  tagline: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
}

const PATHWAYS: BranchPathway[] = [
  {
    id: 'science',
    title: 'Science',
    tagline: 'Discover · Innovate · Create',
    subtext: 'Physics, Chemistry, Math & Biology',
    icon: FlaskConical,
    accentColor: '#398FC4',
    cardBg: 'bg-white hover:bg-[#F4FAFF]',
    cardBorder: 'border-[#DCEAF2] hover:border-[#398FC4]',
    badgeBg: 'bg-[#E7F4FC] text-[#398FC4]',
  },
  {
    id: 'commerce',
    title: 'Commerce',
    tagline: 'Build · Manage · Lead',
    subtext: 'Finance, Accountancy, Economics & Business',
    icon: BarChart3,
    accentColor: '#398FC4',
    cardBg: 'bg-white hover:bg-[#F4FAFF]',
    cardBorder: 'border-[#DCEAF2] hover:border-[#398FC4]',
    badgeBg: 'bg-[#C9E2F0] text-[#174F6B]',
  },
  {
    id: 'humanities',
    title: 'Humanities',
    tagline: 'Express · Understand · Create Change',
    subtext: 'Social Sciences, Literature, Psychology & Law',
    icon: BookOpen,
    accentColor: '#438F85',
    cardBg: 'bg-white hover:bg-[#F4FAFF]',
    cardBorder: 'border-[#DCEAF2] hover:border-[#438F85]',
    badgeBg: 'bg-[#DDF2EF] text-[#438F85]',
  },
  {
    id: 'diploma',
    title: 'Diploma & Vocational',
    tagline: 'Learn Skills · Build Careers · Make an Impact',
    subtext: 'Polytechnic Engineering & Industry Trades',
    icon: Wrench,
    accentColor: '#438F85',
    cardBg: 'bg-white hover:bg-[#F4FAFF]',
    cardBorder: 'border-[#DCEAF2] hover:border-[#438F85]',
    badgeBg: 'bg-[#DDF2EF] text-[#438F85]',
  },
];

export const PathwayDiagram: React.FC = () => {
  return (
    <div className="relative w-full rounded-3xl bg-white border border-[#DCEAF2] p-5 sm:p-7 shadow-xs">
      {/* Top Diagram Label */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCEAF2] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#398FC4]" />
          <span className="font-bold text-[#174F6B] tracking-wide uppercase text-[11px]">
            Post-Class 10 Possibility Map
          </span>
        </div>
        <span className="text-[#587482] text-[11px]">
          Illustrative Pathway Framework
        </span>
      </div>

      <div className="mb-5 overflow-hidden rounded-2xl border border-[#DCEAF2] bg-[#EAF5FC]">
        <img src="/edupath-learning.svg" alt="Students exploring educational possibilities together" className="block h-auto w-full object-cover" loading="eager" />
      </div>

      {/* Main Diagram Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Central Foundation Node: Class 10 */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-[#E7F4FC]/60 border border-[#C9E2F0]/60">
          <div className="w-12 h-12 rounded-2xl bg-[#398FC4] text-white flex items-center justify-center font-bold text-lg shadow-2xs mb-2">
            10
          </div>
          <div className="text-[11px] font-bold text-[#398FC4] uppercase tracking-wider">
            Starting Milestone
          </div>
          <h3 className="font-serif-heading text-lg font-bold text-[#174F6B] mt-0.5">
            Class 10
          </h3>
          <p className="text-[11px] text-[#587482] mt-1 leading-snug">
            All educational routes branch outward from your current foundation.
          </p>
        </div>

        {/* 4 Pastel Pathway Cards */}
        <div className="md:col-span-8 space-y-2.5">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl border ${p.cardBorder} ${p.cardBg} transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.badgeBg}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#174F6B] truncate">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-[#587482] hidden sm:inline">
                        — {p.tagline}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#587482] truncate">
                      {p.subtext}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-[#DCEAF2]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9E2F0]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Footer note */}
      <div className="mt-4 pt-3 border-t border-[#DCEAF2] flex items-center justify-between text-[11px] text-[#587482]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#438F85]" />
          <span>Illustrative options to explore — not personalized recommendations.</span>
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-[#587482]">
          EduPath Discovery
        </span>
      </div>
    </div>
  );
};

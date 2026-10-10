import React from 'react';
import { FlaskConical, BarChart3, BookOpen, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';

interface BranchPathway {
  id: string;
  title: string;
  tagline: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

const PATHWAYS: BranchPathway[] = [
  {
    id: 'science',
    title: 'Science',
    tagline: 'Discover · Innovate · Create',
    subtext: 'Physics, Chemistry, Math & Life Sciences',
    icon: FlaskConical,
    accentColor: '#145DA0',
    bgColor: 'bg-white',
    borderColor: 'border-[#DFE8F2] hover:border-[#145DA0]',
    iconColor: 'text-[#145DA0] bg-[#EAF4FF]',
  },
  {
    id: 'commerce',
    title: 'Commerce',
    tagline: 'Build · Manage · Lead',
    subtext: 'Finance, Accountancy, Economics & Business',
    icon: BarChart3,
    accentColor: '#145DA0',
    bgColor: 'bg-white',
    borderColor: 'border-[#DFE8F2] hover:border-[#145DA0]',
    iconColor: 'text-[#145DA0] bg-[#EAF4FF]',
  },
  {
    id: 'humanities',
    title: 'Humanities',
    tagline: 'Express · Understand · Create Change',
    subtext: 'Social Sciences, Literature, Psychology & Law',
    icon: BookOpen,
    accentColor: '#159A91',
    bgColor: 'bg-white',
    borderColor: 'border-[#DFE8F2] hover:border-[#159A91]',
    iconColor: 'text-[#159A91] bg-[#DDF5EE]',
  },
  {
    id: 'diploma',
    title: 'Diploma & Vocational',
    tagline: 'Learn Skills · Build Careers · Make an Impact',
    subtext: 'Polytechnic Engineering & Applied Industry Skills',
    icon: Wrench,
    accentColor: '#159A91',
    bgColor: 'bg-white',
    borderColor: 'border-[#DFE8F2] hover:border-[#159A91]',
    iconColor: 'text-[#159A91] bg-[#DDF5EE]',
  },
];

export const PathwayDiagram: React.FC = () => {
  return (
    <div className="relative w-full rounded-2xl bg-white border border-[#DFE8F2] p-5 sm:p-7 shadow-xs">
      {/* Top Diagram Label */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DFE8F2] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#145DA0]" />
          <span className="font-semibold text-[#102A43] tracking-wide uppercase text-[11px]">
            Post-Class 10 Educational Pathways
          </span>
        </div>
        <span className="text-[#526477] text-[11px]">
          Conceptual Map
        </span>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Central Foundation Node: Class 10 */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#EAF4FF] border border-[#D8EAFE]">
          <div className="w-12 h-12 rounded-xl bg-[#145DA0] text-white flex items-center justify-center font-bold text-lg shadow-xs mb-2">
            10
          </div>
          <div className="text-xs font-bold text-[#145DA0] uppercase tracking-wider">
            Starting Milestone
          </div>
          <h3 className="text-base font-bold text-[#102A43] mt-0.5">
            Class 10
          </h3>
          <p className="text-[11px] text-[#526477] mt-1 leading-snug">
            All avenues branch outward from your current foundation.
          </p>
        </div>

        {/* Pathway Branches */}
        <div className="md:col-span-8 space-y-2.5">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border ${p.borderColor} ${p.bgColor} transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${p.iconColor}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#102A43] truncate">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-[#526477] hidden sm:inline">
                        — {p.tagline}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#526477] truncate">
                      {p.subtext}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#DFE8F2]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Footer note */}
      <div className="mt-4 pt-3 border-t border-[#DFE8F2] flex items-center justify-between text-[11px] text-[#526477]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#159A91]" />
          <span>General directions for exploration — not automated student recommendations.</span>
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
          EduPath Foundation
        </span>
      </div>
    </div>
  );
};

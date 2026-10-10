import React from 'react';
import { StudentProfileOut } from '../types/studentProfile';
import { 
  INTEREST_OPTIONS, 
  STRENGTH_OPTIONS, 
  PRIORITY_OPTIONS,
  DESTINATION_OPTIONS,
  CERTAINTY_OPTIONS,
  ACADEMIC_STATUS_LABELS,
  RESULT_STATUS_LABELS,
  BUDGET_STATUS_LABELS 
} from '../data/wizardOptions';
import { InterestIcon } from '../components/wizard/InterestIcon';
import { 
  BookOpen, 
  Sparkles, 
  Quote, 
  Printer, 
  Edit3, 
  ArrowLeft, 
  Heart,
  AlertCircle,
  Database,
  CheckCircle2
} from 'lucide-react';

interface FutureProfileProps {
  profile: StudentProfileOut;
  onEdit: () => void;
  onBackToHome: () => void;
}

export const FutureProfilePage: React.FC<FutureProfileProps> = ({
  profile,
  onEdit,
  onBackToHome,
}) => {
  const selectedInterestItems = INTEREST_OPTIONS.filter((i) =>
    profile.interests.includes(i.id)
  );

  const selectedPriorityItems = PRIORITY_OPTIONS.filter((p) =>
    profile.priorities.includes(p.id)
  );

  const destinationLabel = DESTINATION_OPTIONS.find((d) => d.id === profile.preferred_destination)?.label || profile.preferred_destination;
  const certaintyLabel = CERTAINTY_OPTIONS.find((c) => c.id === profile.career_certainty)?.label || profile.career_certainty;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F4FAFF] text-[#174F6B] pb-24 bg-edupath-pattern">
      {/* Top Action Bar (hidden in print) */}
      <div className="bg-white border-b border-[#DCEAF2] py-3.5 sticky top-0 z-30 shadow-2xs no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#587482] hover:text-[#174F6B] px-3 py-1.5 rounded-lg hover:bg-[#F4FAFF] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#398FC4] bg-[#E7F4FC]/60 hover:bg-[#E7F4FC] border border-[#C9E2F0] rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit My Profile</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#398FC4] hover:bg-[#174F6B] rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Profile Document */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-7">
        {/* Document Header */}
        <div className="bg-white rounded-3xl border border-[#DCEAF2] p-6 sm:p-10 shadow-2xs space-y-5 print-clean">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCEAF2]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#398FC4] uppercase tracking-wider block">
                EduPath · Future Profile Summary
              </span>
              <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#174F6B] tracking-tight">
                A First Look at Your Future Profile
              </h1>
              <p className="text-sm text-[#587482] leading-relaxed max-w-2xl">
                This is your starting point for understanding yourself and exploring what comes next.
              </p>
            </div>

            {/* Persistence & ID Status */}
            <div className="shrink-0 text-left sm:text-right bg-[#E7F4FC]/40 p-3 rounded-2xl border border-[#C9E2F0]/60">
              <div className="flex items-center sm:justify-end gap-1.5 text-[11px] font-bold text-[#398FC4]">
                <Database className="w-3.5 h-3.5" />
                <span>Profile #{profile.id}</span>
              </div>
              <span className="text-[10px] text-[#587482] block mt-0.5 font-mono">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Saved'}
              </span>
              <span className="text-[10px] text-[#438F85] font-semibold block mt-0.5 flex items-center sm:justify-end gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Class 10 Stage</span>
              </span>
            </div>
          </div>

          {/* 1. Student Overview */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#587482] mb-3">
              Student Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <div>
                <span className="text-[11px] text-[#587482] block">Preferred Name</span>
                <span className="text-base font-bold text-[#174F6B]">
                  {profile.preferred_name || 'Class 10 Student'}
                </span>
                <span className="text-[10px] text-[#587482] block mt-0.5">
                  {profile.preferred_language ? `Language: ${profile.preferred_language}` : 'General profile'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#587482] block">Class 10 Status</span>
                <span className="text-sm font-semibold text-[#174F6B]">
                  {ACADEMIC_STATUS_LABELS[profile.academic_status]?.label || profile.academic_status}
                </span>
                <span className="text-[10px] text-[#587482] block mt-0.5">
                  Education Stage: Class 10
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#587482] block">Country & Region</span>
                <span className="text-sm font-semibold text-[#174F6B]">
                  {profile.region ? `${profile.region}, ` : ''}{profile.country}
                </span>
                <span className="text-[10px] text-[#587482] block mt-0.5">
                  Geographic context
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#587482] block">Curriculum / Board</span>
                <span className="text-sm font-semibold text-[#174F6B]">
                  {profile.curriculum}
                </span>
                {profile.overall_percentage !== null ? (
                  <span className="text-[11px] font-mono font-bold text-[#398FC4] block mt-0.5">
                    Overall: {profile.overall_percentage}%
                  </span>
                ) : (
                  <span className="text-[10px] text-[#587482] block mt-0.5">
                    Status: {RESULT_STATUS_LABELS[profile.overall_result_status]}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Academic Snapshot */}
        <section className="bg-white rounded-3xl border border-[#DCEAF2] p-6 sm:p-8 shadow-2xs space-y-4 print-clean">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCEAF2]">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#587482]">
                Academic Snapshot
              </h2>
              <h3 className="font-serif-heading text-lg font-bold text-[#174F6B] tracking-tight mt-0.5">
                School Subjects & Performance Context
              </h3>
            </div>
            <span className="text-xs text-[#587482]">
              No rankings or predicted percentiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {profile.subjects.map((sub, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2] space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-[#174F6B]">
                    {sub.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {sub.favourite && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md">
                        <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                        <span>Favourite</span>
                      </span>
                    )}
                    {sub.challenging && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span>Challenging</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DCEAF2] flex items-baseline justify-between text-xs">
                  <span className="text-[#587482]">
                    {RESULT_STATUS_LABELS[sub.result_status]}
                  </span>
                  <span className="font-mono font-bold text-[#174F6B]">
                    {sub.result_status === 'completed' && sub.marks !== null
                      ? `${sub.marks} / ${sub.maximum_marks || 100}`
                      : sub.result_status === 'predicted' && sub.marks !== null
                      ? `~${sub.marks} / ${sub.maximum_marks || 100}`
                      : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#587482] pt-1">
            EduPath shows only entered marks and grades. Clearly distinguishes unavailable marks without assuming zero.
          </p>
        </section>

        {/* 3. Interests & Strengths */}
        <section className="bg-white rounded-3xl border border-[#DCEAF2] p-6 sm:p-8 shadow-2xs space-y-6 print-clean">
          <div className="pb-3 border-b border-[#DCEAF2]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#587482]">
              Interests & Strengths
            </h2>
            <h3 className="font-serif-heading text-lg font-bold text-[#174F6B] tracking-tight mt-0.5">
              Curiosities & Self-Reported Ratings
            </h3>
          </div>

          {/* Interests Tags */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#174F6B] uppercase tracking-wider block">
              Areas of Genuine Interest:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedInterestItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#E7F4FC]/40 border border-[#C9E2F0]/60 flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-[#398FC4] text-white shrink-0">
                    <InterestIcon name={item.iconName} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#174F6B] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#587482] mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths Reflection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-[#174F6B] uppercase tracking-wider block">
                Self-Reported Strength Reflections:
              </span>
              <span className="text-[11px] text-[#587482]">
                Rated 1 to 5 (or Not Sure)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {STRENGTH_OPTIONS.map((item) => {
                const entry = profile.strengths.find((s) => s.name === item.key);
                const isNotSure = entry ? entry.rating_status === 'not_sure' : true;
                const rating = entry?.rating ?? null;

                return (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2] flex items-center justify-between"
                  >
                    <div className="pr-2">
                      <div className="font-semibold text-[#174F6B]">{item.label}</div>
                      <div className="text-[10px] text-[#587482]">{item.description}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDF2EF] text-[#438F85] shrink-0">
                      {isNotSure ? 'Not sure' : `Level ${rating}/5`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. In Your Own Words */}
        <section className="bg-[#E7F4FC]/40 border border-[#C9E2F0]/60 rounded-3xl p-6 sm:p-10 shadow-2xs space-y-4 print-clean">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#398FC4] text-xs font-bold uppercase tracking-wider">
              <Quote className="w-4 h-4" />
              <span>In Your Own Words</span>
            </div>

            <h3 className="font-serif-heading text-2xl font-bold tracking-tight text-[#174F6B]">
              Your Voice, Preserved
            </h3>

            {profile.interest_description && profile.interest_description.trim() ? (
              <div className="p-6 rounded-2xl bg-white border border-[#DCEAF2] text-[#174F6B] text-sm leading-relaxed italic whitespace-pre-wrap font-sans shadow-2xs">
                &ldquo;{profile.interest_description}&rdquo;
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-[#DCEAF2] text-[#587482] text-sm leading-relaxed shadow-2xs">
                <p className="font-semibold text-[#174F6B] mb-1">
                  Your story is still taking shape.
                </p>
                <p>
                  You can add your thoughts whenever you&apos;re ready by clicking &ldquo;Edit My Profile&rdquo;.
                </p>
              </div>
            )}

            <div className="pt-1 text-[11px] text-[#587482] flex items-center justify-between">
              <span>Saved verbatim without automated algorithmic alterations.</span>
              <span className="font-mono text-[#398FC4]">Class 10 Self-Reflection</span>
            </div>
          </div>
        </section>

        {/* 5. Preferences & Constraints */}
        <section className="bg-white rounded-3xl border border-[#DCEAF2] p-6 sm:p-8 shadow-2xs space-y-4 print-clean">
          <div className="pb-3 border-b border-[#DCEAF2]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#587482]">
              Preferences & Constraints
            </h2>
            <h3 className="font-serif-heading text-lg font-bold text-[#174F6B] tracking-tight mt-0.5">
              Practical Constraints & Decision Drivers
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Annual Budget</span>
              <span className="text-sm font-bold text-[#174F6B]">
                {profile.annual_budget.budget_status === 'not_sure'
                  ? 'Not sure yet'
                  : profile.annual_budget.amount !== null
                  ? `₹${profile.annual_budget.amount.toLocaleString('en-IN')}`
                  : 'Flexible'}
              </span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Status: {BUDGET_STATUS_LABELS[profile.annual_budget.budget_status]}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Scholarship Focus</span>
              <span className="text-sm font-bold text-[#174F6B]">
                {profile.funding_preferences.interested_in_scholarships ? 'Interested in assistance' : 'Not needed'}
              </span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Merit & need-based programs
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Preferred Destination</span>
              <span className="text-sm font-bold text-[#174F6B]">{destinationLabel}</span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Geographic scope
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Loan Consideration</span>
              <span className="text-sm font-bold text-[#174F6B]">
                {profile.funding_preferences.willing_to_consider_loans ? 'Open to considering' : 'Prefer not to'}
              </span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Educational financing
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Career Direction Certainty</span>
              <span className="text-sm font-bold text-[#174F6B]">{certaintyLabel}</span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Current clarity level
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEAF2]">
              <span className="text-[#587482] block mb-1">Key Guiding Priorities</span>
              <span className="text-sm font-bold text-[#174F6B]">
                {selectedPriorityItems.map((p) => p.label).join(', ') || 'Exploratory'}
              </span>
              <span className="text-[10px] text-[#587482] block mt-1">
                Guiding factors
              </span>
            </div>
          </div>
        </section>

        {/* 6. Next Step */}
        <section className="bg-white border border-[#DCEAF2] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4 print-clean">
          <div className="flex items-center gap-2 text-[#398FC4] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#438F85]" />
            <span>Next Step</span>
          </div>

          <h3 className="font-serif-heading text-xl font-bold text-[#174F6B] tracking-tight">
            Your Future Profile is ready.
          </h3>

          <p className="text-sm text-[#587482] leading-relaxed max-w-3xl">
            The next stage of EduPath will use these details to help you explore possible educational directions after Class 10.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DCEAF2]">
            <span className="text-xs text-[#587482]">
              No automated career recommendations have been forced upon your choices.
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={onEdit}
                className="px-4 py-2 text-xs font-semibold text-[#398FC4] bg-[#E7F4FC]/60 hover:bg-[#E7F4FC] border border-[#C9E2F0] rounded-xl transition-colors cursor-pointer"
              >
                Edit My Profile
              </button>
              <button
                onClick={onBackToHome}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#398FC4] hover:bg-[#174F6B] rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

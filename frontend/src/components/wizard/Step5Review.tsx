import React from 'react';
import { StudentProfileCreate } from '../../types/studentProfile';
import { 
  INTEREST_OPTIONS, 
  STRENGTH_OPTIONS, 
  PRIORITY_OPTIONS, 
  DESTINATION_OPTIONS, 
  CERTAINTY_OPTIONS,
  ACADEMIC_STATUS_LABELS,
  RESULT_STATUS_LABELS,
  BUDGET_STATUS_LABELS
} from '../../data/wizardOptions';
import { InterestIcon } from './InterestIcon';
import { 
  User, 
  BookOpen, 
  Sparkles, 
  PenTool, 
  SlidersHorizontal, 
  Edit3, 
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Step5Props {
  profile: StudentProfileCreate;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const Step5Review: React.FC<Step5Props> = ({ 
  profile, 
  onEditStep, 
  onSubmit, 
  isSubmitting, 
  submitError 
}) => {
  const selectedInterestItems = INTEREST_OPTIONS.filter((i) =>
    profile.interests.includes(i.id)
  );

  const selectedPriorityItems = PRIORITY_OPTIONS.filter((p) =>
    profile.priorities.includes(p.id)
  );

  const destinationLabel = DESTINATION_OPTIONS.find((d) => d.id === profile.preferred_destination)?.label || profile.preferred_destination;
  const certaintyLabel = CERTAINTY_OPTIONS.find((c) => c.id === profile.career_certainty)?.label || profile.career_certainty;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#DFE8F2] pb-5">
        <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#102A43] tracking-tight">
          Step 5: Review Answers
        </h2>
        <p className="text-sm text-[#526477] mt-1">
          Review your self-reflection details below before generating your official Future Profile snapshot. You can tap &ldquo;Edit&rdquo; on any section to adjust your responses without losing any data.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Unable to save profile to server</div>
            <div>{submitError}</div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Card 1: About You */}
        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F2]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#145DA0]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">
                1. About You
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#145DA0] hover:text-[#102A43] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#526477] block text-[11px]">Preferred Name</span>
              <span className="font-semibold text-[#102A43]">
                {profile.preferred_name || 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Academic Status</span>
              <span className="font-semibold text-[#102A43]">
                {ACADEMIC_STATUS_LABELS[profile.academic_status]?.label || profile.academic_status}
              </span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Country & Region</span>
              <span className="font-semibold text-[#102A43]">
                {profile.region ? `${profile.region}, ` : ''}{profile.country}
              </span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Curriculum</span>
              <span className="font-semibold text-[#102A43]">
                {profile.curriculum}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Academic Background */}
        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F2]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#145DA0]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">
                2. Academic Background
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#145DA0] hover:text-[#102A43] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[#526477] flex items-center justify-between">
              <span>{profile.subjects.length} Subjects Registered</span>
              <span className="font-medium text-[#102A43]">
                Overall Status: {RESULT_STATUS_LABELS[profile.overall_result_status]}
                {profile.overall_percentage !== null ? ` (${profile.overall_percentage}%)` : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {profile.subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#F7FAFE] border border-[#DFE8F2]"
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="font-medium text-[#102A43] truncate">{sub.name}</span>
                    {sub.favourite && (
                      <span className="text-[10px] text-rose-600 font-semibold">(Fav)</span>
                    )}
                    {sub.challenging && (
                      <span className="text-[10px] text-amber-700 font-semibold">(Hard)</span>
                    )}
                  </div>
                  <span className="font-mono text-[#526477] shrink-0">
                    {sub.result_status === 'completed' && sub.marks !== null
                      ? `${sub.marks}/${sub.maximum_marks || 100}`
                      : sub.result_status === 'predicted' && sub.marks !== null
                      ? `~${sub.marks}/${sub.maximum_marks || 100}`
                      : RESULT_STATUS_LABELS[sub.result_status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Interests & Strengths */}
        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F2]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#DDF5EE] text-[#159A91]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">
                3. Interests & Strengths
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#145DA0] hover:text-[#102A43] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#102A43] block mb-2">
              Selected Interests:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedInterestItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAF4FF] text-[#145DA0] rounded-lg text-xs font-medium border border-[#D8EAFE]"
                >
                  <InterestIcon name={item.iconName} className="w-3.5 h-3.5 text-[#145DA0]" />
                  <span>{item.title}</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#102A43] block mb-2">
              Strength Reflections:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {STRENGTH_OPTIONS.map((item) => {
                const entry = profile.strengths.find((s) => s.name === item.key);
                const isNotSure = entry ? entry.rating_status === 'not_sure' : true;
                const rating = entry?.rating ?? null;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F7FAFE] border border-[#DFE8F2]"
                  >
                    <span className="text-[#526477] truncate pr-2">{item.label}</span>
                    <span className="text-[11px] font-semibold text-[#102A43] shrink-0">
                      {isNotSure ? 'Not sure' : `${rating} / 5`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Written Description */}
        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F2]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EAF4FF] text-[#145DA0]">
                <PenTool className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">
                4. Written Interest Description
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#145DA0] hover:text-[#102A43] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {profile.interest_description && profile.interest_description.trim() ? (
            <div className="p-3.5 rounded-xl bg-[#F7FAFE] border border-[#DFE8F2] text-xs text-[#102A43] leading-relaxed italic whitespace-pre-wrap">
              &ldquo;{profile.interest_description}&rdquo;
            </div>
          ) : (
            <p className="text-xs text-[#526477] italic">
              No written note provided yet. (Optional)
            </p>
          )}
        </div>

        {/* Card 5: Preferences and Budget */}
        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE8F2]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#DDF5EE] text-[#159A91]">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#102A43]">
                5. Preferences & Budget
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#145DA0] hover:text-[#102A43] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#526477] block text-[11px]">Annual Budget</span>
              <span className="font-semibold text-[#102A43]">
                {profile.annual_budget.budget_status === 'not_sure'
                  ? 'Not sure yet'
                  : profile.annual_budget.amount !== null
                  ? `₹${profile.annual_budget.amount.toLocaleString('en-IN')}`
                  : 'Flexible'}
              </span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Scholarships</span>
              <span className="font-semibold text-[#102A43]">
                {profile.funding_preferences.interested_in_scholarships ? 'Interested' : 'Not needed'}
              </span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Study Destination</span>
              <span className="font-semibold text-[#102A43]">{destinationLabel}</span>
            </div>
            <div>
              <span className="text-[#526477] block text-[11px]">Loan Openness</span>
              <span className="font-semibold text-[#102A43]">
                {profile.funding_preferences.willing_to_consider_loans ? 'Open to considering' : 'Prefer not to'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[#526477] block text-[11px]">Career Direction</span>
              <span className="font-semibold text-[#102A43]">{certaintyLabel}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[#526477] block text-[11px]">Key Priorities</span>
              <span className="font-semibold text-[#102A43]">
                {selectedPriorityItems.map((p) => p.label).join(' · ') || 'None selected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="pt-6 border-t border-[#DFE8F2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#526477]">
          Ready to save your details and review your personal Future Profile summary.
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-sm font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] active:scale-98 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <span>Confirm My Profile</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

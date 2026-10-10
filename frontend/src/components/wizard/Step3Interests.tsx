import React from 'react';
import { 
  StudentProfileCreate, 
  InterestType, 
  StrengthName, 
  StrengthIn 
} from '../../types/studentProfile';
import { 
  INTEREST_OPTIONS, 
  STRENGTH_OPTIONS, 
  WRITING_PROMPTS 
} from '../../data/wizardOptions';
import { InterestIcon } from './InterestIcon';
import { Check, PenTool, ShieldCheck, Info } from 'lucide-react';

interface Step3Props {
  profile: StudentProfileCreate;
  onChange: (updates: Partial<StudentProfileCreate>) => void;
  errors?: Record<string, string>;
}

export const Step3Interests: React.FC<Step3Props> = ({ profile, onChange, errors }) => {
  const toggleInterest = (id: InterestType) => {
    let updated: InterestType[];
    if (profile.interests.includes(id)) {
      updated = profile.interests.filter((i) => i !== id);
    } else {
      // Prevent duplicates
      updated = Array.from(new Set([...profile.interests, id]));
    }
    onChange({ interests: updated });
  };

  const handleSetStrength = (name: StrengthName, rating: number | null, isNotSure: boolean) => {
    const updatedStrengths: StrengthIn[] = STRENGTH_OPTIONS.map((opt) => {
      const existing = profile.strengths.find((s) => s.name === opt.key);
      if (opt.key === name) {
        return {
          name: opt.key,
          rating: isNotSure ? null : rating,
          rating_status: isNotSure ? 'not_sure' : 'rated',
        };
      }
      return existing || { name: opt.key, rating: null, rating_status: 'not_sure' };
    });

    onChange({ strengths: updatedStrengths });
  };

  const handleInsertPrompt = (promptText: string) => {
    const current = profile.interest_description;
    const addition = current ? `\n\n${promptText} ` : `${promptText} `;
    if (addition.length + current.length <= 1000) {
      onChange({ interest_description: current + addition });
    }
  };

  const maxChars = 1000;
  const currentChars = profile.interest_description.length;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#DFE8F2] pb-5">
        <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#102A43] tracking-tight">
          Step 3: Interests & Strengths
        </h2>
        <p className="text-sm text-[#526477] mt-1 leading-relaxed">
          Your interests and personal reflections help uncover what subjects and activities energize you.
        </p>
      </div>

      {/* Part A: Interests Multi-select */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102A43]">
              A. Explore Your Interests
            </h3>
            <span className="text-xs text-[#145DA0] font-semibold">
              · Select all that apply
            </span>
          </div>
          <p className="text-xs text-[#526477] mt-0.5">
            Choose what you enjoy learning, creating, or doing. Multiple selections are encouraged.
          </p>
        </div>

        {errors?.interests && (
          <p className="text-xs text-rose-600 font-medium">{errors.interests}</p>
        )}

        {/* 13 Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTEREST_OPTIONS.map((item) => {
            const isSelected = profile.interests.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-3 shadow-2xs ${
                  isSelected
                    ? 'bg-[#EAF4FF] border-[#145DA0] ring-1 ring-[#145DA0]'
                    : 'bg-white border-[#DFE8F2] hover:border-[#145DA0] hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSelected
                      ? 'bg-[#145DA0] text-white'
                      : 'bg-[#F7FAFE] text-[#145DA0]'
                  }`}
                >
                  <InterestIcon name={item.iconName} className="w-4.5 h-4.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-bold text-[#102A43]">
                      {item.title}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#145DA0] border-[#145DA0] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-[#526477] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Part B: Discover Your Strengths */}
      <section className="space-y-4 pt-4 border-t border-[#DFE8F2]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#102A43]">
              B. Discover Your Strengths
            </h3>
            <span className="text-xs text-[#159A91] font-semibold">
              · Self-Reported Reflection
            </span>
          </div>
          <p className="text-xs text-[#526477] mt-0.5">
            How comfortable do you feel with these activities? These ratings are personal reflections, not scientifically validated aptitude scores.
          </p>
        </div>

        <div className="space-y-3">
          {STRENGTH_OPTIONS.map((item) => {
            const currentEntry = profile.strengths.find((s) => s.name === item.key);
            const isNotSure = currentEntry ? currentEntry.rating_status === 'not_sure' : true;
            const currentRating = currentEntry?.rating ?? null;

            return (
              <div
                key={item.key}
                className="p-3.5 rounded-xl bg-white border border-[#DFE8F2] shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <h4 className="text-xs font-bold text-[#102A43]">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-[#526477]">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-[#145DA0] shrink-0">
                    {isNotSure ? 'Not sure yet' : `Level ${currentRating} of 5`}
                  </div>
                </div>

                {/* Rating 1 to 5 and Not Sure */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const isPicked = !isNotSure && currentRating === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleSetStrength(item.key, lvl, false)}
                        className={`flex-1 min-w-[42px] py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                          isPicked
                            ? 'bg-[#145DA0] text-white border-[#145DA0]'
                            : 'bg-[#F7FAFE] border-[#DFE8F2] text-[#102A43] hover:bg-[#EAF4FF]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleSetStrength(item.key, null, true)}
                    className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isNotSure
                        ? 'bg-[#102A43] text-white border-[#102A43]'
                        : 'bg-white border-[#DFE8F2] text-[#526477] hover:bg-[#F7FAFE]'
                    }`}
                  >
                    Not sure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Part C: Written Interest Description */}
      <section className="space-y-4 pt-4 border-t border-[#DFE8F2]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#EAF4FF] text-[#145DA0]">
              <PenTool className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#102A43]">
              Tell Us More About What You Love
            </h3>
            <span className="text-xs text-[#526477] font-normal">
              (Optional)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#526477] mt-1 leading-relaxed">
            Your selections tell us a little about you, but your own words can tell us much more. Describe the subjects you enjoy, the activities that excite you, the things you love creating or learning, and the problems you would like to solve.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DFE8F2] p-4 sm:p-5 shadow-2xs space-y-3">
          <textarea
            rows={5}
            maxLength={maxChars}
            value={profile.interest_description}
            onChange={(e) => onChange({ interest_description: e.target.value.slice(0, maxChars) })}
            placeholder="I enjoy solving mathematical problems and exploring how technology works. I like experimenting with computers, learning new things independently, and creating projects that solve real-world problems. I am still exploring which career might suit me best."
            className="w-full p-3 bg-[#F7FAFE] border border-[#DFE8F2] rounded-xl text-sm text-[#102A43] placeholder:text-slate-400 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#145DA0] focus:bg-white transition-all resize-y"
          />

          {/* Clickable writing prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#102A43]">
              Writing prompts for inspiration (click to add):
            </span>
            <div className="flex flex-wrap gap-2">
              {WRITING_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertPrompt(prompt)}
                  className="text-left text-xs text-[#145DA0] bg-[#EAF4FF] hover:bg-[#D8EAFE] border border-[#D8EAFE] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Character counter & safety note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#DFE8F2] text-xs text-[#526477]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#159A91] shrink-0" />
              <span>Preserved verbatim without automated rewriting. Maximum 1000 characters.</span>
            </div>
            <div className="font-mono text-[#102A43] shrink-0">
              {currentChars} / {maxChars} characters
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

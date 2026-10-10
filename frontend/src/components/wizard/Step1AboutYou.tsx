import React from 'react';
import { StudentProfileCreate, EducationBoard, AcademicStatus } from '../../types/studentProfile';
import { INDIAN_STATES, ACADEMIC_STATUS_LABELS } from '../../data/wizardOptions';
import { User, MapPin, Globe2 } from 'lucide-react';

interface Step1Props {
  profile: StudentProfileCreate;
  onChange: (updates: Partial<StudentProfileCreate>) => void;
  errors?: Record<string, string>;
}

export const Step1AboutYou: React.FC<Step1Props> = ({ profile, onChange, errors }) => {
  const boards: { value: EducationBoard; label: string; desc: string }[] = [
    { value: 'CBSE', label: 'CBSE', desc: 'Central Board of Secondary Education' },
    { value: 'ICSE', label: 'ICSE / CISCE', desc: 'Council for the Indian School Certificate Examinations' },
    { value: 'State Board', label: 'State Board', desc: 'State Government Secondary Education Board' },
    { value: 'Other', label: 'Other', desc: 'IB, Cambridge IGCSE, NIOS, or International curriculum' },
  ];

  const statuses: { value: AcademicStatus; label: string; desc: string }[] = [
    {
      value: 'currently_studying',
      label: ACADEMIC_STATUS_LABELS.currently_studying.label,
      desc: ACADEMIC_STATUS_LABELS.currently_studying.desc,
    },
    {
      value: 'awaiting_results',
      label: ACADEMIC_STATUS_LABELS.awaiting_results.label,
      desc: ACADEMIC_STATUS_LABELS.awaiting_results.desc,
    },
    {
      value: 'completed',
      label: ACADEMIC_STATUS_LABELS.completed.label,
      desc: ACADEMIC_STATUS_LABELS.completed.desc,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#DFE8F2] pb-5">
        <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#102A43] tracking-tight">
          Step 1: About You
        </h2>
        <p className="text-sm text-[#526477] mt-1">
          Tell us about your educational background. We do not ask for identity numbers or sensitive personal details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Preferred Display Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-[#102A43]">
            Preferred Name <span className="text-xs font-normal text-[#526477]">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526477]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={profile.preferred_name || ''}
              onChange={(e) => onChange({ preferred_name: e.target.value.slice(0, 80) })}
              placeholder="e.g. Aaryan or Ananya"
              maxLength={80}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFE8F2] rounded-xl text-[#102A43] placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#145DA0] focus:border-transparent transition-all shadow-2xs"
            />
          </div>
          <p className="text-xs text-[#526477]">
            This name will be displayed on your personal Future Profile summary.
          </p>
        </div>

        {/* Location: Country & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#102A43]">
              Country <span className="text-[#145DA0]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526477]">
                <Globe2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => onChange({ country: e.target.value.slice(0, 100) })}
                placeholder="India"
                maxLength={100}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFE8F2] rounded-xl text-[#102A43] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#145DA0] focus:border-transparent transition-all shadow-2xs"
              />
            </div>
            {errors?.country && (
              <p className="text-xs text-rose-600 font-medium">{errors.country}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#102A43]">
              State / Region
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#526477]">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={profile.region || 'Maharashtra'}
                onChange={(e) => onChange({ region: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFE8F2] rounded-xl text-[#102A43] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#145DA0] focus:border-transparent transition-all shadow-2xs cursor-pointer"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Education Board Selection */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-semibold text-[#102A43]">
            Curriculum / Education Board <span className="text-[#145DA0]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boards.map((b) => {
              const isSelected = profile.curriculum === b.value;
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => onChange({ curriculum: b.value })}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#EAF4FF] border-[#145DA0] text-[#102A43] ring-1 ring-[#145DA0] shadow-2xs'
                      : 'bg-white border-[#DFE8F2] text-[#526477] hover:border-[#145DA0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#102A43]">{b.label}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#145DA0] bg-[#145DA0]' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-[#526477] mt-1">{b.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Academic Status */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-semibold text-[#102A43]">
            Academic Status <span className="text-[#145DA0]">*</span>
          </label>
          <div className="space-y-2.5">
            {statuses.map((s) => {
              const isSelected = profile.academic_status === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onChange({ academic_status: s.value })}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#EAF4FF] border-[#145DA0] ring-1 ring-[#145DA0] text-[#102A43] shadow-2xs'
                      : 'bg-white border-[#DFE8F2] text-[#526477] hover:border-[#145DA0] hover:bg-slate-50'
                  }`}
                >
                  <div className="pr-4">
                    <div className="font-semibold text-sm text-[#102A43]">{s.label}</div>
                    <div className="text-xs text-[#526477] mt-0.5">{s.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                    isSelected ? 'border-[#145DA0] bg-[#145DA0]' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Language */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-sm font-semibold text-[#102A43]">
            Preferred Language <span className="text-xs font-normal text-[#526477]">(Optional)</span>
          </label>
          <input
            type="text"
            value={profile.preferred_language || ''}
            onChange={(e) => onChange({ preferred_language: e.target.value.slice(0, 50) })}
            placeholder="e.g. English, Hindi, Bilingual"
            maxLength={50}
            className="w-full px-4 py-2.5 bg-white border border-[#DFE8F2] rounded-xl text-sm text-[#102A43] focus:outline-hidden focus:ring-2 focus:ring-[#145DA0]"
          />
        </div>
      </div>
    </div>
  );
};

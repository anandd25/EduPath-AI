import React from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentStage: 'landing' | 'wizard' | 'profile';
  onNavigate: (stage: 'landing' | 'wizard' | 'profile') => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onNavigate,
  onScrollToSection,
}) => {
  const handleNavClick = (sectionId: string) => {
    if (currentStage !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        onScrollToSection?.(sectionId);
      }, 100);
    } else {
      onScrollToSection?.(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DFE8F2] py-3.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#145DA0] rounded-lg cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#145DA0] text-white flex items-center justify-center shadow-2xs group-hover:bg-[#102A43] transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#102A43]">
              EduPath
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#526477]">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-[#102A43] transition-colors whitespace-nowrap cursor-pointer ${
                currentStage === 'landing' ? 'text-[#145DA0] font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="hover:text-[#102A43] transition-colors whitespace-nowrap cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="hover:text-[#102A43] transition-colors whitespace-nowrap cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="hover:text-[#102A43] transition-colors whitespace-nowrap cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            {currentStage === 'wizard' ? (
              <button
                onClick={() => onNavigate('landing')}
                className="px-4 py-2 text-xs font-semibold text-[#526477] bg-[#F7FAFE] hover:bg-[#EAF4FF] border border-[#DFE8F2] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Back to Home
              </button>
            ) : currentStage === 'profile' ? (
              <button
                onClick={() => onNavigate('wizard')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => onNavigate('wizard')}
                className="inline-flex items-center gap-2 px-4.5 py-2 text-xs font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] active:scale-98 rounded-lg shadow-2xs transition-all whitespace-nowrap cursor-pointer"
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

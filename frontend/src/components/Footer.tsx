import React, { useState } from 'react';
import { GraduationCap, Shield, Info, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (stage: 'landing' | 'wizard' | 'profile') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [modalContent, setModalContent] = useState<'about' | 'privacy' | null>(null);

  return (
    <>
      <footer className="bg-white border-t border-[#DFE8F2] text-[#526477] text-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#DFE8F2]">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#145DA0] text-white flex items-center justify-center">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <span className="text-xl font-bold text-[#102A43] tracking-tight">
                  EduPath
                </span>
              </div>
              <p className="text-[#526477] text-sm max-w-md leading-relaxed">
                Empowering Class 10 students to explore their academic strengths, personal interests, 
                and educational directions after Class 10 with clarity and structure.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-[#102A43] text-xs font-bold uppercase tracking-wider mb-3">
                Navigation
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => {
                      onNavigate('landing');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#145DA0] transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('landing');
                      setTimeout(() => {
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-[#145DA0] transition-colors cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('wizard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#145DA0] transition-colors cursor-pointer"
                  >
                    Start My Journey
                  </button>
                </li>
              </ul>
            </div>

            {/* Transparency */}
            <div>
              <h4 className="text-[#102A43] text-xs font-bold uppercase tracking-wider mb-3">
                Transparency
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setModalContent('about')}
                    className="hover:text-[#145DA0] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>About EduPath</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalContent('privacy')}
                    className="hover:text-[#145DA0] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Privacy Policy</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#526477]">
            <div>
              &copy; {new Date().getFullYear()} EduPath. All educational paths are valued and respected.
            </div>
            <div className="flex items-center gap-4">
              <span>Class 10 Discovery</span>
              <span aria-hidden="true">&middot;</span>
              <span>Student-First Architecture</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#DFE8F2] relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {modalContent === 'about' ? (
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#145DA0] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#102A43] tracking-tight">
                  About EduPath
                </h3>
                <p className="text-sm text-[#526477] leading-relaxed">
                  EduPath is built specifically for Class 10 students at an important decision crossroads.
                </p>
                <p className="text-sm text-[#526477] leading-relaxed">
                  Rather than forcing hasty career commitments or labeling students with rigid scores, EduPath provides a calm, reflective space to organize your academic background, real interests, and financial context.
                </p>
                <div className="pt-3 border-t border-[#DFE8F2] flex justify-end">
                  <button
                    onClick={() => setModalContent(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#DDF5EE] text-[#159A91] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#102A43] tracking-tight">
                  Privacy Policy
                </h3>
                <p className="text-sm text-[#526477] leading-relaxed">
                  EduPath is committed to protecting student data and respecting privacy:
                </p>
                <ul className="text-xs text-[#526477] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>We do not collect sensitive government identification, Aadhaar numbers, or exact residential addresses.</li>
                  <li>We never request bank account credentials or exact household incomes.</li>
                  <li>Your self-written reflections are preserved verbatim without unauthorized redistribution.</li>
                  <li>Draft information is retained in your local browser storage for convenience while navigating the wizard.</li>
                </ul>
                <div className="pt-3 border-t border-[#DFE8F2] flex justify-end">
                  <button
                    onClick={() => setModalContent(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

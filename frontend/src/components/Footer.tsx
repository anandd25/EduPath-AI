import React, { useState } from 'react';
import { GraduationCap, Shield, Info, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [modalContent, setModalContent] = useState<'about' | 'privacy' | null>(null);

  return (
    <>
      <footer className="bg-[#FAF8F5] border-t border-[#EAE5E0] text-[#6E6762] text-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#EAE5E0]">
            {/* Brand column */}
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF671B] text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold text-[#141413] tracking-tight block leading-none">
                    EduPath
                  </span>
                  <span className="text-[10px] font-semibold text-[#8C827A] tracking-wider uppercase">
                    Where to next?
                  </span>
                </div>
              </div>
              <p className="text-[#6E6762] text-xs max-w-md leading-relaxed">
                Empowering Class 10 students and parents to compare University Degrees, Polytechnic Diplomas, 
                and Vocational Trades with verified fees, real college cutoffs, and zero pressure.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-[#141413] text-xs font-bold uppercase tracking-wider mb-3">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button
                    onClick={() => {
                      onNavigate('/');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('/pathways');
                    }}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer"
                  >
                    Explore Pathways
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('/');
                      setTimeout(() => {
                        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('/');
                      setTimeout(() => {
                        document.getElementById('benchmarks')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer"
                  >
                    Real Benchmarks &amp; Fees
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      onNavigate('/wizard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer font-bold"
                  >
                    Start My Journey
                  </button>
                </li>
              </ul>
            </div>

            {/* Transparency */}
            <div>
              <h4 className="text-[#141413] text-xs font-bold uppercase tracking-wider mb-3">
                Transparency &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <button
                    onClick={() => setModalContent('about')}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-[#FF671B]" />
                    <span>About EduPath</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalContent('privacy')}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Privacy &amp; Data Safeguards</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer text-[#8C827A]"
                  >
                    Student Sign In
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('/register')}
                    className="hover:text-[#FF671B] transition-colors cursor-pointer text-[#8C827A]"
                  >
                    Create Free Account
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C827A]">
            <div>
              &copy; {new Date().getFullYear()} EduPath. Every educational pathway is valued and respected.
            </div>
            <div className="flex items-center gap-3">
              <span>Class 10 Decision Platform</span>
              <span aria-hidden="true">&middot;</span>
              <span>Evidence-Backed Planning</span>
              <span aria-hidden="true">&middot;</span>
              <span className="text-[#FF671B] font-bold">Where to Next? Edition</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Modals */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-2xs">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#EAE5E0] relative"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setModalContent(null)}
              className="absolute top-5 right-5 p-1.5 text-[#8C827A] hover:text-[#141413] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {modalContent === 'about' ? (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF5F0] text-[#FF671B] flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#141413] tracking-tight">
                  About EduPath
                </h3>
                <p className="text-sm text-[#6E6762] leading-relaxed">
                  EduPath is built specifically for Class 10 students at an important decision crossroads.
                </p>
                <p className="text-sm text-[#6E6762] leading-relaxed">
                  Rather than forcing hasty career commitments or labeling students with rigid scores, EduPath provides a calm, reflective space to organize your academic background, real interests, and financial context.
                </p>
                <div className="p-3.5 rounded-2xl bg-[#F9F7F5] border border-[#EAE5E0] text-xs text-[#141413]">
                  <strong className="font-semibold block mb-1">Our Guiding Principle:</strong>
                  Your future has many paths. Every student's journey unfolds with time, curiosity, and experience.
                </div>
                <div className="pt-3 border-t border-[#EAE5E0] flex justify-end">
                  <button
                    onClick={() => setModalContent(null)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] rounded-full transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-[#141413] tracking-tight">
                  Privacy Policy
                </h3>
                <p className="text-sm text-[#6E6762] leading-relaxed">
                  EduPath is committed to protecting student data and respecting privacy:
                </p>
                <ul className="text-xs text-[#6E6762] space-y-2 list-disc pl-4 leading-relaxed">
                  <li>We do not collect government identification numbers, Aadhaar, or exact residential addresses.</li>
                  <li>We never request bank credentials or exact confidential family income.</li>
                  <li>Your written reflections are preserved verbatim without commercial redistribution.</li>
                  <li>Draft answers are saved locally in your browser so you never lose progress.</li>
                </ul>
                <div className="pt-3 border-t border-[#EAE5E0] flex justify-end">
                  <button
                    onClick={() => setModalContent(null)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] rounded-full transition-colors cursor-pointer"
                  >
                    Understood
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

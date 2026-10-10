import React from 'react';
import { 
  ArrowRight, 
  Lightbulb, 
  Layers, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  HeartHandshake,
  DollarSign,
  Route,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { PathwayDiagram } from '../components/PathwayDiagram';

interface LandingPageProps {
  onStartJourney: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartJourney }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFE] text-[#102A43] bg-edupath-pattern">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#DFE8F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6 lg:pr-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF4FF] border border-[#D8EAFE] text-[#145DA0] text-xs font-semibold tracking-wide uppercase">
                <span>FOR CLASS 10 STUDENTS</span>
              </div>

              <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#102A43] tracking-tight leading-[1.12]">
                Your Future Has Many{' '}
                <span className="text-[#145DA0] underline decoration-[#D8EAFE] decoration-4 underline-offset-4">
                  Paths.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#526477] leading-relaxed max-w-xl">
                Explore your interests, understand your strengths and discover the possibilities beyond Class 10.
              </p>

              {/* Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onStartJourney}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer group"
                >
                  <span>Start My Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#145DA0] bg-white hover:bg-[#EAF4FF] border border-[#DFE8F2] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Three Small Icon-and-Text Highlights */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#DFE8F2] text-xs text-[#526477]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#145DA0] shrink-0" />
                  <span>Personalised guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-[#159A91] shrink-0" />
                  <span>Multiple education paths</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#145DA0] shrink-0" />
                  <span>Built for your future</span>
                </div>
              </div>

              {/* Reassurance Message */}
              <div className="flex items-start gap-2 text-xs text-[#526477] bg-[#EAF4FF]/60 p-2.5 rounded-lg border border-[#D8EAFE]/80">
                <HeartHandshake className="w-4 h-4 text-[#159A91] shrink-0 mt-0.5" />
                <span className="leading-normal">
                  You don't need to have everything figured out yet. Start with what you know about yourself.
                </span>
              </div>
            </div>

            {/* Right Column: Minimal CSS/SVG Pathway Diagram */}
            <div className="lg:col-span-6 w-full">
              <PathwayDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section (Why EduPath) */}
      <section id="features" className="py-16 lg:py-24 bg-white border-b border-[#DFE8F2] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#145DA0]">
              WHY EDUPATH
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#102A43] tracking-tight">
              A Little Clarity Can Change Your Direction.
            </h2>
            <p className="text-sm text-[#526477]">
              Class 10 decisions shouldn't feel rushed or high-pressure. We help you reflect calmly on what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#F7FAFE] border border-[#DFE8F2] hover:border-[#145DA0] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#145DA0] flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102A43]">
                1. Understand Yourself
              </h3>
              <p className="text-xs text-[#526477] leading-relaxed">
                Discover your interests, favourite subjects and strengths in a supportive, pressure-free setting.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F2] hover:border-[#145DA0] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#145DA0] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102A43]">
                2. Explore Possibilities
              </h3>
              <p className="text-xs text-[#526477] leading-relaxed">
                Learn about different education routes after Class 10 — Science, Commerce, Humanities, and Vocational options.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#DDF5EE]/50 border border-[#DDF5EE] hover:border-[#159A91] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#DDF5EE] text-[#159A91] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102A43]">
                3. Plan Within Your Budget
              </h3>
              <p className="text-xs text-[#526477] leading-relaxed">
                Consider affordability and financial options, including scholarships and realistic expenditure planning.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DFE8F2] hover:border-[#159A91] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#DDF5EE] text-[#159A91] flex items-center justify-center">
                <Route className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#102A43]">
                4. Discover Alternative Paths
              </h3>
              <p className="text-xs text-[#526477] leading-relaxed">
                See that there are many ways to reach your goals. Success is not confined to one single examination track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-[#F7FAFE] border-b border-[#DFE8F2] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#145DA0]">
              GUIDED PROCESS
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#102A43] tracking-tight">
              Three Simple Steps
            </h2>
            <p className="text-sm text-[#526477]">
              A thoughtful, step-by-step approach to mapping out your educational path after Class 10.
            </p>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#DFE8F2] space-y-3 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#145DA0] text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-base font-bold text-[#102A43]">
                  Tell us about yourself
                </h3>
                <p className="text-xs text-[#526477] leading-relaxed">
                  Share your academic details, interests and preferences. We respect unreleased marks and results awaited.
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#145DA0] font-medium border-t border-[#DFE8F2]">
                Step 1 & 2 · Academic context
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#DFE8F2] space-y-3 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#145DA0] text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-base font-bold text-[#102A43]">
                  Explore your options
                </h3>
                <p className="text-xs text-[#526477] leading-relaxed">
                  Understand the different educational directions across Science, Commerce, Humanities, and Vocational options.
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#145DA0] font-medium border-t border-[#DFE8F2]">
                Step 3 & 4 · Interests & budget
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#DFE8F2] space-y-3 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-[#159A91] text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-base font-bold text-[#102A43]">
                  Review your Future Profile
                </h3>
                <p className="text-xs text-[#526477] leading-relaxed">
                  See a summary of your strengths, interests and goals saved securely to your personal record.
                </p>
              </div>
              <div className="pt-2 text-[11px] text-[#159A91] font-medium border-t border-[#DFE8F2]">
                Step 5 · Profile summary review
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Final Call to Action */}
      <section className="py-16 lg:py-24 bg-[#EAF4FF] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102A43] tracking-tight">
            Take the First Step Towards Your Future.
          </h2>

          <p className="text-base text-[#526477] max-w-xl mx-auto">
            You don't need to have everything figured out yet.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onStartJourney}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-[#145DA0] hover:bg-[#102A43] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Start My Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-[#526477] pt-1">
            Free discovery for Class 10 students &middot; Takes ~5 minutes &middot; Saved to your session
          </div>
        </div>
      </section>
    </div>
  );
};

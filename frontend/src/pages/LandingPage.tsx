import React from 'react';
import { 
  ArrowRight, 
  Lightbulb, 
  Layers, 
  Route, 
  UserCheck, 
  GraduationCap, 
  HeartHandshake, 
  DollarSign,
  Compass,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import { PathwayDiagram } from '../components/PathwayDiagram';

interface LandingPageProps {
  onStartJourney: () => void;
  onNavigate: (route: string) => void;
  isAuthenticated: boolean;
  hasCompletedProfile?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartJourney, 
  onNavigate,
  isAuthenticated,
  hasCompletedProfile = false,
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAFF] text-[#174F6B] bg-edupath-pattern">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-[#DCEAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6 lg:pr-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E7F4FC] border border-[#C9E2F0] text-[#398FC4] text-xs font-bold tracking-wide uppercase">
                <span>FOR CLASS 10 STUDENTS</span>
              </div>

              <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#174F6B] tracking-tight leading-[1.12]">
                Your Future Has Many{' '}
                <span className="text-[#398FC4] underline decoration-[#DDF2EF] decoration-4 underline-offset-4">
                  Paths.
                </span>
              </h1>

              <p className="text-lg sm:text-xl font-medium text-[#385D70] leading-relaxed max-w-xl">
                Explore your interests, understand your strengths and discover the possibilities beyond Class 10.
              </p>

              {/* Action Buttons & Authentication Requirement */}
              <div className="pt-1 flex flex-col items-stretch sm:items-start gap-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={onStartJourney}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#398FC4] hover:bg-[#174F6B] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer group"
                    >
                      <span>
                        {hasCompletedProfile ? 'View My Future Profile' : 'Start My Journey'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#587482] bg-[#DCEAF2]/90 border border-[#DCEAF2] rounded-xl shadow-none cursor-not-allowed select-none opacity-85"
                      title="Sign in or create an account to begin your journey"
                    >
                      <span>Start My Journey</span>
                      <ArrowRight className="w-4 h-4 text-[#587482]/70" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#398FC4] bg-white hover:bg-[#E7F4FC]/30 border border-[#DCEAF2] rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>See How It Works</span>
                  </button>
                </div>

                {/* Helper message shown when NOT authenticated */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#385D70] bg-[#EAF5FC] px-3.5 py-2 rounded-xl border border-[#DCEAF2] max-w-md animate-in fade-in">
                    <Lock className="w-3.5 h-3.5 text-[#398FC4] shrink-0" />
                    <span>
                      Sign in or create an account to begin your journey.{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('/login')}
                        className="font-bold text-[#398FC4] hover:underline cursor-pointer inline"
                      >
                        Sign In
                      </button>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => onNavigate('/register')}
                        className="font-bold text-[#398FC4] hover:underline cursor-pointer inline"
                      >
                        Register
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Three Small Icon-and-Text Highlights */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#DCEAF2] text-xs text-[#587482]">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#398FC4] shrink-0" />
                  <span>Personalised guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-[#438F85] shrink-0" />
                  <span>Multiple education paths</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#398FC4] shrink-0" />
                  <span>Built for your future</span>
                </div>
              </div>

              {/* Reassurance Message */}
              <div className="flex items-start gap-2 text-sm font-medium text-[#385D70] bg-white p-3 rounded-xl border border-[#DCEAF2] shadow-2xs">
                <HeartHandshake className="w-4 h-4 text-[#438F85] shrink-0 mt-0.5" />
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
      <section id="features" className="py-16 lg:py-24 bg-white border-b border-[#DCEAF2] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#398FC4]">
              WHY EDUPATH
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#174F6B] tracking-tight">
              A Little Clarity Can Change Your Direction.
            </h2>
            <p className="text-sm text-[#587482]">
              Class 10 decisions shouldn't feel rushed or high-pressure. We help you reflect calmly on what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-[#F4FAFF] border border-[#DCEAF2] hover:border-[#398FC4] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F4FC] text-[#398FC4] flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#174F6B]">
                1. Understand Yourself
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Discover your interests, favourite subjects and strengths.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DCEAF2] hover:border-[#398FC4] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#C9E2F0]/60 text-[#174F6B] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#174F6B]">
                2. See Beyond Stream Labels
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Look past Science, Commerce and Arts into real career paths and possibilities.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-[#F4FAFF] border border-[#DCEAF2] hover:border-[#398FC4] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#DDF2EF] text-[#438F85] flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#174F6B]">
                3. Practical Considerations
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Think about budget, scholarships and location preferences early.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-white border border-[#DCEAF2] hover:border-[#398FC4] transition-all space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F4FC] text-[#398FC4] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#174F6B]">
                4. Your Personal Roadmap
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Get a structured view of where you are and where you could go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-[#F4FAFF] border-b border-[#DCEAF2] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#398FC4]">
              HOW IT WORKS
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#174F6B] tracking-tight">
              Three Simple Steps to Clarity.
            </h2>
            <p className="text-sm text-[#587482]">
              Designed specifically for Class 10 students and their parents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#DCEAF2] space-y-4 shadow-2xs relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#E7F4FC] text-[#398FC4] text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-[#174F6B]">
                Tell Us About Yourself
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Share your current subjects, the ones you enjoy most, your hobbies, and what you naturally find interesting. No pressure, no tests.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#398FC4] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#438F85]" />
                <span>Takes ~5 minutes</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#DCEAF2] space-y-4 shadow-2xs relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#DDF2EF] text-[#438F85] text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-[#174F6B]">
                Review Your Profile
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                Check your answers, see how your interests connect, and make sure everything feels accurate before moving forward.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#438F85] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#438F85]" />
                <span>Always editable</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#DCEAF2] space-y-4 shadow-2xs relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#C9E2F0]/60 text-[#174F6B] text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-[#174F6B]">
                Explore Your Future Profile
              </h3>
              <p className="text-sm text-[#385D70] leading-relaxed">
                See a clear summary of your educational profile, ready for future pathway recommendations and informed conversations.
              </p>
              <div className="pt-2 text-[11px] font-medium text-[#174F6B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#438F85]" />
                <span>Your personal summary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. About EduPath Section */}
      <section id="about" className="py-16 lg:py-24 bg-white border-b border-[#DCEAF2] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#398FC4]">
                ABOUT EDUPATH
              </span>
              <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#174F6B] tracking-tight">
                Our Philosophy: Your Future is Bigger Than Any Single Exam.
              </h2>
              <p className="text-sm text-[#587482] leading-relaxed">
                EduPath was founded on a simple insight: you don&apos;t have to lock yourself into a single permanent label today. Instead, by reflecting honestly on what you enjoy, your academic comfort levels, and your family&apos;s real budget preferences, you can see the rich spectrum of educational possibilities ahead.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-[#174F6B]">
                  <CheckCircle2 className="w-4 h-4 text-[#438F85] shrink-0" />
                  <span>No automated career pigeonholing or forced predictions</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#174F6B]">
                  <CheckCircle2 className="w-4 h-4 text-[#438F85] shrink-0" />
                  <span>Missing marks are never penalized or scored as zero</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#174F6B]">
                  <CheckCircle2 className="w-4 h-4 text-[#438F85] shrink-0" />
                  <span>Complete confidentiality with no identity numbers required</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#F4FAFF] border border-[#DCEAF2] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E7F4FC] text-[#398FC4] flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#174F6B]">
                      The EduPath Promise
                    </h4>
                    <span className="text-[11px] text-[#587482]">
                      Empowering every Class 10 learner
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#385D70] leading-relaxed">
                  <div className="p-3.5 bg-white rounded-xl border border-[#DCEAF2]">
                    <strong className="text-[#174F6B] block mb-0.5">Every Stream Has Merit:</strong>
                    Whether you are drawn to Pure Sciences, Commerce, Humanities, Applied Arts, or Polytechnic Diplomas, every path has high-impact modern opportunities.
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-[#DCEAF2]">
                    <strong className="text-[#174F6B] block mb-0.5">Practical &amp; Affordable:</strong>
                    Education choices must fit family financial comfort. We make budget and scholarship exploration transparent from day one.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final Call to Action */}
      <section className="py-16 lg:py-24 bg-[#E7F4FC]/30 border-b border-[#DCEAF2] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#174F6B] tracking-tight">
            Take the First Step Towards Your Future.
          </h2>

          <p className="text-base text-[#587482] max-w-xl mx-auto">
            You don&apos;t need to have everything figured out yet. Start with what you know about yourself.
          </p>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onStartJourney}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white bg-[#398FC4] hover:bg-[#174F6B] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>
                    {hasCompletedProfile ? 'View My Future Profile' : 'Start My Journey'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#587482] bg-[#DCEAF2]/90 border border-[#DCEAF2] rounded-xl shadow-none cursor-not-allowed select-none opacity-85"
                  title="Sign in or create an account to begin your journey"
                >
                  <span>Start My Journey</span>
                  <ArrowRight className="w-4 h-4 text-[#587482]/70" />
                </button>
              )}

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#398FC4] bg-white hover:bg-[#F4FAFF] border border-[#DCEAF2] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <span>Create an Account</span>
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <div className="flex items-center gap-2 text-xs text-[#587482] bg-white/80 px-3.5 py-1.5 rounded-lg border border-[#DCEAF2]">
                <Lock className="w-3.5 h-3.5 text-[#398FC4]" />
                <span>Sign in or create an account to begin your journey.</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[#587482] pt-1">
            Free discovery for Class 10 students &middot; Takes ~5 minutes &middot; Saved securely to your account
          </div>
        </div>
      </section>
    </div>
  );
};

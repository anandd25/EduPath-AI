import React, { useState } from 'react';
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
  Lock,
  Scale,
  Building2,
  MapPin,
  Award,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Wrench,
  Code2,
  Briefcase,
  Palette,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { HeroPathwayPreview } from '../components/HeroPathwayPreview';

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
  // Interactive 10-Second Quick Pathfinder state (Kamdalej style)
  const [quickInterest, setQuickInterest] = useState<'machines' | 'software' | 'business' | 'creative'>('machines');
  const [quickPriority, setQuickPriority] = useState<'degree' | 'diploma' | 'vocational'>('diploma');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Determine dynamic quick match
  const getQuickMatch = () => {
    if (quickPriority === 'vocational') {
      return {
        routeName: 'Route C: Vocational Apprenticeship',
        tag: 'Fastest Route to Financial Independence',
        accentColor: '#D97706',
        badgeBg: 'bg-[#FEF3C7]',
        badgeText: 'text-[#D97706]',
        duration: '2–3 Years',
        annualFee: '₹3,500 / yr (Paid Stipend)',
        benchmark: 'National Skill Training Institute (NSTI) / ITI',
        location: 'Mumbai & Pune, Maharashtra',
        citation: 'DGT / MSDE Gazette Notification',
        cutoff: 'Class 10 Pass (Direct Admission)',
        whyFit: 'Immediate hands-on workshop training with zero tuition debt and ₹9,500/month government stipend.',
      };
    }
    if (quickPriority === 'diploma') {
      return {
        routeName: 'Route B: Polytechnic Diploma + Lateral Entry',
        tag: '100% Budget Feasible · Direct 2nd Year Degree',
        accentColor: '#0D9488',
        badgeBg: 'bg-[#CCFBF1]',
        badgeText: 'text-[#0D9488]',
        duration: '6 Years (3 Yrs Dip + 3 Yrs B.Tech)',
        annualFee: '₹7,750 / yr (State Gazetted)',
        benchmark: 'Government Polytechnic, Pune',
        location: 'Shivajinagar, Pune (70% Home District Quota)',
        citation: 'Directorate of Technical Education (DTE) Maharashtra',
        cutoff: '86.4% in Class 10 (CAP Round Merit)',
        whyFit: '93% tuition savings, no competitive entrance exam burnout, and identical university degree outcome.',
      };
    }
    return {
      routeName: 'Route A: University Engineering Degree',
      tag: 'Maximum Career Ceiling & Corporate Placements',
      accentColor: '#2563EB',
      badgeBg: 'bg-[#DBEAFE]',
      badgeText: 'text-[#2563EB]',
      duration: '6–7 Years (Class 11-12 + 4 Yrs B.Tech)',
      annualFee: '₹1,14,000 / yr (FRA Gazetted)',
      benchmark: 'COEP Technological University, Pune',
      location: 'Pune, Maharashtra (85% State Domicile Quota)',
      citation: 'Maharashtra Fee Regulating Authority (FRA) Gazette',
      cutoff: 'MHT-CET / JEE Main (Cutoff ~97.5%ile)',
      whyFit: 'Direct eligibility for top corporate engineering placement drives, campus hiring, and higher research degrees.',
    };
  };

  const quickMatch = getQuickMatch();

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-[#141413] bg-edupath-pattern">
      {/* 1. Hero Section - Ultra Clean Kam Ďalej Style */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-[#EAE5E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-7 lg:pr-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5F0] border border-[#FFD9C7] text-[#FF671B] text-xs font-bold tracking-wider uppercase shadow-2xs">
                <Compass className="w-3.5 h-3.5" />
                <span>WHERE TO NEXT? · FOR CLASS 10 LEARNERS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#141413] tracking-tight leading-[1.12]">
                Your Future Has More Than One Path.{' '}
                <span className="text-[#FF671B] block mt-1">
                  Find the One That Fits You.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#6E6762] leading-relaxed max-w-xl">
                Compare University Degrees, Polytechnic Diplomas, and Vocational Trades with verified government fees, real college benchmarks, and zero stress.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col items-stretch sm:items-start gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={onStartJourney}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] active:scale-98 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <span>
                        {hasCompletedProfile ? 'View My Future Profile' : 'Start My Journey'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate('/login')}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] active:scale-98 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <span>Start My Journey</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onNavigate('/pathways')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#141413] bg-white hover:bg-[#F5F2EF] border border-[#EAE5E0] rounded-full transition-all cursor-pointer shadow-xs"
                  >
                    <Layers className="w-4 h-4 text-[#FF671B]" />
                    <span>Compare 3 Pathways</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-[#6E6762] hover:text-[#141413] transition-colors cursor-pointer"
                  >
                    <span>How It Works</span>
                  </button>
                </div>

                {/* Helper notice if guest */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 text-xs text-[#6E6762] bg-[#FFF9F5] px-4 py-2 rounded-xl border border-[#FFECD9] max-w-md">
                    <Lock className="w-3.5 h-3.5 text-[#FF671B] shrink-0" />
                    <span>
                      Sign in or register to save your profile.{' '}
                      <button
                        type="button"
                        onClick={() => onNavigate('/login')}
                        className="font-bold text-[#FF671B] hover:underline cursor-pointer inline"
                      >
                        Sign In
                      </button>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => onNavigate('/register')}
                        className="font-bold text-[#FF671B] hover:underline cursor-pointer inline"
                      >
                        Register Free
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Three Reassuring Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#EAE5E0] text-xs text-[#6E6762]">
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#FF671B] shrink-0" />
                  <span>100% Free &amp; Confidential</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                  <span>Official State Fee Gazettes</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Tailored for Class 10</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Pathway Preview Card */}
            <div className="lg:col-span-6 w-full flex items-center justify-center">
              <HeroPathwayPreview
                onExploreClick={() => onNavigate('/pathways')}
                onCompareClick={() => onNavigate('/pathways')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Quick Pathfinder (Kam Ďalej Signature Feature) */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#EAE5E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF671B]">
              QUICK PATHFINDER
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
              Where Do You Fit? See in 10 Seconds.
            </h2>
            <p className="text-sm text-[#6E6762]">
              Select what you enjoy and your top priority to see your recommended post-Class 10 route.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Selector Column */}
            <div className="lg:col-span-6 space-y-6 bg-[#F9F7F5] p-6 sm:p-8 rounded-3xl border border-[#EAE5E0]">
              {/* Question 1: Interests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-3">
                  1. What do you naturally enjoy doing?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQuickInterest('machines')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickInterest === 'machines'
                        ? 'bg-white border-[#FF671B] text-[#141413] shadow-xs ring-1 ring-[#FF671B]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-[#FF671B] shrink-0" />
                    <span>Machines &amp; Physics</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickInterest('software')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickInterest === 'software'
                        ? 'bg-white border-[#FF671B] text-[#141413] shadow-xs ring-1 ring-[#FF671B]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>Coding &amp; Logic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickInterest('business')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickInterest === 'business'
                        ? 'bg-white border-[#FF671B] text-[#141413] shadow-xs ring-1 ring-[#FF671B]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>Business &amp; Finance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickInterest('creative')}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickInterest === 'creative'
                        ? 'bg-white border-[#FF671B] text-[#141413] shadow-xs ring-1 ring-[#FF671B]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-[#D97706] shrink-0" />
                    <span>Design &amp; Media</span>
                  </button>
                </div>
              </div>

              {/* Question 2: Priority */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C827A] mb-3">
                  2. What is your family&apos;s main priority?
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setQuickPriority('diploma')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickPriority === 'diploma'
                        ? 'bg-white border-[#0D9488] text-[#141413] shadow-xs ring-1 ring-[#0D9488]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center text-[10px] font-bold">
                        B
                      </div>
                      <div>
                        <div className="font-bold text-[#141413]">Lower Fees &amp; Hands-on Skills</div>
                        <div className="text-[11px] font-normal text-[#8C827A]">3-Yr Polytechnic Diploma + Direct 2nd Year Degree</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#0D9488] bg-[#CCFBF1] px-2 py-0.5 rounded-md">
                      Smart Choice
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickPriority('degree')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickPriority === 'degree'
                        ? 'bg-white border-[#2563EB] text-[#141413] shadow-xs ring-1 ring-[#2563EB]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-[10px] font-bold">
                        A
                      </div>
                      <div>
                        <div className="font-bold text-[#141413]">Highest Degree Ceiling</div>
                        <div className="text-[11px] font-normal text-[#8C827A]">Class 11-12 PCM + University Engineering Entrance</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-md">
                      Tier 1 Target
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickPriority('vocational')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      quickPriority === 'vocational'
                        ? 'bg-white border-[#D97706] text-[#141413] shadow-xs ring-1 ring-[#D97706]'
                        : 'bg-white/60 border-[#EAE5E0] text-[#6E6762] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-[10px] font-bold">
                        C
                      </div>
                      <div>
                        <div className="font-bold text-[#141413]">Fastest Career &amp; Zero Debt</div>
                        <div className="text-[11px] font-normal text-[#8C827A]">2-Yr Vocational Trade + Paid NAPS Apprenticeship</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-md">
                      Earn Early
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Recommendation Card */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5E0] shadow-sm space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${quickMatch.badgeBg} ${quickMatch.badgeText}`}>
                    {quickMatch.tag}
                  </span>
                  <h3 className="text-xl font-bold text-[#141413] mt-2">
                    {quickMatch.routeName}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#6E6762] leading-relaxed">
                {quickMatch.whyFit}
              </p>

              {/* Verified Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#F9F7F5] border border-[#EAE5E0]">
                  <span className="text-[10px] font-semibold text-[#8C827A] block">Verified Annual Fee</span>
                  <span className="text-sm font-bold text-[#141413]">{quickMatch.annualFee}</span>
                  <span className="text-[9px] text-[#8C827A] block mt-0.5">{quickMatch.citation}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F9F7F5] border border-[#EAE5E0]">
                  <span className="text-[10px] font-semibold text-[#8C827A] block">Duration</span>
                  <span className="text-sm font-bold text-[#141413]">{quickMatch.duration}</span>
                  <span className="text-[9px] text-[#8C827A] block mt-0.5">Cutoff: {quickMatch.cutoff}</span>
                </div>
              </div>

              {/* Real Benchmark Institution */}
              <div className="p-3.5 rounded-2xl bg-[#FFF9F5] border border-[#FFECD9] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9A3412]">
                  <Building2 className="w-3.5 h-3.5 text-[#FF671B]" />
                  <span>Real Benchmark: {quickMatch.benchmark}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7C2D12]">
                  <MapPin className="w-3 h-3 text-[#FF671B]" />
                  <span>{quickMatch.location}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onNavigate('/pathways')}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-bold text-white bg-[#141413] hover:bg-[#2A2725] transition-all cursor-pointer shadow-xs"
              >
                <span>Explore Full Pathway in Roadmap</span>
                <ChevronRight className="w-4 h-4 text-[#FF671B]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section (3 Clean Steps) */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-[#F9F7F5] border-b border-[#EAE5E0] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF671B]">
              HOW IT WORKS · AKO TO FUNGUJE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
              Three Simple Steps to Clarity.
            </h2>
            <p className="text-sm text-[#6E6762]">
              Designed specifically for Class 10 students and parents. No stress, no tests, and no forced permanent labels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EAE5E0] space-y-4 shadow-xs relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#FF671B] text-sm font-bold flex items-center justify-center border border-[#FFD9C7]">
                1
              </div>
              <h3 className="text-xl font-bold text-[#141413]">
                Tell Us About Yourself
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                Share your Class 10 subjects, favorite topics, strengths, and family annual budget. Missing marks are never penalized or marked zero.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#FF671B] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF671B]" />
                <span>Takes ~5 minutes · No ID required</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EAE5E0] space-y-4 shadow-xs relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0D9488] text-sm font-bold flex items-center justify-center border border-[#99F6E4]">
                2
              </div>
              <h3 className="text-xl font-bold text-[#141413]">
                Compare 3 Complete Routes
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                Compare University Degree, Polytechnic Diploma, and Vocational Apprenticeship side-by-side with true timelines, prerequisites, and starting salaries.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#0D9488] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Side-by-side matrix comparison</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-[#EAE5E0] space-y-4 shadow-xs relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#DBEAFE] text-[#2563EB] text-sm font-bold flex items-center justify-center border border-[#BFDBFE]">
                3
              </div>
              <h3 className="text-xl font-bold text-[#141413]">
                Act on Verified Evidence
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                Every rupee is backed by official State Fee Regulatory Authorities (FRA) and AICTE. Real college benchmarks show exact cutoffs and safety nets.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#2563EB] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Official gazette citations &amp; fallbacks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Real-Life Benchmarks & Regulatory Cost Evidence Showcase */}
      <section id="benchmarks" className="py-16 lg:py-24 bg-white border-b border-[#EAE5E0] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF671B]">
              REGULATORY EVIDENCE &amp; REAL BENCHMARKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
              Real Colleges Side-by-Side. Official Fee Gazettes.
            </h2>
            <p className="text-sm text-[#6E6762]">
              We don&apos;t use hypothetical guesses. Here is how actual state institutions and fees compare under official regulatory notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Benchmark 1: University */}
            <div className="p-6 rounded-3xl bg-[#F9F7F5] border border-[#EAE5E0] hover:border-[#2563EB] transition-all space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#DBEAFE] text-[#2563EB]">
                  ROUTE A · UNIVERSITY DEGREE
                </span>
                <span className="text-[10px] text-[#8C827A] font-semibold">Tier 1 Autonomous</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#141413]">
                  COEP Technological University
                </h3>
                <p className="text-xs text-[#6E6762] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Pune, Maharashtra (85% State Domicile)</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5E0] space-y-1">
                <div className="text-[10px] font-semibold text-[#8C827A]">Gazetted Annual Fee:</div>
                <div className="text-base font-bold text-[#141413]">₹1,14,000 / year</div>
                <div className="text-[9px] text-[#8C827A]">Authority: Maharashtra FRA Gazette 2024–25</div>
              </div>

              <div className="space-y-1.5 text-xs text-[#6E6762]">
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span><strong>Merit Cutoff:</strong> MHT-CET / JEE ~97.5%ile</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                  <span><strong>Outcome:</strong> ₹7L–₹14L/yr campus placement</span>
                </div>
              </div>
            </div>

            {/* Benchmark 2: Polytechnic */}
            <div className="p-6 rounded-3xl bg-[#F9F7F5] border-2 border-[#0D9488] transition-all space-y-4 shadow-sm relative">
              <div className="absolute -top-3 right-6 bg-[#0D9488] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                93% Tuition Savings
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#CCFBF1] text-[#0D9488]">
                  ROUTE B · POLYTECHNIC DIPLOMA
                </span>
                <span className="text-[10px] text-[#8C827A] font-semibold">Government Poly</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#141413]">
                  Government Polytechnic, Pune
                </h3>
                <p className="text-xs text-[#6E6762] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Shivajinagar, Pune (70% District Quota)</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5E0] space-y-1">
                <div className="text-[10px] font-semibold text-[#8C827A]">Gazetted Annual Fee:</div>
                <div className="text-base font-bold text-[#0D9488]">₹7,750 / year</div>
                <div className="text-[9px] text-[#8C827A]">Authority: DTE Maharashtra Gazetted Schedule</div>
              </div>

              <div className="space-y-1.5 text-xs text-[#6E6762]">
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                  <span><strong>Merit Cutoff:</strong> 86.4% in Class 10 (CAP Round)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                  <span><strong>Outcome:</strong> Direct 2nd Yr B.Tech or Jr. Engineer</span>
                </div>
              </div>
            </div>

            {/* Benchmark 3: Vocational */}
            <div className="p-6 rounded-3xl bg-[#F9F7F5] border border-[#EAE5E0] hover:border-[#D97706] transition-all space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  ROUTE C · VOCATIONAL TRADE
                </span>
                <span className="text-[10px] text-[#8C827A] font-semibold">DGT Skill Centre</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#141413]">
                  National Skill Training Inst. / ITI
                </h3>
                <p className="text-xs text-[#6E6762] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>ITI Aundh / NSTI Mumbai</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE5E0] space-y-1">
                <div className="text-[10px] font-semibold text-[#8C827A]">Fee &amp; Government Stipend:</div>
                <div className="text-base font-bold text-[#D97706]">₹3,500/yr · +₹9.5K/mo Stipend</div>
                <div className="text-[9px] text-[#8C827A]">Authority: MSDE / DGT Apprenticeship Gazette</div>
              </div>

              <div className="space-y-1.5 text-xs text-[#6E6762]">
                <div className="flex items-start gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span><strong>Entry:</strong> Class 10 Pass (No Entrance Exam)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0 mt-0.5" />
                  <span><strong>Outcome:</strong> Immediate salary + Evening Poly bridge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why EduPath (Value Pillars) */}
      <section id="features" className="py-16 lg:py-24 bg-[#F9F7F5] border-b border-[#EAE5E0] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF671B]">
              THE EDUPATH PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
              Calm, Evidence-Backed Decisions.
            </h2>
            <p className="text-sm text-[#6E6762]">
              Decisions after Class 10 shouldn&apos;t feel rushed or high-pressure. We put facts and choices first.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#EAE5E0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FFF5F0] text-[#FF671B] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-[#141413]">
                No Stream Pigeonholing
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                You aren&apos;t permanently locked into rigid labels. Explore interdisciplinary combinations and lateral entries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE5E0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-[#141413]">
                Real Family Cash Flow
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                We check fee timings against your real savings, so families never face sudden semester surprises.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE5E0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-[#141413]">
                Verified Safety Nets
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                Every node has an actionable fallback. If an entrance cutoff is missed, transfer directly into polytechnic credit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EAE5E0] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-sm font-bold text-[#141413]">
                AI + Deterministic Proof
              </h3>
              <p className="text-xs text-[#6E6762] leading-relaxed">
                Groq AI suggests personalized explanations, while deterministic rules enforce academic and financial feasibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. About Section */}
      <section id="about" className="py-16 lg:py-24 bg-white border-b border-[#EAE5E0] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF671B]">
                ABOUT EDUPATH
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#141413] tracking-tight">
                Your Future is Bigger Than Any Single Exam.
              </h2>
              <p className="text-sm text-[#6E6762] leading-relaxed">
                EduPath was built on a simple conviction: you don&apos;t have to lock your entire career today. By reflecting calmly on your favorite subjects, your strengths, and your family&apos;s real budget comfort, you discover multiple viable paths ahead.
              </p>
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-[#141413]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF671B] shrink-0" />
                  <span>No automated career pigeonholing or forced predictions</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#141413]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF671B] shrink-0" />
                  <span>Missing marks are never penalized or scored as zero</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#141413]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF671B] shrink-0" />
                  <span>Complete confidentiality with no identity numbers required</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-[#F9F7F5] border border-[#EAE5E0] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF5F0] text-[#FF671B] flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#141413]">
                      The EduPath Promise
                    </h4>
                    <span className="text-[11px] text-[#8C827A]">
                      Empowering every Class 10 learner &amp; parent
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#6E6762] leading-relaxed">
                  <div className="p-3.5 bg-white rounded-2xl border border-[#EAE5E0]">
                    <strong className="text-[#141413] block mb-0.5">Every Route Has Merit:</strong>
                    Whether you choose Pure Sciences, Polytechnic Diplomas, Commerce, or Technical Trades, each route has high-impact career progression.
                  </div>
                  <div className="p-3.5 bg-white rounded-2xl border border-[#EAE5E0]">
                    <strong className="text-[#141413] block mb-0.5">Transparent &amp; Feasible:</strong>
                    Education choices must fit family financial comfort. We make budget and scholarship exploration transparent from day one.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5] border-b border-[#EAE5E0] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] tracking-tight">
            Where Will Your Next Step Take You?
          </h2>

          <p className="text-base text-[#6E6762] max-w-xl mx-auto">
            You don&apos;t need to have everything figured out today. Start with what you know about yourself.
          </p>

          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={onStartJourney}
                  className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] active:scale-98 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {hasCompletedProfile ? 'View My Future Profile' : 'Start My Journey'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('/register')}
                  className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold text-white bg-[#FF671B] hover:bg-[#e5560f] active:scale-98 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Start My Journey Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('/pathways')}
                className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-[#141413] bg-white hover:bg-[#F5F2EF] border border-[#EAE5E0] rounded-full transition-all cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4 text-[#FF671B]" />
                <span>Explore All 3 Pathways</span>
              </button>
            </div>

            <div className="text-xs text-[#8C827A] pt-2">
              Free discovery for Class 10 students &middot; Takes ~5 minutes &middot; Saved securely
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

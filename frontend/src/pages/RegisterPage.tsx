import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { authService } from '../services/authService';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
  onRegisterSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigate,
  onRegisterSuccess,
  onContinueAsGuest,
}) => {
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!preferredName.trim()) {
      setErrorMessage('Please enter your preferred name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.register(preferredName.trim(), email.trim(), password);
      onRegisterSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAF9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-edupath-pattern">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5E8085] hover:text-[#376E7D] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to EduPath Home</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#CDEDE2] text-[#278F89] shadow-2xs mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#376E7D] tracking-tight">
            Create Your EduPath Account
          </h1>
          <p className="text-sm text-[#5E8085] max-w-sm mx-auto">
            Start with what you know about yourself. Your journey can unfold one step at a time.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xs rounded-3xl border border-[#DCEBEA] space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-1.5">
                <div className="font-semibold">{errorMessage}</div>
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#367BA8] hover:underline"
                >
                  <span>Continue to Class 10 Profile Wizard directly</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#376E7D] uppercase tracking-wider">
                Preferred Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E8085]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="e.g. Aaryan or Ananya"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5FAF9] border border-[#DCEBEA] rounded-xl text-sm text-[#376E7D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#367BA8] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#376E7D] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E8085]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5FAF9] border border-[#DCEBEA] rounded-xl text-sm text-[#376E7D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#367BA8] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#376E7D] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E8085]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#F5FAF9] border border-[#DCEBEA] rounded-xl text-sm text-[#376E7D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#367BA8] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5E8085] hover:text-[#376E7D] cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-[#5E8085] block">
                Must be at least 8 characters.
              </span>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#376E7D] uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E8085]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#F5FAF9] border border-[#DCEBEA] rounded-xl text-sm text-[#376E7D] placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#367BA8] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5E8085] hover:text-[#376E7D] cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms & Consent */}
            <div className="flex items-start pt-1">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 text-[#367BA8] focus:ring-[#367BA8] border-[#DCEBEA] rounded-sm mt-0.5 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-xs text-[#5E8085] leading-snug cursor-pointer">
                I agree to the EduPath Privacy Policy and accept that my self-reported reflections will be kept confidential.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Guest Wizard Bypass Note */}
          <div className="pt-2 text-center border-t border-[#DCEBEA]">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-[#5E8085] hover:text-[#367BA8] font-medium transition-colors cursor-pointer"
            >
              Skip for now: <span className="font-semibold underline">Continue as Guest to Profile Wizard</span>
            </button>
          </div>

          {/* Switch to Login */}
          <div className="text-center text-xs text-[#5E8085]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-bold text-[#367BA8] hover:text-[#278F89] transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

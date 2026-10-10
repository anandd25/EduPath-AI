import React, { useState } from 'react';
import { 
  GraduationCap, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2,
  Info,
  ArrowRight
} from 'lucide-react';
import { authService } from '../services/authService';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(email.trim(), password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please verify your credentials.');
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
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#C9E6F8] text-[#367BA8] shadow-2xs mb-1">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#376E7D] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-[#5E8085]">
            Continue exploring your possibilities with EduPath.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#376E7D] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-[#367BA8] hover:text-[#278F89] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E8085]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#367BA8] focus:ring-[#367BA8] border-[#DCEBEA] rounded-sm cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-[#5E8085] cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
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
              Want to try without signing in? <span className="font-semibold underline">Explore as Guest</span>
            </button>
          </div>

          {/* Switch to Register */}
          <div className="text-center text-xs text-[#5E8085]">
            New to EduPath?{' '}
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-bold text-[#367BA8] hover:text-[#278F89] transition-colors cursor-pointer"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#DCEBEA]">
            <div className="flex items-center gap-2.5 text-[#367BA8]">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-[#376E7D]">Password Recovery</h3>
            </div>
            <p className="text-xs text-[#5E8085] leading-relaxed">
              Email password resets require backend mail service integration. In this development stage, you can continue to the Class 10 Profile Wizard directly as a guest without losing any work.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { GraduationCap, ArrowRight, Menu, X, User } from 'lucide-react';
import { User as UserType } from '../services/authService';

interface HeaderProps {
  currentRoute: string;
  currentUser: UserType | null;
  onNavigate: (route: string) => void;
  onScrollToSection?: (sectionId: string) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  currentUser,
  onNavigate,
  onScrollToSection,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentRoute !== '/') {
      onNavigate('/');
      setTimeout(() => {
        onScrollToSection?.(sectionId);
      }, 100);
    } else {
      onScrollToSection?.(sectionId);
    }
  };

  const handleLinkClick = (route: string) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DCEBEA] py-3.5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Wordmark */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#367BA8] rounded-lg cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C9E6F8] text-[#367BA8] flex items-center justify-center shadow-2xs group-hover:bg-[#367BA8] group-hover:text-white transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#376E7D]">
              EduPath
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5E8085]">
            <button
              onClick={() => handleLinkClick('/')}
              className={`hover:text-[#376E7D] transition-colors whitespace-nowrap cursor-pointer ${
                currentRoute === '/' ? 'text-[#367BA8] font-bold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="hover:text-[#376E7D] transition-colors whitespace-nowrap cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="hover:text-[#376E7D] transition-colors whitespace-nowrap cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className="hover:text-[#376E7D] transition-colors whitespace-nowrap cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#376E7D] bg-[#F5FAF9] px-3 py-1.5 rounded-lg border border-[#DCEBEA]">
                  <User className="w-3.5 h-3.5 text-[#367BA8]" />
                  <span className="font-semibold">{currentUser.preferred_name || currentUser.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-[#5E8085] hover:text-[#376E7D] transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
                <button
                  onClick={() => handleLinkClick('/wizard')}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] rounded-xl shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>My Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-[#367BA8] hover:text-[#278F89] border border-transparent hover:border-[#DCEBEA] rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleLinkClick('/register')}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] active:scale-98 rounded-xl shadow-2xs transition-all whitespace-nowrap cursor-pointer"
                >
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#5E8085] hover:text-[#376E7D] rounded-lg border border-[#DCEBEA] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-[#DCEBEA] mt-3 space-y-3 animate-in fade-in duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-[#5E8085]">
              <button
                onClick={() => handleLinkClick('/')}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-[#F5FAF9] hover:text-[#376E7D]"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('how-it-works')}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-[#F5FAF9] hover:text-[#376E7D]"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavClick('features')}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-[#F5FAF9] hover:text-[#376E7D]"
              >
                Features
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-[#F5FAF9] hover:text-[#376E7D]"
              >
                About
              </button>
            </nav>

            <div className="pt-3 border-t border-[#DCEBEA] flex flex-col gap-2">
              {currentUser ? (
                <>
                  <div className="text-xs text-[#376E7D] px-2 py-1">
                    Signed in as <strong className="font-semibold">{currentUser.preferred_name || currentUser.email}</strong>
                  </div>
                  <button
                    onClick={() => handleLinkClick('/wizard')}
                    className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-[#367BA8] rounded-xl"
                  >
                    Open Profile Wizard
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-2 text-xs font-semibold text-[#5E8085] hover:text-[#376E7D]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleLinkClick('/login')}
                    className="w-full text-center py-2.5 px-4 text-xs font-semibold text-[#367BA8] bg-[#F5FAF9] border border-[#DCEBEA] rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleLinkClick('/register')}
                    className="w-full text-center py-2.5 px-4 text-xs font-semibold text-white bg-[#367BA8] rounded-xl"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

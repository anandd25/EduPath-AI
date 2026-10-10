/**
 * EduPath — Your Future, Taking Shape
 * Class 10 Educational Discovery Platform
 * Powered by Supabase Authentication & FastAPI Backend Integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentProfileCreate, StudentProfileOut } from './types/studentProfile';
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentProfileWizard } from './pages/StudentProfileWizard';
import { FutureProfilePage } from './pages/FutureProfilePage';

type AppRoute = '/' | '/login' | '/register' | '/wizard' | '/profile';

function EduPathApp() {
  const { user, loading, isAuthenticated, signOut } = useAuth();

  const [draftProfile, setDraftProfile] = useState<StudentProfileCreate>(() => {
    return storageService.getDraftProfile();
  });

  const [confirmedProfile, setConfirmedProfile] = useState<StudentProfileOut | null>(null);

  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Sync route from URL hash
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const rawHash = window.location.hash.replace(/^#/, '');
    if (rawHash === '/login' || rawHash === 'login') return '/login';
    if (rawHash === '/register' || rawHash === 'register') return '/register';
    if (rawHash === '/wizard' || rawHash === 'wizard') return '/wizard';
    if (rawHash === '/profile' || rawHash === 'profile') return '/profile';
    return '/';
  });

  const handleNavigate = useCallback((route: string, notice?: string) => {
    const normalized = route.startsWith('/') ? route : `/${route}`;
    if (notice) {
      setRedirectNotice(notice);
    } else {
      setRedirectNotice(null);
    }

    // Check protected routes
    if ((normalized === '/wizard' || normalized === '/profile') && !isAuthenticated && !loading) {
      setRedirectNotice('Sign in or create an account to begin your journey.');
      setCurrentRoute('/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (
      normalized === '/' ||
      normalized === '/login' ||
      normalized === '/register' ||
      normalized === '/wizard' ||
      normalized === '/profile'
    ) {
      setCurrentRoute(normalized as AppRoute);
    } else {
      setCurrentRoute('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAuthenticated, loading]);

  // Sync route changes to window hash
  useEffect(() => {
    window.location.hash = currentRoute;
  }, [currentRoute]);

  // Listen to browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === '/wizard' || hash === 'wizard' || hash === '/profile' || hash === 'profile') {
        if (!isAuthenticated && !loading) {
          handleNavigate('/login', 'Sign in or create an account to begin your journey.');
          return;
        }
        setCurrentRoute(hash.startsWith('/') ? (hash as AppRoute) : (`/${hash}` as AppRoute));
      } else if (hash === '/login' || hash === 'login') {
        setCurrentRoute('/login');
      } else if (hash === '/register' || hash === 'register') {
        setCurrentRoute('/register');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, loading, handleNavigate]);

  // The backend database is the source of truth for confirmed profiles.
  // Local storage is only a convenience cache, never a substitute for a successful save.
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setConfirmedProfile(null);
      storageService.clearConfirmedProfile();
      return () => { cancelled = true; };
    }

    apiService.listProfiles(0, 1)
      .then((profiles) => {
        if (cancelled) return;
        const latestProfile = profiles[0] ?? null;
        setConfirmedProfile(latestProfile);
        if (latestProfile) {
          storageService.saveConfirmedProfile(latestProfile);
          if (window.location.hash === '#/wizard') window.location.hash = '/profile';
        } else {
          storageService.clearConfirmedProfile();
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Could not load the saved profile from the backend:', error);
          setRedirectNotice('We could not load your saved profile. Please check that the backend database is configured and try again.');
        }
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  // Update preferred name in draft profile when user logs in
  useEffect(() => {
    if (user?.user_metadata?.preferred_name && !draftProfile.preferred_name) {
      setDraftProfile((prev) => ({
        ...prev,
        preferred_name: user.user_metadata.preferred_name || null,
      }));
    }
  }, [user, draftProfile.preferred_name]);

  const handleLoginSuccess = (_hasExistingProfile: boolean) => {
    setRedirectNotice(null);
    // The backend fetch in the auth effect decides whether an existing profile is present.
    handleNavigate(confirmedProfile ? '/profile' : '/wizard');
  };

  const handleRegisterSuccess = (needsEmailConfirmation: boolean) => {
    setRedirectNotice(null);
    if (!needsEmailConfirmation) {
      handleNavigate('/wizard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setRedirectNotice(null);
    handleNavigate('/');
  };

  const handleWizardComplete = (finalizedProfile: StudentProfileOut) => {
    setConfirmedProfile(finalizedProfile);
    setDraftProfile({
      education_stage: 'class10',
      preferred_name: finalizedProfile.preferred_name,
      country: finalizedProfile.country,
      region: finalizedProfile.region,
      curriculum: finalizedProfile.curriculum,
      academic_status: finalizedProfile.academic_status,
      preferred_language: finalizedProfile.preferred_language,
      subjects: finalizedProfile.subjects,
      overall_percentage: finalizedProfile.overall_percentage,
      overall_result_status: finalizedProfile.overall_result_status,
      interests: finalizedProfile.interests,
      strengths: finalizedProfile.strengths,
      interest_description: finalizedProfile.interest_description,
      annual_budget: finalizedProfile.annual_budget,
      funding_preferences: finalizedProfile.funding_preferences,
      preferred_destination: finalizedProfile.preferred_destination,
      priorities: finalizedProfile.priorities,
      career_certainty: finalizedProfile.career_certainty,
    });
    handleNavigate('/profile');
  };

  const handleStartJourney = () => {
    if (!isAuthenticated) {
      handleNavigate('/login', 'Sign in or create an account to begin your journey.');
      return;
    }
    if (confirmedProfile) {
      handleNavigate('/profile');
    } else {
      handleNavigate('/wizard');
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentRoute !== '/') {
      handleNavigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Initial loading state while Supabase checks stored session
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4FAFF] text-[#174F6B]">
        <div className="w-12 h-12 rounded-2xl bg-[#E7F4FC] text-[#398FC4] flex items-center justify-center shadow-2xs mb-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#398FC4]" />
        </div>
        <h2 className="font-serif-heading text-lg font-bold text-[#174F6B]">
          EduPath
        </h2>
        <p className="text-xs text-[#587482] mt-1">
          Loading student session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4FAFF] text-[#174F6B] selection:bg-[#E7F4FC] selection:text-[#174F6B]">
      {/* Global Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onScrollToSection={handleScrollToSection}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <LandingPage
            onStartJourney={handleStartJourney}
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
            hasCompletedProfile={Boolean(confirmedProfile)}
          />
        )}

        {currentRoute === '/login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            redirectNotice={redirectNotice}
          />
        )}

        {currentRoute === '/register' && (
          <RegisterPage
            onNavigate={handleNavigate}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {/* Protected Route: Student Profile Wizard */}
        {currentRoute === '/wizard' && (
          <ProtectedRoute onRedirectToLogin={(notice) => handleNavigate('/login', notice)}>
            <StudentProfileWizard
              initialProfile={draftProfile}
              onComplete={handleWizardComplete}
              onExit={() => handleNavigate('/')}
              existingProfileId={confirmedProfile?.id || null}
            />
          </ProtectedRoute>
        )}

        {/* Protected Route: Future Profile Summary */}
        {currentRoute === '/profile' && (
          <ProtectedRoute onRedirectToLogin={(notice) => handleNavigate('/login', notice)}>
            {confirmedProfile ? (
              <FutureProfilePage
                profile={confirmedProfile}
                onEdit={() => handleNavigate('/wizard')}
                onBackToHome={() => handleNavigate('/')}
              />
            ) : (
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h2 className="font-serif-heading text-2xl font-bold text-[#174F6B]">
                  No Future Profile Generated Yet
                </h2>
                <p className="text-sm text-[#587482] max-w-md">
                  Complete the 5-step Class 10 profile wizard to generate and view your personalized Future Profile summary.
                </p>
                <button
                  onClick={() => handleNavigate('/wizard')}
                  className="px-6 py-3 text-xs font-semibold text-white bg-[#398FC4] hover:bg-[#174F6B] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Start Class 10 Profile Wizard
                </button>
              </div>
            )}
          </ProtectedRoute>
        )}
      </main>

      {/* Footer rendered on Landing and Profile pages */}
      {(currentRoute === '/' || currentRoute === '/profile') && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EduPathApp />
    </AuthProvider>
  );
}

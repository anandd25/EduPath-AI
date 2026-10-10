/**
 * EduPath — Your Future, Taking Shape
 * Class 10 Educational Discovery Platform
 */

import React, { useState, useEffect } from 'react';
import { StudentProfileCreate, StudentProfileOut } from './types/studentProfile';
import { storageService } from './services/storageService';
import { authService, User } from './services/authService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentProfileWizard } from './pages/StudentProfileWizard';
import { FutureProfilePage } from './pages/FutureProfilePage';

type AppRoute = '/' | '/login' | '/register' | '/wizard' | '/profile';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash === '/login' || hash === 'login') return '/login';
    if (hash === '/register' || hash === 'register') return '/register';
    if (hash === '/wizard' || hash === 'wizard') return '/wizard';
    if (hash === '/profile' || hash === 'profile') return '/profile';
    return '/';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });

  const [draftProfile, setDraftProfile] = useState<StudentProfileCreate>(() => {
    return storageService.getDraftProfile();
  });

  const [confirmedProfile, setConfirmedProfile] = useState<StudentProfileOut | null>(() => {
    return storageService.getConfirmedProfile();
  });

  // Sync route changes to window hash for back button support
  useEffect(() => {
    window.location.hash = currentRoute;
  }, [currentRoute]);

  // Listen to hash changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === '/login' || hash === 'login') setCurrentRoute('/login');
      else if (hash === '/register' || hash === 'register') setCurrentRoute('/register');
      else if (hash === '/wizard' || hash === 'wizard') setCurrentRoute('/wizard');
      else if (hash === '/profile' || hash === 'profile') setCurrentRoute('/profile');
      else setCurrentRoute('/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: string) => {
    const normalized = route.startsWith('/') ? route : `/${route}`;
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
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.preferred_name && !draftProfile.preferred_name) {
      setDraftProfile((prev) => ({ ...prev, preferred_name: user.preferred_name || null }));
    }
    handleNavigate('/wizard');
  };

  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.preferred_name) {
      setDraftProfile((prev) => ({ ...prev, preferred_name: user.preferred_name || null }));
    }
    handleNavigate('/wizard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  const handleWizardComplete = (finalizedProfile: StudentProfileOut) => {
    setConfirmedProfile(finalizedProfile);
    // Sync the draft state
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FAF9] text-[#376E7D] selection:bg-[#C9E6F8] selection:text-[#376E7D]">
      {/* Global Header */}
      <Header
        currentRoute={currentRoute}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onScrollToSection={handleScrollToSection}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <LandingPage
            onStartJourney={() => handleNavigate('/wizard')}
            onNavigate={handleNavigate}
            isAuthenticated={Boolean(currentUser)}
          />
        )}

        {currentRoute === '/login' && (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            onContinueAsGuest={() => handleNavigate('/wizard')}
          />
        )}

        {currentRoute === '/register' && (
          <RegisterPage
            onNavigate={handleNavigate}
            onRegisterSuccess={handleRegisterSuccess}
            onContinueAsGuest={() => handleNavigate('/wizard')}
          />
        )}

        {currentRoute === '/wizard' && (
          <StudentProfileWizard
            initialProfile={draftProfile}
            onComplete={handleWizardComplete}
            onExit={() => handleNavigate('/')}
            existingProfileId={confirmedProfile?.id || null}
          />
        )}

        {currentRoute === '/profile' && confirmedProfile && (
          <FutureProfilePage
            profile={confirmedProfile}
            onEdit={() => handleNavigate('/wizard')}
            onBackToHome={() => handleNavigate('/')}
          />
        )}

        {/* If user navigates directly to /profile without having filled a profile yet */}
        {currentRoute === '/profile' && !confirmedProfile && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h2 className="font-serif-heading text-2xl font-bold text-[#376E7D]">
              No Future Profile Generated Yet
            </h2>
            <p className="text-sm text-[#5E8085] max-w-md">
              Complete the 5-step Class 10 profile wizard to generate and view your personalized Future Profile summary.
            </p>
            <button
              onClick={() => handleNavigate('/wizard')}
              className="px-6 py-3 text-xs font-semibold text-white bg-[#367BA8] hover:bg-[#2e688e] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Start Class 10 Profile Wizard
            </button>
          </div>
        )}
      </main>

      {/* Footer rendered on Landing and Profile pages */}
      {(currentRoute === '/' || currentRoute === '/profile') && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

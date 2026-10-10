/**
 * EduPath — Your Future Has Many Paths
 * Class 10 Educational Discovery Platform
 */

import React, { useState, useEffect } from 'react';
import { StudentProfileCreate, StudentProfileOut } from './types/studentProfile';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { StudentProfileWizard } from './pages/StudentProfileWizard';
import { FutureProfilePage } from './pages/FutureProfilePage';

type AppStage = 'landing' | 'wizard' | 'profile';

export default function App() {
  const [currentStage, setCurrentStage] = useState<AppStage>('landing');
  const [draftProfile, setDraftProfile] = useState<StudentProfileCreate>(() => {
    return storageService.getDraftProfile();
  });
  const [confirmedProfile, setConfirmedProfile] = useState<StudentProfileOut | null>(() => {
    return storageService.getConfirmedProfile();
  });

  useEffect(() => {
    const loadedDraft = storageService.getDraftProfile();
    const loadedConfirmed = storageService.getConfirmedProfile();
    setDraftProfile(loadedDraft);
    setConfirmedProfile(loadedConfirmed);
  }, []);

  const handleStartJourney = () => {
    setCurrentStage('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWizardComplete = (finalizedProfile: StudentProfileOut) => {
    setConfirmedProfile(finalizedProfile);
    // Also sync the draft state
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
    setCurrentStage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitWizard = () => {
    setCurrentStage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProfileFromSummary = () => {
    setCurrentStage('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFE] text-[#102A43] selection:bg-[#D8EAFE] selection:text-[#102A43]">
      {/* Global Header */}
      <Header
        currentStage={currentStage}
        onNavigate={(stage) => {
          setCurrentStage(stage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentStage === 'landing' && (
          <LandingPage onStartJourney={handleStartJourney} />
        )}

        {currentStage === 'wizard' && (
          <StudentProfileWizard
            initialProfile={draftProfile}
            onComplete={handleWizardComplete}
            onExit={handleExitWizard}
            existingProfileId={confirmedProfile?.id || null}
          />
        )}

        {currentStage === 'profile' && confirmedProfile && (
          <FutureProfilePage
            profile={confirmedProfile}
            onEdit={handleEditProfileFromSummary}
            onBackToHome={() => {
              setCurrentStage('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer on Landing & Profile pages */}
      {currentStage !== 'wizard' && (
        <Footer
          onNavigate={(stage) => {
            setCurrentStage(stage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

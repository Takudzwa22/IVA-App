// lib/components/OnboardingTour.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TourOverlay from './TourOverlay';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
}

const STUDENT_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="greeting"]',
    title: 'Welcome to IVA App!',
    description: 'This is your personal dashboard. You\'ll see a summary of your day here — classes, grades, and announcements.',
  },
  {
    targetSelector: '[data-tour="timetable"]',
    title: 'Your Timetable',
    description: 'Your daily schedule shows up here. Tap any class to see your marks for that subject.',
  },
  {
    targetSelector: '[data-tour="nav-grades"]',
    title: 'Grades & Assessments',
    description: 'Tap Grades in the navigation to see all your subjects, assessment marks, and averages.',
  },
  {
    targetSelector: '[data-tour="nav-news"]',
    title: 'Announcements',
    description: 'Check News for school announcements from teachers and admin. Stay in the loop!',
  },
  {
    targetSelector: '[data-tour="nav-settings"]',
    title: 'Settings & Profile',
    description: 'View your profile, contact support, or replay this tour anytime from Settings.',
  },
];

const TEACHER_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="greeting"]',
    title: 'Welcome to IVA App!',
    description: 'This is your teacher dashboard. You\'ll see your subjects and upcoming assessments here.',
  },
  {
    targetSelector: '[data-tour="subjects"]',
    title: 'Your Subjects',
    description: 'These are the subjects you teach. Tap one to view and manage its assessments.',
  },
  {
    targetSelector: '[data-tour="nav-assessments"]',
    title: 'Assessments & Gradebook',
    description: 'Manage assessments, enter marks, and upload CSV grade sheets from here.',
  },
  {
    targetSelector: '[data-tour="nav-news"]',
    title: 'Announcements',
    description: 'Create and publish announcements for specific grades, subjects, or the whole school.',
  },
  {
    targetSelector: '[data-tour="nav-settings"]',
    title: 'Settings & Profile',
    description: 'View your profile, contact support, or replay this tour anytime from Settings.',
  },
];

function getTourStorageKey(userId: string): string {
  return `iva_tour_seen_${userId}`;
}

interface OnboardingTourProps {
  userId: string;
  isTeacher: boolean;
  forceShow?: boolean;
  onComplete?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  userId,
  isTeacher,
  forceShow = false,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const steps = isTeacher ? TEACHER_STEPS : STUDENT_STEPS;

  useEffect(() => {
    if (forceShow) {
      setCurrentStep(0);
      setIsActive(true);
      return () => {
        // Dismiss tour if forceShow is toggled off (e.g. user navigates away)
        setIsActive(false);
      };
    }

    const key = getTourStorageKey(userId);
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      const timer = setTimeout(() => setIsActive(true), 600);
      return () => clearTimeout(timer);
    }
  }, [userId, forceShow]);

  const markComplete = useCallback(() => {
    const key = getTourStorageKey(userId);
    localStorage.setItem(key, new Date().toISOString());
    setIsActive(false);
    onComplete?.();
  }, [userId, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      markComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length, markComplete]);

  const handleSkip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  if (!isActive) return null;

  const step = steps[currentStep];

  return (
    <TourOverlay
      targetSelector={step.targetSelector}
      title={step.title}
      description={step.description}
      stepNumber={currentStep}
      totalSteps={steps.length}
      onNext={handleNext}
      onSkip={handleSkip}
      isLastStep={currentStep === steps.length - 1}
    />
  );
};

export default OnboardingTour;

'use client';

import React, { useState, useMemo } from 'react';
import { Screen, Student, Teacher, AssessmentWithMark, Assessment } from './types';
import { AuthProvider, DevStudentProvider } from './lib/hooks';
import { ResponsiveLayout } from './lib/components/ResponsiveLayout';
import type { NavItem } from './lib/components/Sidebar';
import DashboardScreen from './screens/DashboardScreen';
import AssessmentsScreen from './screens/AssessmentsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ProfileScreen from './screens/ProfileScreen';
import AnnouncementsScreen from './screens/AnnouncementsScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import LoginScreen from './screens/LoginScreen';
import MarksScreen from './screens/MarksScreen';
// Teacher screens
import TeacherDashboardScreen from './screens/TeacherDashboardScreen';
import TeacherAssessmentsScreen from './screens/TeacherAssessmentsScreen';
import TeacherGradebookScreen from './screens/TeacherGradebookScreen';

// Subject type for grades navigation
interface SubjectInfo {
  name: string;
  code: string;
  color: string;
  icon: string;
}

// Assessment with subject name for marks screen
type SelectedAssessment = AssessmentWithMark & { subjectName: string };

// Local auth state for email-only verification
interface LocalAuthState {
  isAuthenticated: boolean;
  student: Student | null;
  teacher: Teacher | null;
}

const AppContent: React.FC = () => {
  // Local auth state (email-only verification, no password)
  const [authState, setAuthState] = useState<LocalAuthState>({
    isAuthenticated: false,
    student: null,
    teacher: null,
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [selectedAssessment, setSelectedAssessment] = useState<SelectedAssessment | null>(null);

  // Teacher-specific state
  const [selectedTeacherSubject, setSelectedTeacherSubject] = useState<string | null>(null);
  const [selectedTeacherAssessment, setSelectedTeacherAssessment] = useState<Assessment | null>(null);

  const isTeacher = authState.teacher !== null;

  const handleSubjectSelect = (_subject: SubjectInfo) => {
    // Navigate directly to the real Grades page instead of the placeholder SubjectGradesScreen
    setCurrentScreen(Screen.GRADES);
  };

  // Handle assessment click - navigate to marks page
  const handleAssessmentSelect = (assessment: SelectedAssessment) => {
    setSelectedAssessment(assessment);
    setCurrentScreen(Screen.MARKS_DETAIL);
  };

  const handleBackFromMarks = () => {
    setSelectedAssessment(null);
    setCurrentScreen(Screen.GRADES);
  };

  // Teacher handlers
  const handleTeacherSubjectSelect = (subjectName: string) => {
    setSelectedTeacherSubject(subjectName);
    setCurrentScreen(Screen.TEACHER_ASSESSMENTS);
  };

  const handleTeacherBackFromAssessments = () => {
    setSelectedTeacherSubject(null);
    setCurrentScreen(Screen.TEACHER_DASHBOARD);
  };

  const handleTeacherGradeAssessment = (assessment: Assessment) => {
    setSelectedTeacherAssessment(assessment);
    setCurrentScreen(Screen.TEACHER_GRADEBOOK);
  };

  const handleTeacherBackFromGradebook = () => {
    setSelectedTeacherAssessment(null);
    setCurrentScreen(Screen.TEACHER_ASSESSMENTS);
  };

  const handleViewAnnouncements = () => setCurrentScreen(Screen.ANNOUNCEMENTS);

  const handleLogin = (userData: { student?: Student; teacher?: Teacher }) => {
    setAuthState({
      isAuthenticated: true,
      student: userData.student || null,
      teacher: userData.teacher || null,
    });
    // Set appropriate initial screen based on user type
    if (userData.teacher) {
      setCurrentScreen(Screen.TEACHER_DASHBOARD);
    } else {
      setCurrentScreen(Screen.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      student: null,
      teacher: null,
    });
    setCurrentScreen(Screen.DASHBOARD);
  };

  // Navigation items - different for teachers and students
  const navItems: NavItem[] = useMemo(() => {
    if (isTeacher) {
      // Teacher navigation
      return [
        {
          key: 'dashboard',
          label: 'Home',
          icon: 'dashboard',
          isActive: currentScreen === Screen.TEACHER_DASHBOARD,
          onClick: () => setCurrentScreen(Screen.TEACHER_DASHBOARD),
        },
        {
          key: 'assessments',
          label: 'Assessments',
          icon: 'assignment',
          isActive: currentScreen === Screen.TEACHER_ASSESSMENTS || currentScreen === Screen.TEACHER_GRADEBOOK,
          onClick: () => setCurrentScreen(Screen.TEACHER_ASSESSMENTS),
        },
        {
          key: 'attendance',
          label: 'Attendance',
          icon: 'fact_check',
          isActive: currentScreen === Screen.ATTENDANCE,
          onClick: () => setCurrentScreen(Screen.ATTENDANCE),
        },
        {
          key: 'announcements',
          label: 'News',
          icon: 'campaign',
          isActive: currentScreen === Screen.ANNOUNCEMENTS,
          onClick: () => setCurrentScreen(Screen.ANNOUNCEMENTS),
        },
        {
          key: 'profile',
          label: 'Settings',
          icon: 'settings',
          isActive: currentScreen === Screen.PROFILE,
          onClick: () => setCurrentScreen(Screen.PROFILE),
        },
      ];
    }

    // Student navigation
    return [
      {
        key: 'dashboard',
        label: 'Home',
        icon: 'dashboard',
        isActive: currentScreen === Screen.DASHBOARD,
        onClick: () => setCurrentScreen(Screen.DASHBOARD),
      },
      {
        key: 'schedule',
        label: 'Schedule',
        icon: 'calendar_month',
        isActive: currentScreen === Screen.SCHEDULE,
        onClick: () => setCurrentScreen(Screen.SCHEDULE),
      },
      {
        key: 'grades',
        label: 'Grades',
        icon: 'school',
        isActive: currentScreen === Screen.GRADES || currentScreen === Screen.SUBJECT_GRADES || currentScreen === Screen.MARKS_DETAIL,
        onClick: () => setCurrentScreen(Screen.GRADES),
      },
      {
        key: 'announcements',
        label: 'News',
        icon: 'campaign',
        isActive: currentScreen === Screen.ANNOUNCEMENTS,
        onClick: () => setCurrentScreen(Screen.ANNOUNCEMENTS),
      },
      {
        key: 'profile',
        label: 'Settings',
        icon: 'settings',
        isActive: currentScreen === Screen.PROFILE,
        onClick: () => setCurrentScreen(Screen.PROFILE),
      },
    ];
  }, [currentScreen, isTeacher]);

  // Compute nav active color from current screen (matches per-page color theme)
  const getNavActiveClass = (): string => {
    switch (currentScreen) {
      case Screen.SCHEDULE:
      case Screen.TEACHER_GRADEBOOK:
        return 'text-teal-500';
      case Screen.GRADES:
      case Screen.SUBJECT_GRADES:
      case Screen.MARKS_DETAIL:
      case Screen.TEACHER_ASSESSMENTS:
        return 'text-violet-600';
      case Screen.ANNOUNCEMENTS:
        return 'text-orange-500';
      case Screen.PROFILE:
        return 'text-amber-500';
      default:
        return 'text-primary';
    }
  };

  // Show login screen if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    // Teacher screens
    if (isTeacher) {
      switch (currentScreen) {
        case Screen.TEACHER_DASHBOARD:
          return (
            <TeacherDashboardScreen
              teacher={authState.teacher}
              onSubjectSelect={handleTeacherSubjectSelect}
            />
          );
        case Screen.TEACHER_ASSESSMENTS:
          return (
            <TeacherAssessmentsScreen
              teacher={authState.teacher}
              selectedSubject={selectedTeacherSubject}
              onBack={handleTeacherBackFromAssessments}
              onGradeAssessment={handleTeacherGradeAssessment}
            />
          );
        case Screen.TEACHER_GRADEBOOK:
          return (
            <TeacherGradebookScreen
              teacher={authState.teacher}
              assessment={selectedTeacherAssessment}
              onBack={handleTeacherBackFromGradebook}
            />
          );
        case Screen.PROFILE:
          return <ProfileScreen student={null} teacher={authState.teacher} onLogout={handleLogout} />;
        case Screen.ATTENDANCE:
          return <AttendanceScreen />;
        case Screen.ANNOUNCEMENTS:
          return (
            <AnnouncementsScreen
              isTeacher={true}
              teacher={authState.teacher}
            />
          );
        default:
          return (
            <TeacherDashboardScreen
              teacher={authState.teacher}
              onSubjectSelect={handleTeacherSubjectSelect}
            />
          );
      }
    }

    // Student screens
    switch (currentScreen) {
      case Screen.DASHBOARD:
        return (
          <DashboardScreen
            student={authState.student}
            onViewAnnouncements={handleViewAnnouncements}
            onViewGrades={() => setCurrentScreen(Screen.GRADES)}
            onAssessmentSelect={handleAssessmentSelect}
          />
        );
      case Screen.GRADES:
        return (
          <AssessmentsScreen
            student={authState.student}
            onAssessmentSelect={handleAssessmentSelect}
          />
        );
      case Screen.SUBJECT_GRADES:
        return (
          <AssessmentsScreen
            student={authState.student}
            onAssessmentSelect={handleAssessmentSelect}
          />
        );
      case Screen.MARKS_DETAIL:
        return (
          <MarksScreen
            assessment={selectedAssessment}
            onBack={handleBackFromMarks}
          />
        );
      case Screen.SCHEDULE:
        return (
          <ScheduleScreen
            student={authState.student}
            onSubjectSelect={handleSubjectSelect}
          />
        );
      case Screen.PROFILE:
        return <ProfileScreen student={authState.student} onLogout={handleLogout} />;
      case Screen.ANNOUNCEMENTS:
        return <AnnouncementsScreen student={authState.student} />;
      default:
        return <DashboardScreen student={authState.student} onViewAnnouncements={handleViewAnnouncements} />;
    }
  };

  return (
    <ResponsiveLayout
      navItems={navItems}
      navActiveClass={getNavActiveClass()}
    >
      {renderScreen()}
    </ResponsiveLayout>
  );
};

// Main App with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <DevStudentProvider>
        <AppContent />
      </DevStudentProvider>
    </AuthProvider>
  );
};

export default App;

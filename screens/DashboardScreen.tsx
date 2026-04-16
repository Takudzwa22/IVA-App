'use client';

import React, { useState, useMemo } from 'react';
import { useStudentTimetableAPI, useStudentAssessmentsAPI } from '../lib/hooks';
import type { Student, AssessmentWithMark } from '../types';
import type { DetailedScheduleItem } from '../lib/hooks/useTimetableAPI';

interface DashboardScreenProps {
  student: Student | null;
  onViewAnnouncements: () => void;
  onViewGrades?: () => void;
  onAssessmentSelect?: (assessment: AssessmentWithMark & { subjectName: string }) => void;
}

// Import shared subject configuration
import { getSubjectIcon, getSubjectGradient } from '../lib/subjects';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Subject Detail Modal Component
const SubjectDetailModal: React.FC<{
  subjectName: string | null;  // This is the timetable alias (e.g., "Afr 2")
  studentNumber: number;
  grade: number | string;
  onClose: () => void;
  onAssessmentSelect?: (assessment: AssessmentWithMark & { subjectName: string }) => void;
}> = ({ subjectName, studentNumber, grade, onClose, onAssessmentSelect }) => {
  const { subjects, isLoading } = useStudentAssessmentsAPI(studentNumber, grade);

  // Match timetable alias to canonical subject using timetableAliases array
  const subjectData = useMemo(() => {
    if (!subjectName) return null;
    const aliasLower = subjectName.toLowerCase();

    return subjects.find(s => {
      // Direct match with canonical name
      if (s.subjectName.toLowerCase() === aliasLower) return true;

      // Match against timetableAliases array
      const aliases: string[] = s.timetableAliases || [];
      return aliases.some((a: string) => a.toLowerCase() === aliasLower);
    });
  }, [subjects, subjectName]);

  if (!subjectName) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] min-h-[50vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${getSubjectGradient(subjectName)} rounded-xl flex items-center justify-center shadow-sm`}>
              <span className="material-symbols-outlined text-white">{getSubjectIcon(subjectName)}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{subjectName}</h2>
              <p className="text-sm text-gray-500">
                {subjectData ? `${subjectData.assessments.length} assessments` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !subjectData || subjectData.assessments.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">task</span>
              <p className="text-gray-500">No assessments for this subject yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjectData.assessments.map((assessment) => {
                const isPublished = assessment.mark?.isPublished;
                const percentage = isPublished && assessment.mark && assessment.max_marks
                  ? Math.round((assessment.mark.obtained! / assessment.max_marks) * 100)
                  : null;

                return (
                  <div
                    key={assessment.id}
                    className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      if (onAssessmentSelect && subjectData) {
                        onAssessmentSelect({ ...assessment, subjectName: subjectData.subjectName });
                        onClose();
                      }
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'
                      }`}>
                      <span className={`material-symbols-outlined ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                        {assessment.is_test ? 'quiz' : 'assignment'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{assessment.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(assessment.due_date).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {isPublished && percentage !== null ? (
                        <span className={`text-sm font-semibold ${percentage >= 80 ? 'text-green-600' :
                          percentage >= 60 ? 'text-blue-600' :
                            percentage >= 50 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                          {percentage}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">pending</span>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Upcoming Assignments Component
const UpcomingAssignments: React.FC<{
  studentNumber: number;
  grade: number | string;
  onAssessmentSelect?: (assessment: AssessmentWithMark & { subjectName: string }) => void;
}> = ({
  studentNumber,
  grade,
  onAssessmentSelect
}) => {
    const { subjects, isLoading } = useStudentAssessmentsAPI(studentNumber, grade);

    // Get all assessments sorted by due date, filtered to upcoming only
    const upcomingAssessments = useMemo(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const all = subjects.flatMap(s =>
        s.assessments.map(a => ({ ...a, subjectName: s.subjectName }))
      );

      return all
        .filter(a => new Date(a.due_date) >= today)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 4); // Show max 4
    }, [subjects]);

    // Helper to get days until due
    const getDaysUntil = (dueDate: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      return `${days} days`;
    };

    // Color based on urgency
    const getUrgencyStyle = (dueDate: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (days <= 1) return 'bg-red-100 text-red-600';
      if (days <= 3) return 'bg-amber-100 text-amber-600';
      return 'bg-blue-100 text-blue-600';
    };

    if (isLoading) {
      return (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Upcoming Assignments
          </h2>
          <div className="bg-white rounded-3xl p-4 shadow-lg space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (upcomingAssessments.length === 0) {
      return (
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            Upcoming Assignments
          </h2>
          <div className="bg-white rounded-3xl p-4 shadow-lg">
            <div className="bg-white/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-green-300">check_circle</span>
              </div>
              <p className="text-white font-medium text-base">All caught up!</p>
              <p className="text-sm text-white/60 mt-1">No upcoming assignments</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          Upcoming Assignments
        </h2>
        <div className="bg-white rounded-3xl p-4 shadow-lg space-y-2">
          {upcomingAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onAssessmentSelect?.(assessment)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${assessment.is_test ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                <span className={`material-symbols-outlined text-lg ${assessment.is_test ? 'text-orange-600' : 'text-blue-600'
                  }`}>
                  {assessment.is_test ? 'quiz' : 'assignment'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{assessment.title}</p>
                <p className="text-xs text-gray-500">{assessment.subjectName}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${getUrgencyStyle(assessment.due_date)}`}>
                {getDaysUntil(assessment.due_date)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

const DashboardScreen: React.FC<DashboardScreenProps> = ({ student, onViewAnnouncements, onViewGrades, onAssessmentSelect }) => {
  // Use student from props (passed from login)
  const studentNumber = student?.student_number ?? null;
  const studentGrade = student?.grade;

  // Fetch timetable data from API
  const { timetable, isLoading, error } = useStudentTimetableAPI(studentNumber, studentGrade);

  // Fetch assessments for cycle/term info + published marks count
  const { currentCycle, subjects: assessmentSubjects } = useStudentAssessmentsAPI(studentNumber ?? undefined, studentGrade);
  const publishedMarksCount = useMemo(() => {
    return (assessmentSubjects || []).reduce((count, s) =>
      count + s.assessments.filter(a => a.mark?.isPublished && a.mark.obtained !== null).length, 0);
  }, [assessmentSubjects]);

  // Persist banner dismissal in localStorage — reappears only when new marks are released
  const marksBannerKey = `marks-banner-dismissed-${studentNumber}`;
  const [dismissedMarksBanner, setDismissedMarksBanner] = useState(() => {
    if (typeof window === 'undefined' || !studentNumber) return false;
    const dismissed = localStorage.getItem(marksBannerKey);
    return dismissed === String(publishedMarksCount);
  });
  // Re-check when publishedMarksCount loads (it starts at 0)
  React.useEffect(() => {
    if (!studentNumber || publishedMarksCount === 0) return;
    const dismissed = localStorage.getItem(marksBannerKey);
    setDismissedMarksBanner(dismissed === String(publishedMarksCount));
  }, [publishedMarksCount, marksBannerKey, studentNumber]);

  const handleDismissMarksBanner = () => {
    setDismissedMarksBanner(true);
    localStorage.setItem(marksBannerKey, String(publishedMarksCount));
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pivotDate, setPivotDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  });

  // Get schedule for selected date
  const daySchedule = useMemo((): DetailedScheduleItem[] => {
    if (!timetable) return [];

    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (timetable.type === 'detailed') {
      return timetable.schedule[weekday] || [];
    } else {
      // Simple timetable - create items from subjects
      return timetable.subjects.map((subject, idx) => ({
        period_number: idx + 1,
        subject,
        start_time: '',
        end_time: '',
        code: '',
      }));
    }
  }, [timetable, selectedDate]);

  // Filter out empty periods and breaks
  const classes = useMemo(() => {
    return daySchedule.filter(period =>
      period.subject &&
      !['Free', 'Break', 'Lunch', 'Assembly', 'Cycle Test'].includes(period.subject)
    );
  }, [daySchedule]);

  // Generate 4 dates for the carousel
  const visibleDates = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const d = new Date(pivotDate);
      d.setDate(pivotDate.getDate() + i);
      return d;
    });
  }, [pivotDate]);

  const handlePrev = () => {
    const d = new Date(pivotDate);
    d.setDate(d.getDate() - 1);
    setPivotDate(d);
  };

  const handleNext = () => {
    const d = new Date(pivotDate);
    d.setDate(d.getDate() + 1);
    setPivotDate(d);
  };

  const formatDateLabel = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const num = date.getDate();
    return { day, num };
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;

  // Find the next upcoming class on today's schedule
  const nextClass = useMemo((): (DetailedScheduleItem & { minsUntil: number }) | null => {
    if (!isToday || !timetable || timetable.type !== 'detailed') return null;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const todayClasses = classes.filter(p => p.start_time);
    for (const p of todayClasses) {
      const [h, m] = p.start_time.split(':').map(Number);
      const startMins = h * 60 + m;
      if (startMins > nowMins) {
        return { ...p, minsUntil: startMins - nowMins };
      }
    }
    return null;
  }, [classes, isToday, timetable]);

  const displayName = student
    ? `${student.first_name} ${student.last_name}`
    : 'Student';

  // Compute "Cycle N · Week W" from currentCycle
  const cycleLabel = useMemo(() => {
    if (!currentCycle) return null;
    const start = new Date(currentCycle.start_date);
    const now = new Date();
    const week = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return `Cycle ${currentCycle.cycle} · Week ${week}`;
  }, [currentCycle]);

  // All unique subjects from timetable for search
  const allSubjects = useMemo(() => {
    if (!timetable) return [];
    if (timetable.type === 'detailed') {
      const seen = new Set<string>();
      return Object.values(timetable.schedule).flat()
        .filter(p => p.subject && !['Free', 'Break', 'Lunch', 'Assembly'].includes(p.subject))
        .filter(p => { if (seen.has(p.subject)) return false; seen.add(p.subject); return true; });
    }
    return timetable.subjects.map((subject, idx) => ({ subject, period_number: idx + 1, start_time: '', end_time: '', code: '' }));
  }, [timetable]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return allSubjects.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return allSubjects.filter(s => s.subject.toLowerCase().includes(q));
  }, [searchQuery, allSubjects]);

  return (
    <div className="flex flex-col h-full bg-indigo-900 overflow-hidden">
      {/* Dark Header Section */}
      <div className="pt-8 px-6 pb-8 shrink-0 relative z-0">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <header data-tour="greeting" className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 p-0.5 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {student ? student.first_name.charAt(0) : '?'}
              </div>
            </div>
            <div>
              <p className="text-sm text-indigo-200">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-white leading-tight">
                {isLoading ? (
                  <span className="inline-block w-32 h-6 bg-white/10 rounded animate-pulse" />
                ) : displayName}
              </h1>
              {cycleLabel && (
                <p className="text-[11px] text-indigo-300 font-medium mt-0.5">{cycleLabel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button
              onClick={onViewAnnouncements}
              className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors text-white relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 border border-indigo-900" />
            </button>
          </div>
        </header>

        {/* Quick Stats Row */}
        {!isLoading && student && (
          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Grade</p>
                <p className="text-xl font-bold text-white">{student.grade}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Classes</p>
                <p className="text-xl font-bold text-white">{isWeekend ? 0 : classes.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Date Selector (Dark Mode) */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 flex justify-between items-center border border-white/10 relative z-10">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>

          <div className="flex space-x-1">
            {visibleDates.map((date) => {
              const { day, num } = formatDateLabel(date);
              const isSelected = isSameDay(date, selectedDate);
              const isDateToday = isSameDay(date, new Date());
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(new Date(date))}
                  className={`flex flex-col items-center w-11 py-1.5 rounded-xl transition-all duration-300 ${isSelected
                    ? 'bg-white text-indigo-900 shadow-lg scale-105'
                    : isDateToday
                      ? 'bg-indigo-500/50 text-white ring-1 ring-white/30'
                      : 'text-white/60 hover:bg-white/10'
                    }`}
                >
                  <span className="text-[10px] font-bold uppercase">{day}</span>
                  <span className="text-base font-bold">{num}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - Purple Background */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 space-y-6 relative z-10">

        {/* Marks Released Banner */}
        {!dismissedMarksBanner && publishedMarksCount > 0 && (
          <button
            onClick={() => { handleDismissMarksBanner(); onViewGrades?.(); }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-lg flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-2xl">celebration</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Marks Released!</p>
              <p className="text-emerald-100 text-xs">{publishedMarksCount} mark{publishedMarksCount > 1 ? 's' : ''} available for this cycle</p>
            </div>
            <div className="flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5 shrink-0">
              <span className="text-white text-xs font-semibold">View</span>
              <span className="material-symbols-outlined text-white text-sm">arrow_forward</span>
            </div>
          </button>
        )}

        {/* Classes Section */}
        <section data-tour="timetable">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            {isToday ? "Today's Schedule" : `Schedule for ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}`}
          </h2>

          <div className="bg-white rounded-3xl p-4 shadow-lg">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-4 rounded-2xl flex items-center shadow-sm animate-pulse">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl mr-4" />
                    <div className="flex-grow">
                      <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
                      <div className="w-24 h-3 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isWeekend ? (
              <div className="p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-5xl text-indigo-300 mb-3 block">weekend</span>
                <p className="text-gray-800 font-semibold text-base">Enjoy your weekend!</p>
                <p className="text-sm text-gray-400 mt-1">No classes on {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}s</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">event_busy</span>
                <p className="text-gray-700 font-semibold text-base">No classes scheduled</p>
                <p className="text-sm text-gray-400 mt-1">
                  {timetable ? 'All periods are free today' : 'Timetable not yet assigned'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {classes.map((period, idx) => (
                  <div
                    key={`${period.period_number}-${idx}`}
                    onClick={() => setSelectedSubject(period.subject)}
                    className="bg-white p-4 rounded-2xl flex items-center hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${getSubjectGradient(period.subject)} rounded-xl flex items-center justify-center mr-4 shadow-sm group-hover:scale-105 transition-transform`}>
                      <span className="material-symbols-outlined text-white">{getSubjectIcon(period.subject)}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 text-base">{period.subject}</h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {formatTime(period.start_time)} - {formatTime(period.end_time)} • Period {period.period_number}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-indigo-500 text-sm">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next class chip — only on today's weekday when there's a future class */}
          {nextClass && (
            <div className="mt-3 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-400/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-indigo-200 text-base">arrow_forward</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Next class</p>
                <p className="text-sm font-bold text-white truncate">{nextClass.subject}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-indigo-200">
                  {nextClass.minsUntil < 60
                    ? `${nextClass.minsUntil}m`
                    : `${Math.floor(nextClass.minsUntil / 60)}h ${nextClass.minsUntil % 60}m`}
                </p>
                <p className="text-[10px] text-indigo-300">{formatTime(nextClass.start_time)}</p>
              </div>
            </div>
          )}
        </section>

        {/* Upcoming Assignments - Third */}
        {!isLoading && student && (
          <UpcomingAssignments
            studentNumber={student.student_number}
            grade={student.grade}
            onAssessmentSelect={onAssessmentSelect}
          />
        )}
      </div>

      {/* Subject Detail Modal */}
      {selectedSubject && student && (
        <SubjectDetailModal
          subjectName={selectedSubject}
          studentNumber={student.student_number}
          grade={student.grade}
          onClose={() => setSelectedSubject(null)}
          onAssessmentSelect={onAssessmentSelect}
        />
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4"
          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <span className="material-symbols-outlined text-gray-400">search</span>
              <input
                autoFocus
                type="text"
                placeholder="Search subjects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-base font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {searchResults.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">No subjects found</div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSubject(item.subject);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getSubjectGradient(item.subject)} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-white text-base">{getSubjectIcon(item.subject)}</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">{item.subject}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;

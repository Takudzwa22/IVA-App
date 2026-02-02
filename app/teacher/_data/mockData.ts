/**
 * Teacher Mock Data
 * 
 * Test data for the teacher dashboard.
 * In production, this would be fetched from Supabase.
 */

import type { TeacherClass, GradingTask, ScheduleItem, TabConfig } from '../_types';

// ============================================================================
// TEACHER CLASSES
// ============================================================================

export const teacherClasses: TeacherClass[] = [
    {
        id: 'math101',
        name: 'Advanced Algebra',
        code: 'MATH 101',
        students: 32,
        nextMeeting: 'Today · 09:00 - 10:30',
        room: 'Room 204',
        attendanceRate: 96,
        nextAssignment: 'Problem Set 6 (Fri)',
        gradingBacklog: 4,
    },
    {
        id: 'hist202',
        name: 'World History',
        code: 'HIST 202',
        students: 28,
        nextMeeting: 'Today · 10:45 - 12:15',
        room: 'Room 112',
        attendanceRate: 92,
        nextAssignment: 'Industrial Revolution Essay (Mon)',
        gradingBacklog: 9,
    },
    {
        id: 'chem105',
        name: 'Chemistry Lab',
        code: 'CHEM 105',
        students: 24,
        nextMeeting: 'Today · 13:00 - 14:30',
        room: 'Lab B',
        attendanceRate: 89,
        nextAssignment: 'Lab Report 4 (Wed)',
        gradingBacklog: 0,
    },
];

// ============================================================================
// GRADING QUEUE
// ============================================================================

export const gradingQueue: GradingTask[] = [
    {
        id: 'g1',
        classId: 'hist202',
        title: 'Industrial Revolution Essay',
        submissions: 9,
        dueDate: 'Due in 3 days',
        status: 'needs-grading',
    },
    {
        id: 'g2',
        classId: 'math101',
        title: 'Problem Set 6',
        submissions: 4,
        dueDate: 'Due Fri',
        status: 'in-progress',
    },
    {
        id: 'g3',
        classId: 'chem105',
        title: 'Lab Report 4',
        submissions: 0,
        dueDate: 'Due Wed',
        status: 'done',
    },
];

// ============================================================================
// TODAY'S SCHEDULE
// ============================================================================

export const scheduleToday: ScheduleItem[] = [
    {
        id: 's1',
        classId: 'math101',
        startsAt: '09:00',
        endsAt: '10:30',
        topic: 'Quadratic optimization + review',
    },
    {
        id: 's2',
        classId: 'hist202',
        startsAt: '10:45',
        endsAt: '12:15',
        topic: 'Industrial Revolution primary sources',
    },
    {
        id: 's3',
        classId: 'chem105',
        startsAt: '13:00',
        endsAt: '14:30',
        topic: 'Lab: Titration accuracy checks',
    },
];

// ============================================================================
// ATTENDANCE ALERTS
// ============================================================================

export const attendanceAlerts = [
    { student: 'Maria Chen', classId: 'hist202', note: '2 absences this week' },
    { student: 'Jordan Lee', classId: 'chem105', note: 'Unexcused absence today' },
    { student: 'Samir Patel', classId: 'math101', note: 'Late twice this week' },
];

// ============================================================================
// GRADEBOOK SUMMARY
// ============================================================================

export const gradebookSummary = [
    { classId: 'math101', avg: 88, median: 90, missing: 2 },
    { classId: 'hist202', avg: 84, median: 85, missing: 5 },
    { classId: 'chem105', avg: 86, median: 87, missing: 1 },
];

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

export const tabs: readonly TabConfig[] = [
    { key: 'home', label: 'Home', icon: 'dashboard' },
    { key: 'classes', label: 'Classes', icon: 'school' },
    { key: 'grades', label: 'Grades', icon: 'grading' },
    { key: 'profile', label: 'Profile', icon: 'settings' },
] as const;

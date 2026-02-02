/**
 * Teacher Types
 * 
 * Type definitions for the teacher dashboard feature.
 */

export interface TeacherClass {
    id: string;
    name: string;
    code: string;
    students: number;
    nextMeeting: string;
    room: string;
    attendanceRate: number;
    nextAssignment?: string;
    gradingBacklog?: number;
}

export interface GradingTask {
    id: string;
    classId: string;
    title: string;
    submissions: number;
    dueDate: string;
    status: 'needs-grading' | 'in-progress' | 'done';
}

export interface ScheduleItem {
    id: string;
    classId: string;
    startsAt: string;
    endsAt: string;
    topic: string;
}

export type TabKey = 'home' | 'classes' | 'grades' | 'profile';

export interface TabConfig {
    key: TabKey;
    label: string;
    icon: string;
}

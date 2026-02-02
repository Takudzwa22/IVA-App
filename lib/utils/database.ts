/**
 * Database Utilities
 * Helper functions for working with grade-specific tables
 */

// ============================================================================
// TABLE NAME RESOLUTION
// ============================================================================

/**
 * Get the student table name for a given grade
 * @param grade - Grade level (4-12 or 'british')
 * @returns Table name for the grade
 */
export function getStudentTable(grade: number | string): string {
    if (typeof grade === 'string') {
        const lowerGrade = grade.toLowerCase();
        if (lowerGrade.includes('british') || lowerGrade === 'brit') {
            return 'grade_british_students';
        }
        // Try to parse as number
        const parsed = parseInt(grade, 10);
        if (!isNaN(parsed)) {
            return `grade_${parsed}_students`;
        }
        return 'grade_british_students'; // Default for unknown string grades
    }
    return `grade_${grade}_students`;
}

/**
 * Get the timetable table name for a given grade
 * Only grades 10, 11, 12 have individual timetables
 * @param grade - Grade level
 * @returns Table name or null if grade doesn't have timetables
 */
export function getTimetableTable(grade: number | string): string | null {
    const numericGrade = typeof grade === 'number' ? grade : parseInt(grade, 10);

    if (numericGrade >= 10 && numericGrade <= 12) {
        return `timetables_${numericGrade}`;
    }
    return null; // Grades 4-9 and british don't have individual timetables
}

/**
 * Get the subjects table name for a given grade
 * @param grade - Grade level
 * @returns Table name for subjects
 */
export function getSubjectsTable(grade: number | string): string {
    const numericGrade = typeof grade === 'number' ? grade : parseInt(grade, 10);

    if (typeof grade === 'string' && grade.toLowerCase().includes('british')) {
        return 'Subjects_british';
    }

    if (numericGrade >= 4 && numericGrade <= 6) {
        return 'Subjects_4_5_6';
    }
    if (numericGrade >= 7 && numericGrade <= 9) {
        return 'Subjects_7_8_9';
    }
    if (numericGrade === 10) {
        return 'Subjects_10';
    }
    if (numericGrade === 11) {
        return 'Subjects_11';
    }
    if (numericGrade === 12) {
        return 'Subjects_12';
    }

    return 'Subjects_4_5_6'; // Default fallback
}

/**
 * Check if a grade has individual timetables
 * @param grade - Grade level
 * @returns true if grade has timetables
 */
export function hasTimetables(grade: number | string): boolean {
    const numericGrade = typeof grade === 'number' ? grade : parseInt(grade, 10);
    return numericGrade >= 10 && numericGrade <= 12;
}

// ============================================================================
// GRADE UTILITIES
// ============================================================================

/**
 * Parse grade from various formats to number (or 'british')
 * @param grade - Grade in various formats
 * @returns Normalized grade value
 */
export function parseGrade(grade: string | number | null | undefined): number | 'british' {
    if (grade === null || grade === undefined) {
        return 10; // Default to grade 10
    }

    if (typeof grade === 'number') {
        return grade;
    }

    const lower = grade.toLowerCase();
    if (lower.includes('british') || lower === 'brit') {
        return 'british';
    }

    const parsed = parseInt(grade, 10);
    return isNaN(parsed) ? 10 : parsed;
}

/**
 * Get all valid student grade levels
 */
export const STUDENT_GRADES = [4, 5, 7, 8, 9, 10, 11, 12, 'british'] as const;

/**
 * Get grades that have individual timetables
 */
export const TIMETABLE_GRADES = [10, 11, 12] as const;

// ============================================================================
// ATTENDANCE HELPERS
// ============================================================================

import type { Submission, AttendanceStatus } from '@/types';

/**
 * Get attendance status for a student from a submission
 * @param submission - The submission record
 * @param studentNumber - Student number to check
 * @returns Attendance status
 */
export function getAttendanceStatus(
    submission: Submission,
    studentNumber: number
): AttendanceStatus {
    if (submission.absent_students?.includes(studentNumber)) {
        return 'absent';
    }
    if (submission.late_students?.includes(studentNumber)) {
        return 'late';
    }
    if (submission.excused_students?.includes(studentNumber)) {
        return 'excused';
    }
    if (submission.blocked_students?.includes(studentNumber)) {
        return 'blocked';
    }
    if (submission.present_students?.includes(studentNumber)) {
        return 'present';
    }
    return 'unknown';
}

/**
 * Get attendance color for status
 */
export function getAttendanceColor(status: AttendanceStatus): string {
    switch (status) {
        case 'present':
            return 'text-green-500';
        case 'absent':
            return 'text-red-500';
        case 'late':
            return 'text-yellow-500';
        case 'excused':
            return 'text-blue-500';
        case 'blocked':
            return 'text-purple-500';
        default:
            return 'text-gray-500';
    }
}

/**
 * Get attendance icon for status
 */
export function getAttendanceIcon(status: AttendanceStatus): string {
    switch (status) {
        case 'present':
            return 'check_circle';
        case 'absent':
            return 'cancel';
        case 'late':
            return 'schedule';
        case 'excused':
            return 'event_busy';
        case 'blocked':
            return 'block';
        default:
            return 'help';
    }
}

'use client';

import { useState, useEffect } from 'react';
import type { Subject, Submission, AttendanceStatus } from '@/types';
import { isSupabaseConfigured } from '../supabase/client';
import { getSubjectsTable, getAttendanceStatus } from '../utils/database';

/**
 * Hook to fetch subjects for a given grade
 * Used for grades 4-9 and British that don't have individual timetables
 */
export function useSubjects(grade: number | string | null) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSubjects() {
            if (!grade) {
                setSubjects([]);
                setIsLoading(false);
                return;
            }

            if (!isSupabaseConfigured()) {
                console.warn('[Subjects] Supabase not configured');
                setSubjects([]);
                setIsLoading(false);
                return;
            }

            try {
                const { createClient } = await import('../supabase/client');
                const supabase = createClient();

                const tableName = getSubjectsTable(grade);

                const { data, error: fetchError } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('"Subject"');

                if (fetchError) {
                    console.warn('[Subjects] Error:', fetchError.message);
                    setSubjects([]);
                } else {
                    setSubjects(data || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSubjects();
    }, [grade]);

    return { subjects, isLoading, error };
}

/**
 * Hook to fetch attendance/submissions for a student
 * Queries the submissions table where the student number is in one of the status arrays
 */
export function useStudentAttendance(studentNumber: number | null) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAttendance() {
            if (!studentNumber) {
                setSubmissions([]);
                setIsLoading(false);
                return;
            }

            if (!isSupabaseConfigured()) {
                console.warn('[Attendance] Supabase not configured');
                setSubmissions([]);
                setIsLoading(false);
                return;
            }

            try {
                const { createClient } = await import('../supabase/client');
                const supabase = createClient();

                // Fetch submissions where this student is in the student_numbers array
                const { data, error: fetchError } = await supabase
                    .from('submissions')
                    .select('*')
                    .contains('student_numbers', [studentNumber])
                    .order('date', { ascending: false })
                    .limit(50);

                if (fetchError) {
                    console.warn('[Attendance] Error:', fetchError.message);
                    setSubmissions([]);
                } else {
                    setSubmissions(data || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
            } finally {
                setIsLoading(false);
            }
        }

        fetchAttendance();
    }, [studentNumber]);

    /**
     * Get this student's status in a specific submission
     */
    const getStatusForSubmission = (submission: Submission): AttendanceStatus => {
        if (!studentNumber) return 'unknown';
        return getAttendanceStatus(submission, studentNumber);
    };

    /**
     * Get attendance summary stats
     */
    const getAttendanceSummary = () => {
        if (!studentNumber) return { present: 0, absent: 0, late: 0, excused: 0, blocked: 0 };

        return submissions.reduce(
            (acc, sub) => {
                const status = getAttendanceStatus(sub, studentNumber);
                if (status !== 'unknown') {
                    acc[status]++;
                }
                return acc;
            },
            { present: 0, absent: 0, late: 0, excused: 0, blocked: 0 }
        );
    };

    return {
        submissions,
        isLoading,
        error,
        getStatusForSubmission,
        getAttendanceSummary,
    };
}

/**
 * Hook to fetch recent attendance issues (absences, lates) for a student
 */
export function useAttendanceAlerts(studentNumber: number | null, limit = 5) {
    const { submissions, isLoading, error } = useStudentAttendance(studentNumber);

    const alerts = submissions
        .filter((sub) => {
            if (!studentNumber) return false;
            const status = getAttendanceStatus(sub, studentNumber);
            return status === 'absent' || status === 'late' || status === 'blocked';
        })
        .slice(0, limit);

    return { alerts, isLoading, error };
}

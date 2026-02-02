/**
 * Hook to fetch student timetable data from the API
 * - Grades 10, 11, 12: Returns detailed schedule with times
 * - Grades 4-9 and British: Returns list of subjects
 */

import { useState, useEffect } from 'react';

export interface DetailedScheduleItem {
    period_number: number;
    subject: string;
    start_time: string;
    end_time: string;
    code: string;
}

export interface DetailedTimetable {
    type: 'detailed';
    grade: number;
    studentNumber: number;
    schedule: Record<string, DetailedScheduleItem[]>;
}

export interface SimpleTimetable {
    type: 'simple';
    grade: number | string;
    studentNumber: number;
    subjects: string[];
}

export type TimetableData = DetailedTimetable | SimpleTimetable | null;

interface UseTimetableResult {
    timetable: TimetableData;
    isLoading: boolean;
    error: string | null;
}

export function useStudentTimetableAPI(
    studentNumber: number | null,
    grade: number | string | null | undefined
): UseTimetableResult {
    const [timetable, setTimetable] = useState<TimetableData>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentNumber || grade === null || grade === undefined) {
            setTimetable(null);
            setIsLoading(false);
            return;
        }

        const fetchTimetable = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const gradeStr = typeof grade === 'string' ? grade : grade.toString();
                const response = await fetch(
                    `/api/student/timetable?studentNumber=${studentNumber}&grade=${encodeURIComponent(gradeStr)}`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch timetable');
                }

                const data = await response.json();
                setTimetable(data);
            } catch (err) {
                console.error('[useTimetable] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch timetable');
                setTimetable(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [studentNumber, grade]);

    return { timetable, isLoading, error };
}

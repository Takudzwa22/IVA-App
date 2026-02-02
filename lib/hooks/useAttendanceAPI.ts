/**
 * Hook to fetch student attendance data from the API
 */

import { useState, useEffect } from 'react';

export interface AttendanceRecord {
    date: string;
    subject: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'blocked' | 'cycle_test';
}

export interface AttendanceSummary {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    blocked: number;
    attendancePercentage: number;
}

interface UseAttendanceResult {
    records: AttendanceRecord[];
    summary: AttendanceSummary | null;
    isLoading: boolean;
    error: string | null;
}

export function useStudentAttendanceAPI(studentNumber: number | null): UseAttendanceResult {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentNumber) {
            setRecords([]);
            setSummary(null);
            setIsLoading(false);
            return;
        }

        const fetchAttendance = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/student/attendance?studentNumber=${studentNumber}`
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch attendance');
                }

                const data = await response.json();
                setRecords(data.records || []);
                setSummary(data.summary || null);
            } catch (err) {
                console.error('[useAttendance] Error:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
                setRecords([]);
                setSummary(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, [studentNumber]);

    return { records, summary, isLoading, error };
}

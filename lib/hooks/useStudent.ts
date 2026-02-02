'use client';

import { useState, useEffect } from 'react';
import type { Student, StudentTimetableView, TodaysScheduleItem, TimetableHeader } from '@/types';
import { DEV_MODE, DEV_STUDENT_NUMBER } from '../config';
import { isSupabaseConfigured } from '../supabase/client';
import { mockHeaders, mockTimetables } from '../__fixtures__/mockData';

/**
 * Hook to fetch and manage current student data
 */
export function useCurrentStudent() {
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudent() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        return;
      }

      // DEV MODE: Fetch student directly without auth
      if (DEV_MODE) {
        try {
          const { createClient } = await import('../supabase/client');
          const supabase = createClient();

          const { data, error: fetchError } = await supabase
            .from('students')
            .select('*')
            .eq('student_number', DEV_STUDENT_NUMBER)
            .single();

          if (fetchError) {
            console.warn('[Dev] Could not fetch student:', fetchError.message);
          } else {
            setStudent(data);
          }
        } catch (err) {
          console.error('[Dev] Error:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Production: Use auth
      try {
        const { createClient } = await import('../supabase/client');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStudent(null);
          setIsLoading(false);
          return;
        }

        const { data: link } = await supabase
          .from('user_links')
          .select('student_number')
          .eq('user_id', user.id)
          .single();

        if (!link?.student_number) {
          setStudent(null);
          setIsLoading(false);
          return;
        }

        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_number', link.student_number)
          .single();

        if (studentError) throw studentError;
        setStudent(studentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch student');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudent();
  }, []);

  return { student, isLoading, error };
}

/**
 * Hook to fetch student's timetable from grade-specific tables
 * Grade 10-12: Fetches from timetables_10, timetables_11, timetables_12
 * Grade 4-9/British: Returns null (these grades display subjects instead)
 */
export function useStudentTimetable(studentNumber: number | null, grade?: number | string) {
  const [timetable, setTimetable] = useState<StudentTimetableView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In DEV_MODE, use DEV_STUDENT_NUMBER if no studentNumber provided
  const effectiveStudentNumber = DEV_MODE && !studentNumber ? DEV_STUDENT_NUMBER : studentNumber;

  useEffect(() => {
    async function fetchTimetable() {
      if (!effectiveStudentNumber) {
        setTimetable(null);
        setIsLoading(false);
        return;
      }

      // Use mock data when Supabase not configured
      if (!isSupabaseConfigured()) {
        console.warn('[Timetable] Supabase not configured - using mock timetable');
        const mockTimetable = mockTimetables[effectiveStudentNumber] || null;
        setTimetable(mockTimetable);
        setIsLoading(false);
        return;
      }

      try {
        const { createClient } = await import('../supabase/client');
        const { getTimetableTable } = await import('../utils/database');
        const supabase = createClient();

        // Determine the correct timetable table based on grade
        const timetableTable = grade ? getTimetableTable(grade) : null;

        if (!timetableTable) {
          // Grades 4-9 and British don't have individual timetables
          console.log('[Timetable] Grade', grade, 'does not have individual timetables');
          setTimetable(null);
          setIsLoading(false);
          return;
        }

        // Fetch from grade-specific timetable table (e.g., timetables_10)
        const { data, error: fetchError } = await supabase
          .from(timetableTable)
          .select('*')
          .eq('"Student Num"', effectiveStudentNumber)
          .single();

        if (fetchError) {
          console.warn('[Timetable] Error:', fetchError.message);
          // Fall back to mock data
          const mockTimetable = mockTimetables[effectiveStudentNumber] || null;
          setTimetable(mockTimetable);
        } else if (data) {
          // Convert from database format to StudentTimetableView format
          const timetableView: StudentTimetableView = {
            student_number: data['Student Num'],
            first_name: data.Name || '',
            last_name: data.Surname || '',
            grade: data.grade,
            // Map all period columns
            A1: data.A1, B1: data.B1, C1: data.C1, D1: data.D1, E1: data.E1,
            F1: data.F1, G1: data.G1, H1: data.H1, I1: data.I1, J1: data.J1,
            A2: data.A2, B2: data.B2, C2: data.C2, D2: data.D2, E2: data.E2,
            F2: data.F2, G2: data.G2, H2: data.H2, I2: data.I2, J2: data.J2,
            A3: data.A3, B3: data.B3, C3: data.C3, D3: data.D3, E3: data.E3,
            F3: data.F3, G3: data.G3, H3: data.H3, I3: data.I3, J3: data.J3,
            A4: data.A4, B4: data.B4, C4: data.C4, D4: data.D4, E4: data.E4,
            F4: data.F4, G4: data.G4, H4: data.H4, I4: data.I4, J4: data.J4,
            A5: data.A5, B5: data.B5, C5: data.C5, D5: data.D5, E5: data.E5,
            F5: data.F5, G5: data.G5, H5: data.H5, I5: data.I5, J5: data.J5,
          };
          console.log('[Timetable] Loaded for student:', effectiveStudentNumber, 'from', timetableTable);
          setTimetable(timetableView);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch timetable');
        // Fall back to mock data
        const mockTimetable = mockTimetables[effectiveStudentNumber] || null;
        setTimetable(mockTimetable);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimetable();
  }, [effectiveStudentNumber, grade]);

  return { timetable, isLoading, error };
}

/**
 * Hook to fetch today's schedule for a student
 */
export function useTodaysSchedule(studentNumber: number | null) {
  const [schedule, setSchedule] = useState<TodaysScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveStudentNumber = DEV_MODE && !studentNumber ? DEV_STUDENT_NUMBER : studentNumber;

  useEffect(() => {
    async function fetchSchedule() {
      if (!effectiveStudentNumber) {
        setSchedule([]);
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured()) {
        setSchedule([]);
        setIsLoading(false);
        return;
      }

      try {
        const { createClient } = await import('../supabase/client');
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('todays_schedule_view')
          .select('*')
          .eq('student_number', effectiveStudentNumber)
          .order('period_number');

        if (fetchError) {
          console.warn('[Schedule] Error:', fetchError.message);
          setSchedule([]);
        } else {
          setSchedule(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSchedule();
  }, [effectiveStudentNumber]);

  return { schedule, isLoading, error };
}

/**
 * Hook to fetch timetable headers (period times)
 */
export function useTimetableHeaders() {
  const [headers, setHeaders] = useState<TimetableHeader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeaders() {
      if (!isSupabaseConfigured()) {
        console.warn('[Headers] Supabase not configured - using mock headers');
        setHeaders(mockHeaders);
        setIsLoading(false);
        return;
      }

      try {
        const { createClient } = await import('../supabase/client');
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from('timetable_headers')
          .select('*')
          .order('period_number');

        if (fetchError) {
          console.warn('[Headers] Error, using mock:', fetchError.message);
          setHeaders(mockHeaders);
        } else {
          console.log('[Headers] Loaded', data?.length, 'entries');
          setHeaders(data || mockHeaders);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch headers');
        setHeaders(mockHeaders);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHeaders();
  }, []);

  return { headers, isLoading, error };
}

/**
 * Get schedule for a specific day from timetable
 */
export function getDaySchedule(
  timetable: StudentTimetableView | null,
  headers: TimetableHeader[],
  weekday: string
): TodaysScheduleItem[] {
  if (!timetable) return [];

  const dayHeaders = headers.filter(h => h.weekday === weekday);

  return dayHeaders.map(header => {
    const periodCode = header.code as keyof StudentTimetableView;
    return {
      student_number: timetable.student_number,
      first_name: timetable.first_name,
      last_name: timetable.last_name,
      grade: timetable.grade,
      period_number: header.period_number,
      start_time: header.start_time,
      end_time: header.end_time,
      subject: timetable[periodCode] as string | null,
    };
  });
}

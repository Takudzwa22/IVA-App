/**
 * Supabase Client Configuration
 * 
 * SECURITY NOTES:
 * - createClient() uses anon key - safe for browser, RLS enforced
 * - Never import server.ts in client components
 */

import { createBrowserClient } from '@supabase/ssr';

// Environment variables (may be undefined in development)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Browser client - uses anon key with RLS
 * Safe to use in client components
 * 
 * @throws Error if Supabase is not configured
 */
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Type definitions for database tables
 * These match the schema in 001_initial_schema.sql
 */
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Student {
  student_number: number;
  first_name: string;
  last_name: string;
  email: string;
  grade: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface Cohort {
  id: string;
  grade: number;
  name: string;
  academic_year: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Timetable {
  id: string;
  grade: number;
  academic_year: string;
  cohort_id: string | null;
  student_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  // Monday
  A1: string | null; B1: string | null; C1: string | null;
  D1: string | null; E1: string | null; F1: string | null;
  G1: string | null; H1: string | null; I1: string | null;
  // Tuesday
  A2: string | null; B2: string | null; C2: string | null;
  D2: string | null; E2: string | null; F2: string | null;
  G2: string | null; H2: string | null; I2: string | null;
  // Wednesday
  A3: string | null; B3: string | null; C3: string | null;
  D3: string | null; E3: string | null; F3: string | null;
  G3: string | null; H3: string | null; I3: string | null;
  // Thursday
  A4: string | null; B4: string | null; C4: string | null;
  D4: string | null; E4: string | null; F4: string | null;
  G4: string | null; H4: string | null; I4: string | null;
  // Friday
  A5: string | null; B5: string | null; C5: string | null;
  D5: string | null; E5: string | null; F5: string | null;
  G5: string | null; H5: string | null; I5: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimetableHeader {
  code: string;
  weekday: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

// View types
export interface StudentTimetableView extends Student {
  timetable_id: string;
  academic_year: string;
  ownership_type: 'cohort' | 'personal';
  cohort_name: string | null;
  // Period columns
  A1: string | null; B1: string | null; C1: string | null;
  D1: string | null; E1: string | null; F1: string | null;
  G1: string | null; H1: string | null; I1: string | null;
  A2: string | null; B2: string | null; C2: string | null;
  D2: string | null; E2: string | null; F2: string | null;
  G2: string | null; H2: string | null; I2: string | null;
  A3: string | null; B3: string | null; C3: string | null;
  D3: string | null; E3: string | null; F3: string | null;
  G3: string | null; H3: string | null; I3: string | null;
  A4: string | null; B4: string | null; C4: string | null;
  D4: string | null; E4: string | null; F4: string | null;
  G4: string | null; H4: string | null; I4: string | null;
  A5: string | null; B5: string | null; C5: string | null;
  D5: string | null; E5: string | null; F5: string | null;
  G5: string | null; H5: string | null; I5: string | null;
}

export interface TodaysScheduleView {
  student_number: number;
  first_name: string;
  last_name: string;
  grade: number;
  period_number: number;
  start_time: string;
  end_time: string;
  subject: string | null;
}

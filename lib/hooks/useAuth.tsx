'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { User, Student, Teacher, AuthState, GradeStudent, gradeStudentToStudent } from '@/types';
import { STUDENT_GRADES } from '../utils/database';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

const defaultState: AuthState = {
  user: null,
  student: null,
  teacher: null,
  isLoading: false,
  isAuthenticated: false,
};

// ============================================================================
// DEV MODE: Use one of the seeded test students
// Change this to test different students:
//   100001 = Hadassah Adams
//   100002 = Ella Van Der Merwe  
//   100003 = Hlalumi Qina
// ============================================================================
const DEV_STUDENT_NUMBER = 100001;
const DEV_STUDENT_GRADE = 10;

// Mock student for development when Supabase is not configured
const mockStudent: Student = {
  student_number: DEV_STUDENT_NUMBER,
  first_name: 'Hadassah',
  last_name: 'Adams',
  email: `${DEV_STUDENT_NUMBER}@ivaschool.online`,
  grade: DEV_STUDENT_GRADE,
  active: true,
  user_role: 'student',
};

const mockUser: User = {
  id: 'dev-user-id',
  email: `${DEV_STUDENT_NUMBER}@ivaschool.online`,
  role: 'student',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthState>(defaultState);

/**
 * Helper to find a student by number across all grade tables
 * Returns both the student data and their grade
 */
async function findStudentByNumber(
  supabase: ReturnType<typeof import('../supabase/client').createClient>,
  studentNumber: number
): Promise<Student | null> {
  // Try each grade table until we find the student
  for (const grade of STUDENT_GRADES) {
    const tableName = grade === 'british'
      ? 'grade_british_students'
      : `grade_${grade}_students`;

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('"Number"', studentNumber)
      .single();

    if (!error && data) {
      // Convert GradeStudent to Student format
      const gradeStudent = data as GradeStudent;
      return {
        student_number: gradeStudent.Number,
        first_name: gradeStudent.Name || '',
        last_name: gradeStudent.Surname || '',
        full_name: gradeStudent['Full Name'] || undefined,
        grade: gradeStudent.Grade,
        mother: gradeStudent.Mother,
        mother_cell: gradeStudent['Mother Cell'],
        father: gradeStudent.Father,
        father_cell: gradeStudent['Father Cell'],
        user_role: gradeStudent.user_role || 'student',
      };
    }
  }

  return null;
}

/**
 * Helper to find a teacher by email
 */
async function findTeacherByEmail(
  supabase: ReturnType<typeof import('../supabase/client').createClient>,
  email: string
): Promise<Teacher | null> {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('"Email"', email)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Teacher;
}

/**
 * Auth Provider component
 * In development without Supabase config, provides mock data
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...defaultState,
    isLoading: true,
  });

  useEffect(() => {
    // If Supabase is not configured, use mock data for development
    if (!isSupabaseConfigured()) {
      console.warn('[Auth] Supabase not configured - using mock data for development');
      setState({
        user: mockUser,
        student: mockStudent,
        teacher: null,
        isLoading: false,
        isAuthenticated: true, // Pretend we're authenticated in dev
      });
      return;
    }

    // Supabase is configured - fetch real data
    async function fetchUserData() {
      try {
        // Dynamic import to avoid errors when Supabase is not configured
        const { createClient } = await import('../supabase/client');
        const supabase = createClient();

        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          setState({
            user: null,
            student: null,
            teacher: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // Fetch user record
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!userData) {
          setState({
            user: null,
            student: null,
            teacher: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        // Fetch user link to get student number or teacher email
        const { data: linkData } = await supabase
          .from('user_links')
          .select('student_number, teacher_email')
          .eq('user_id', authUser.id)
          .single();

        let studentData: Student | null = null;
        let teacherData: Teacher | null = null;

        // Resolve student from grade-specific table
        if (linkData?.student_number) {
          studentData = await findStudentByNumber(supabase, linkData.student_number);
          if (studentData) {
            console.log('[Auth] Found student:', studentData.first_name, studentData.last_name, 'Grade:', studentData.grade);
          }
        }

        // Resolve teacher by email
        if (linkData?.teacher_email) {
          teacherData = await findTeacherByEmail(supabase, linkData.teacher_email);
          if (teacherData) {
            console.log('[Auth] Found teacher:', teacherData.Name, teacherData.Surname);
          }
        }

        setState({
          user: userData,
          student: studentData,
          teacher: teacherData,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Auth error:', error);
        setState({
          user: null,
          student: null,
          teacher: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }

    fetchUserData();

    // Listen for auth changes (only if Supabase is configured)
    let unsubscribe: (() => void) | undefined;

    import('../supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        fetchUserData();
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      console.warn('[Auth] Supabase not configured - sign out is a no-op');
      return;
    }

    const { createClient } = await import('../supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
  };
  return signOut;
}


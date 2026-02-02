'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isSupabaseConfigured } from '../supabase/client';
import { DEV_MODE, DEV_STUDENTS } from '../config';
import type { Student } from '@/types';

// Re-export for backward compatibility
export { DEV_MODE, DEV_STUDENTS } from '../config';

interface DevStudentContextType {
  selectedStudentNumber: number;
  setSelectedStudentNumber: (num: number) => void;
  student: Student | null;
  isLoading: boolean;
}

const DevStudentContext = createContext<DevStudentContextType>({
  selectedStudentNumber: DEV_STUDENTS[0].student_number,
  setSelectedStudentNumber: () => { },
  student: null,
  isLoading: true,
});

function createMockStudent(studentNumber: number): Student | null {
  const mockStudent = DEV_STUDENTS.find(s => s.student_number === studentNumber);
  if (!mockStudent) return null;

  return {
    student_number: mockStudent.student_number,
    first_name: mockStudent.first_name,
    last_name: mockStudent.last_name,
    email: `${mockStudent.student_number}@ivaschool.online`,
    grade: 10,
    active: true,
    user_role: 'student',
  };
}

export function DevStudentProvider({ children }: { children: ReactNode }) {
  const [selectedStudentNumber, setSelectedStudentNumber] = useState<number>(DEV_STUDENTS[0].student_number);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      setIsLoading(true);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn('[DevStudent] Supabase not configured - using mock data');
        setStudent(createMockStudent(selectedStudentNumber));
        setIsLoading(false);
        return;
      }

      try {
        const { createClient } = await import('../supabase/client');
        const supabase = createClient();

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('student_number', selectedStudentNumber)
          .single();

        if (error) {
          console.warn('[DevStudent] Error fetching:', error.message);
          // Fallback to mock data
          setStudent(createMockStudent(selectedStudentNumber));
        } else {
          setStudent(data);
        }
      } catch (err) {
        console.error('[DevStudent] Error:', err);
        // Fallback to mock data
        setStudent(createMockStudent(selectedStudentNumber));
      } finally {
        setIsLoading(false);
      }
    }

    if (DEV_MODE) {
      fetchStudent();
    }
  }, [selectedStudentNumber]);

  return (
    <DevStudentContext.Provider value={{
      selectedStudentNumber,
      setSelectedStudentNumber,
      student,
      isLoading
    }}>
      {children}
    </DevStudentContext.Provider>
  );
}

export function useDevStudent() {
  return useContext(DevStudentContext);
}

/**
 * Dev Mode Student Switcher Component
 */
export function DevStudentSwitcher() {
  const { selectedStudentNumber, setSelectedStudentNumber, isLoading } = useDevStudent();
  const [isOpen, setIsOpen] = useState(false);

  if (!DEV_MODE) return null;

  const currentStudent = DEV_STUDENTS.find(s => s.student_number === selectedStudentNumber);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold hover:bg-amber-200 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">bug_report</span>
        <span>DEV: {currentStudent?.first_name || 'Select'}</span>
        <span className="material-symbols-outlined text-sm">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="p-2 bg-amber-50 border-b border-amber-100">
              <p className="text-[10px] text-amber-600 font-bold uppercase">Dev Mode - Switch Student</p>
            </div>
            <div className="py-1">
              {DEV_STUDENTS.map((student) => (
                <button
                  key={student.student_number}
                  onClick={() => {
                    setSelectedStudentNumber(student.student_number);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${selectedStudentNumber === student.student_number ? 'bg-primary/5' : ''
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${selectedStudentNumber === student.student_number
                    ? 'bg-primary'
                    : 'bg-gray-300'
                    }`}>
                    {student.first_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      #{student.student_number}
                    </p>
                  </div>
                  {selectedStudentNumber === student.student_number && (
                    <span className="material-symbols-outlined text-primary ml-auto">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * IVA App Type Definitions
 * Aligned with database schema
 */

// ============================================================================
// NAVIGATION
// ============================================================================

export enum Screen {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  GRADES = 'grades',
  SCHEDULE = 'schedule',
  PROFILE = 'profile',
  CLASS_DETAILS = 'class_details',
  ASSIGNMENT_DETAILS = 'assignment_details',
  AI_ASSISTANT = 'ai_assistant',
  SUBJECT_GRADES = 'subject_grades',
  ANNOUNCEMENTS = 'announcements',
  MARKS_DETAIL = 'marks_detail',
  // Teacher screens
  TEACHER_DASHBOARD = 'teacher_dashboard',
  TEACHER_ASSESSMENTS = 'teacher_assessments',
  TEACHER_GRADEBOOK = 'teacher_gradebook'
}

// ============================================================================
// DATABASE ENTITIES (matching actual Supabase schema)
// ============================================================================

export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * User record from auth system
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

/**
 * Student record matching grade_X_students tables
 * Primary Key: Number (student number)
 * Tables: grade_4_students, grade_5_students, ... grade_12_students, grade_british_students
 */
export interface GradeStudent {
  Number: number;                    // Primary key (student number)
  Surname: string | null;
  Name: string | null;               // First name
  'Full Name': string | null;
  Mother: string | null;
  'Mother Cell': string | null;
  Father: string | null;
  'Father Cell': string | null;
  Grade: number | string;            // numeric for most, text for british
  user_role: UserRole;
}

// Alias for backward compatibility with existing code
export interface Student {
  student_number: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email?: string;
  grade: number | string;
  active?: boolean;
  mother?: string | null;
  mother_cell?: string | null;
  father?: string | null;
  father_cell?: string | null;
  user_role: UserRole;
}

/**
 * Helper to convert GradeStudent to Student format
 */
export function gradeStudentToStudent(gs: GradeStudent): Student {
  return {
    student_number: gs.Number,
    first_name: gs.Name || '',
    last_name: gs.Surname || '',
    full_name: gs['Full Name'] || undefined,
    grade: gs.Grade,
    mother: gs.Mother,
    mother_cell: gs['Mother Cell'],
    father: gs.Father,
    father_cell: gs['Father Cell'],
    user_role: gs.user_role,
  };
}

/**
 * Teacher record matching teachers table
 * Primary Key: Email
 */
export interface Teacher {
  Email: string;                     // Primary key
  Name: string | null;               // First name
  Surname: string | null;
  'Full name': string | null;
  user_role: string | null;
}

/**
 * Subject record matching Subjects_X tables
 * Tables: Subjects_4_5_6, Subjects_7_8_9, Subjects_10, Subjects_11, Subjects_12, Subjects_british
 */
export interface Subject {
  id: string;
  Subject: string;
  timetable_aliases?: string[];      // Only in Subjects_10, 11, 12
}

/**
 * Submission/Attendance record matching submissions table
 * Tracks attendance for a class session
 */
export interface Submission {
  id: number;
  created_at: string;
  date: string;
  grade: string;
  subject_id: string;
  subject_name: string | null;
  submitted_by_email: string;        // FK to teachers.Email
  submitted_by_name: string | null;
  student_numbers: number[];         // All students in class
  student_names: string[];
  present_students: number[];
  absent_students: number[];
  late_students: number[];
  excused_students: number[];
  blocked_students: number[];
  notes: string | null;
}

/**
 * Attendance status derived from Submission for a specific student
 */
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'blocked' | 'unknown';

/**
 * Student timetable matching timetables_10, timetables_11, timetables_12 tables
 * Primary Key: "Student Num"
 */
export interface StudentTimetable {
  'Student Num': number;             // Primary key, FK to student Number
  grade: number;
  Name: string | null;
  Surname: string | null;
  // Period columns (10 periods × 5 days = 50 slots)
  // Monday (day 1)
  A1: string | null; B1: string | null; C1: string | null; D1: string | null; E1: string | null;
  F1: string | null; G1: string | null; H1: string | null; I1: string | null; J1: string | null;
  // Tuesday (day 2)
  A2: string | null; B2: string | null; C2: string | null; D2: string | null; E2: string | null;
  F2: string | null; G2: string | null; H2: string | null; I2: string | null; J2: string | null;
  // Wednesday (day 3)
  A3: string | null; B3: string | null; C3: string | null; D3: string | null; E3: string | null;
  F3: string | null; G3: string | null; H3: string | null; I3: string | null; J3: string | null;
  // Thursday (day 4)
  A4: string | null; B4: string | null; C4: string | null; D4: string | null; E4: string | null;
  F4: string | null; G4: string | null; H4: string | null; I4: string | null; J4: string | null;
  // Friday (day 5)
  A5: string | null; B5: string | null; C5: string | null; D5: string | null; E5: string | null;
  F5: string | null; G5: string | null; H5: string | null; I5: string | null; J5: string | null;
}

// Extended period codes (now includes J column)
export type PeriodCode =
  | 'A1' | 'B1' | 'C1' | 'D1' | 'E1' | 'F1' | 'G1' | 'H1' | 'I1' | 'J1'
  | 'A2' | 'B2' | 'C2' | 'D2' | 'E2' | 'F2' | 'G2' | 'H2' | 'I2' | 'J2'
  | 'A3' | 'B3' | 'C3' | 'D3' | 'E3' | 'F3' | 'G3' | 'H3' | 'I3' | 'J3'
  | 'A4' | 'B4' | 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'H4' | 'I4' | 'J4'
  | 'A5' | 'B5' | 'C5' | 'D5' | 'E5' | 'F5' | 'G5' | 'H5' | 'I5' | 'J5';

/**
 * Timetable header record matching timetable_headers table
 */
export interface TimetableHeader {
  code: string;                      // Primary key (e.g., "A1", "B2")
  weekday: string;
  period_number: number;
  start_time: string;
  end_time: string;
}

// Legacy interfaces kept for backward compatibility
export interface Cohort {
  id: string;
  grade: number;
  name: string;
  academic_year: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassGroup {
  id: string;
  subject_id: string;
  cohort_id: string | null;
  label: string;
  section: string;
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
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VIEW TYPES (from helper views)
// ============================================================================

export interface StudentTimetableView {
  student_number: number;
  first_name: string;
  last_name: string;
  grade: number | string;
  // Period columns (includes J column to match timetables_10/11/12)
  A1: string | null; B1: string | null; C1: string | null; D1: string | null; E1: string | null;
  F1: string | null; G1: string | null; H1: string | null; I1: string | null; J1: string | null;
  A2: string | null; B2: string | null; C2: string | null; D2: string | null; E2: string | null;
  F2: string | null; G2: string | null; H2: string | null; I2: string | null; J2: string | null;
  A3: string | null; B3: string | null; C3: string | null; D3: string | null; E3: string | null;
  F3: string | null; G3: string | null; H3: string | null; I3: string | null; J3: string | null;
  A4: string | null; B4: string | null; C4: string | null; D4: string | null; E4: string | null;
  F4: string | null; G4: string | null; H4: string | null; I4: string | null; J4: string | null;
  A5: string | null; B5: string | null; C5: string | null; D5: string | null; E5: string | null;
  F5: string | null; G5: string | null; H5: string | null; I5: string | null; J5: string | null;
}

export interface TodaysScheduleItem {
  student_number: number;
  first_name: string;
  last_name: string;
  grade: number | string;
  period_number: number;
  start_time: string;
  end_time: string;
  subject: string | null;
}

export interface TeacherClassView {
  teacher_id: string;
  first_name: string;
  last_name: string;
  teacher_email: string;
  class_group_id: string;
  class_label: string;
  section: string;
  subject_code: string;
  subject_name: string;
  cohort_name: string | null;
  grade: number | null;
  academic_year: string | null;
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface SchedulePeriod {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string | null;
  isBreak?: boolean;
  isCurrent?: boolean;
}

export interface DaySchedule {
  weekday: string;
  periods: SchedulePeriod[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'general' | 'academic' | 'sports' | 'events';
  priority?: 'high' | 'normal' | 'low';
  target_grades?: number[]; // e.g., [8, 9, 10] or empty for all grades
}

// ============================================================================
// ASSESSMENT TYPES (matching assessment tables)
// ============================================================================

/**
 * Assessment cycle record matching assessment_cycles table
 */
export interface AssessmentCycle {
  id: string;
  cycle: number;
  grade: number;
  year: number;
  start_date: string;
  end_date: string;
}

/**
 * Assessment record matching assessments table
 */
export interface Assessment {
  id: string;
  subject_name: string;
  teacher_email: string | null;
  title: string;
  due_date: string;
  max_marks: number | null;
  weighting: number | null;
  is_test: boolean;
  cycle: number;
}

/**
 * Assessment mark record matching assessment_marks table
 */
export interface AssessmentMark {
  id: string;
  assessment_id: string;
  student_num: number;
  mark_obtained: number | null;
  teacher_comments: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Student enrolled subjects from view
 */
export interface StudentEnrolledSubjects {
  student_num: number;
  subject_names: string[];
  subject_ids: string[];
}

/**
 * Combined assessment with mark for UI display
 */
export interface AssessmentWithMark extends Assessment {
  mark: {
    obtained: number | null;
    isPublished: boolean;
    comments: string | null;
  } | null;
}

/**
 * Subject with its assessments for UI display
 */
export interface SubjectAssessments {
  subjectName: string;
  subjectId: string;
  timetableAliases: string[];
  assessments: AssessmentWithMark[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  period: string;
  subject: string;
  status: 'absent' | 'late' | 'excused';
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================

export interface AuthState {
  user: User | null;
  student: Student | null;
  teacher: Teacher | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hooks barrel file
 */

export { useAuth, AuthProvider, useSignOut } from './useAuth';
export {
  useCurrentStudent,
  useStudentTimetable,
  useTodaysSchedule,
  useTimetableHeaders,
  getDaySchedule
} from './useStudent';
export {
  useDevStudent,
  DevStudentProvider,
  DevStudentSwitcher,
  DEV_MODE,
  DEV_STUDENTS
} from './useDevStudent';
export {
  useSubjects,
  useStudentAttendance,
  useAttendanceAlerts
} from './useSubmissions';
export {
  useStudentTimetableAPI,
  type DetailedScheduleItem,
  type DetailedTimetable,
  type SimpleTimetable,
  type TimetableData
} from './useTimetableAPI';
export {
  useStudentAttendanceAPI,
  type AttendanceRecord,
  type AttendanceSummary
} from './useAttendanceAPI';
export { useStudentAssessmentsAPI } from './useAssessmentsAPI';

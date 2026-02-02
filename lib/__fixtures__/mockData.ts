/**
 * Mock Data for Development
 * 
 * Test data for development mode when Supabase is not configured.
 * Matches seed data from 005_seed_test_data.sql.
 */

import type { StudentTimetableView, TimetableHeader, Announcement, AttendanceRecord } from '@/types';

// ============================================================================
// TIMETABLE HEADERS (Period times for each day)
// ============================================================================

export const mockHeaders: TimetableHeader[] = [
    // Monday
    { code: 'A1', weekday: 'Monday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B1', weekday: 'Monday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C1', weekday: 'Monday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D1', weekday: 'Monday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E1', weekday: 'Monday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'F1', weekday: 'Monday', period_number: 6, start_time: '13:00', end_time: '13:50' },
    { code: 'G1', weekday: 'Monday', period_number: 7, start_time: '14:00', end_time: '14:50' },
    { code: 'H1', weekday: 'Monday', period_number: 8, start_time: '15:00', end_time: '15:50' },
    { code: 'I1', weekday: 'Monday', period_number: 9, start_time: '16:00', end_time: '16:50' },
    // Tuesday
    { code: 'A2', weekday: 'Tuesday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B2', weekday: 'Tuesday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C2', weekday: 'Tuesday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D2', weekday: 'Tuesday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E2', weekday: 'Tuesday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'F2', weekday: 'Tuesday', period_number: 6, start_time: '13:00', end_time: '13:50' },
    { code: 'G2', weekday: 'Tuesday', period_number: 7, start_time: '14:00', end_time: '14:50' },
    { code: 'H2', weekday: 'Tuesday', period_number: 8, start_time: '15:00', end_time: '15:50' },
    { code: 'I2', weekday: 'Tuesday', period_number: 9, start_time: '16:00', end_time: '16:50' },
    // Wednesday
    { code: 'A3', weekday: 'Wednesday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B3', weekday: 'Wednesday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C3', weekday: 'Wednesday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D3', weekday: 'Wednesday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E3', weekday: 'Wednesday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'F3', weekday: 'Wednesday', period_number: 6, start_time: '13:00', end_time: '13:50' },
    { code: 'G3', weekday: 'Wednesday', period_number: 7, start_time: '14:00', end_time: '14:50' },
    { code: 'H3', weekday: 'Wednesday', period_number: 8, start_time: '15:00', end_time: '15:50' },
    { code: 'I3', weekday: 'Wednesday', period_number: 9, start_time: '16:00', end_time: '16:50' },
    // Thursday
    { code: 'A4', weekday: 'Thursday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B4', weekday: 'Thursday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C4', weekday: 'Thursday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D4', weekday: 'Thursday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E4', weekday: 'Thursday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'F4', weekday: 'Thursday', period_number: 6, start_time: '13:00', end_time: '13:50' },
    { code: 'G4', weekday: 'Thursday', period_number: 7, start_time: '14:00', end_time: '14:50' },
    { code: 'H4', weekday: 'Thursday', period_number: 8, start_time: '15:00', end_time: '15:50' },
    { code: 'I4', weekday: 'Thursday', period_number: 9, start_time: '16:00', end_time: '16:50' },
    // Friday
    { code: 'A5', weekday: 'Friday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B5', weekday: 'Friday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C5', weekday: 'Friday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D5', weekday: 'Friday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E5', weekday: 'Friday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'F5', weekday: 'Friday', period_number: 6, start_time: '13:00', end_time: '13:50' },
    { code: 'G5', weekday: 'Friday', period_number: 7, start_time: '14:00', end_time: '14:50' },
    { code: 'H5', weekday: 'Friday', period_number: 8, start_time: '15:00', end_time: '15:50' },
    { code: 'I5', weekday: 'Friday', period_number: 9, start_time: '16:00', end_time: '16:50' },
];

// ============================================================================
// STUDENT TIMETABLES
// ============================================================================

export const mockTimetables: Record<number, StudentTimetableView> = {
    // Hadassah Adams (student_number: 100001)
    100001: {
        student_number: 100001,
        first_name: 'Hadassah',
        last_name: 'Adams',
        grade: 10,
        // Monday
        A1: 'Physical Science', B1: 'Free', C1: 'Mathematics', D1: 'Life Orientation', E1: 'Free',
        F1: 'Further focus Physical Science', G1: 'Free', H1: 'Free', I1: 'Free', J1: null,
        // Tuesday
        A2: 'Physical Science', B2: 'Afrikaans', C2: 'Mathematics', D2: 'English', E2: 'Life Science',
        F2: 'History', G2: 'Free', H2: 'Free', I2: 'Free', J2: null,
        // Wednesday
        A3: 'Cycle Test', B3: 'Free', C3: 'Free', D3: 'English', E3: 'All Physical Science',
        F3: 'Free', G3: 'Assembly', H3: 'Free', I3: 'Free', J3: null,
        // Thursday
        A4: 'Physical Science', B4: 'Afrikaans', C4: 'Mathematics', D4: 'English', E4: 'Life Science',
        F4: 'History', G4: 'Free', H4: 'Free', I4: 'Free', J4: null,
        // Friday
        A5: 'English All', B5: 'All Life Science', C5: 'Mathematics All', D5: 'Afrikaans All', E5: 'Free',
        F5: 'History All', G5: 'Free', H5: 'Free', I5: 'Free', J5: null,
    },

    // Ella Van Der Merwe (student_number: 100002)
    100002: {
        student_number: 100002,
        first_name: 'Ella',
        last_name: 'Van Der Merwe',
        grade: 10,
        // Monday
        A1: 'Life Orientation', B1: 'Afrikaans', C1: 'Free', D1: 'Math Literacy', E1: 'Free',
        F1: 'Free', G1: 'Free', H1: 'Free', I1: 'Free', J1: null,
        // Tuesday
        A2: 'Free', B2: 'English', C2: 'Free', D2: 'Math Literacy', E2: 'Life Science',
        F2: 'History', G2: 'Free', H2: 'Free', I2: 'Free', J2: null,
        // Wednesday
        A3: 'Cycle Test', B3: 'English', C3: 'Free', D3: 'Math Literacy', E3: 'Free',
        F3: 'Free', G3: 'Assembly', H3: 'Free', I3: 'Free', J3: null,
        // Thursday
        A4: 'Afrikaans', B4: 'English', C4: 'Free', D4: 'Tourism', E4: 'Life Science',
        F4: 'History', G4: 'Free', H4: 'Free', I4: 'Free', J4: null,
        // Friday
        A5: 'English All', B5: 'All Life Science', C5: 'All Math Lit', D5: 'Afrikaans All', E5: 'Free',
        F5: 'History All', G5: 'Free', H5: 'Tourism', I5: 'Free', J5: null,
    },

    // Hlalumi Qina (student_number: 100003)
    100003: {
        student_number: 100003,
        first_name: 'Hlalumi',
        last_name: 'Qina',
        grade: 10,
        // Monday
        A1: 'Afrikaans', B1: 'All Business', C1: 'IT', D1: 'Math Literacy', E1: 'English',
        F1: 'Free', G1: 'Economics', H1: 'Free', I1: 'Free', J1: null,
        // Tuesday
        A2: 'Afrikaans', B2: 'Business Studies', C2: 'IT', D2: 'Math Literacy', E2: 'English',
        F2: 'History', G2: 'Free', H2: 'Free', I2: 'Free', J2: null,
        // Wednesday
        A3: 'Cycle Test', B3: 'Economics', C3: 'Free', D3: 'Math Literacy', E3: 'Free',
        F3: 'Free', G3: 'Assembly', H3: 'Free', I3: 'Free', J3: null,
        // Thursday
        A4: 'Free', B4: 'Business Studies', C4: 'IT', D4: 'Free', E4: 'English',
        F4: 'History', G4: 'Economics', H4: 'Free', I4: 'Free', J4: null,
        // Friday
        A5: 'English All', B5: 'Life Orientation', C5: 'All Math Lit', D5: 'Afrikaans All', E5: 'Free',
        F5: 'History All', G5: 'Free', H5: 'Free', I5: 'Free', J5: null,
    },
};

export const mockAttendance: AttendanceRecord[] = [
    { id: '1', date: '2025-02-10', period: '1', subject: 'Mathematics', status: 'absent' },
    { id: '2', date: '2025-02-12', period: '3', subject: 'Physics', status: 'late' },
    { id: '3', date: '2025-02-14', period: '2', subject: 'History', status: 'absent' },
    { id: '4', date: '2025-02-15', period: '5', subject: 'English', status: 'excused' },
];

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        title: 'Science Fair Registration Open',
        content: 'Registration for the annual Science Fair is now open! Please sign up by Friday, Feb 20th to participate. Projects can be individual or in pairs.',
        date: '2025-02-14',
        author: 'Mrs. Frizzle',
        category: 'academic',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Soccer Team Tryouts',
        content: 'Tryouts for the Boys and Girls Soccer teams will be held this Wednesday and Thursday on the main field after school (15:00 - 16:30).',
        date: '2025-02-12',
        author: 'Coach Carter',
        category: 'sports',
        priority: 'normal'
    },
    {
        id: '3',
        title: 'Library Hours Extended',
        content: 'The school library will now remain open until 17:00 every weekday to provide a quiet study space for students.',
        date: '2025-02-10',
        author: 'Mr. Bookman',
        category: 'general',
        priority: 'low'
    },
    {
        id: '4',
        title: 'Valentine\'s Day Social',
        content: 'Tickets for the Valentine\'s Day Social are on sale in the quad during break time. R50 per person.',
        date: '2025-02-08',
        author: 'Student Council',
        category: 'events',
        priority: 'normal'
    }
];

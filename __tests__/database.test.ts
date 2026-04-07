/**
 * Tests for lib/utils/database.ts
 * Pure utility functions — no mocking needed.
 */
import {
    getStudentTable,
    getTimetableTable,
    getSubjectsTable,
    parseGrade,
    hasTimetables,
    getAttendanceStatus,
    getAttendanceColor,
    getAttendanceIcon,
    STUDENT_GRADES,
} from '../lib/utils/database';
import type { Submission } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSubmission = (overrides: Partial<Submission> = {}): Submission => ({
    id: 1,
    created_at: '2026-01-15T08:00:00Z',
    date: '2026-01-15',
    grade: '10',
    subject_id: 'sub-math',
    subject_name: 'Mathematics',
    submitted_by_email: 'teacher@school.com',
    submitted_by_name: 'Test Teacher',
    student_numbers: [100001, 100002],
    student_names: ['Alice', 'Bob'],
    present_students: [],
    absent_students: [],
    late_students: [],
    excused_students: [],
    blocked_students: [],
    notes: null,
    ...overrides,
});

// ---------------------------------------------------------------------------
// getStudentTable
// ---------------------------------------------------------------------------

describe('getStudentTable', () => {
    it('returns correct table for numeric grades', () => {
        expect(getStudentTable(4)).toBe('grade_4_students');
        expect(getStudentTable(10)).toBe('grade_10_students');
        expect(getStudentTable(12)).toBe('grade_12_students');
    });

    it('returns british table for "british" string variants', () => {
        expect(getStudentTable('british')).toBe('grade_british_students');
        expect(getStudentTable('British')).toBe('grade_british_students');
        expect(getStudentTable('brit')).toBe('grade_british_students');
    });

    it('parses a numeric string grade', () => {
        expect(getStudentTable('10')).toBe('grade_10_students');
    });
});

// ---------------------------------------------------------------------------
// getTimetableTable
// ---------------------------------------------------------------------------

describe('getTimetableTable', () => {
    it('returns timetable table for grades 10–12', () => {
        expect(getTimetableTable(10)).toBe('timetables_10');
        expect(getTimetableTable(11)).toBe('timetables_11');
        expect(getTimetableTable(12)).toBe('timetables_12');
    });

    it('returns null for grades below 10', () => {
        expect(getTimetableTable(4)).toBeNull();
        expect(getTimetableTable(9)).toBeNull();
    });

    it('returns null for grades above 12', () => {
        expect(getTimetableTable(13)).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// getSubjectsTable
// ---------------------------------------------------------------------------

describe('getSubjectsTable', () => {
    it('returns Subjects_4_5_6 for grades 4–6', () => {
        expect(getSubjectsTable(4)).toBe('Subjects_4_5_6');
        expect(getSubjectsTable(5)).toBe('Subjects_4_5_6');
        expect(getSubjectsTable(6)).toBe('Subjects_4_5_6');
    });

    it('returns Subjects_7_8_9 for grades 7–9', () => {
        expect(getSubjectsTable(7)).toBe('Subjects_7_8_9');
        expect(getSubjectsTable(9)).toBe('Subjects_7_8_9');
    });

    it('returns grade-specific table for grades 10–12', () => {
        expect(getSubjectsTable(10)).toBe('Subjects_10');
        expect(getSubjectsTable(11)).toBe('Subjects_11');
        expect(getSubjectsTable(12)).toBe('Subjects_12');
    });

    it('returns Subjects_british for british grade', () => {
        expect(getSubjectsTable('british')).toBe('Subjects_british');
    });
});

// ---------------------------------------------------------------------------
// parseGrade
// ---------------------------------------------------------------------------

describe('parseGrade', () => {
    it('returns the number as-is for numeric input', () => {
        expect(parseGrade(10)).toBe(10);
        expect(parseGrade(12)).toBe(12);
    });

    it('returns "british" for british string variants', () => {
        expect(parseGrade('british')).toBe('british');
        expect(parseGrade('British')).toBe('british');
        expect(parseGrade('brit')).toBe('british');
    });

    it('parses numeric string input', () => {
        expect(parseGrade('10')).toBe(10);
        expect(parseGrade('12')).toBe(12);
    });

    it('defaults to 10 for null and undefined', () => {
        expect(parseGrade(null)).toBe(10);
        expect(parseGrade(undefined)).toBe(10);
    });

    it('defaults to 10 for unparseable strings', () => {
        expect(parseGrade('unknown')).toBe(10);
    });
});

// ---------------------------------------------------------------------------
// hasTimetables
// ---------------------------------------------------------------------------

describe('hasTimetables', () => {
    it('returns true for grades 10–12', () => {
        expect(hasTimetables(10)).toBe(true);
        expect(hasTimetables(11)).toBe(true);
        expect(hasTimetables(12)).toBe(true);
    });

    it('returns false for grades below 10', () => {
        expect(hasTimetables(9)).toBe(false);
        expect(hasTimetables(4)).toBe(false);
    });

    it('returns false for grades above 12', () => {
        expect(hasTimetables(13)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// STUDENT_GRADES constant
// ---------------------------------------------------------------------------

describe('STUDENT_GRADES', () => {
    it('includes all expected numeric grades', () => {
        expect(STUDENT_GRADES).toContain(4);
        expect(STUDENT_GRADES).toContain(5);
        expect(STUDENT_GRADES).toContain(12);
    });

    it('includes british grade', () => {
        expect(STUDENT_GRADES).toContain('british');
    });

    it('does not include grade 6 (no grade_6_students table)', () => {
        expect(STUDENT_GRADES).not.toContain(6);
    });
});

// ---------------------------------------------------------------------------
// getAttendanceStatus
// ---------------------------------------------------------------------------

describe('getAttendanceStatus', () => {
    it('returns "absent" when student is in absent list', () => {
        const sub = makeSubmission({ absent_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('absent');
    });

    it('returns "late" when student is in late list', () => {
        const sub = makeSubmission({ late_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('late');
    });

    it('returns "excused" when student is in excused list', () => {
        const sub = makeSubmission({ excused_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('excused');
    });

    it('returns "blocked" when student is in blocked list', () => {
        const sub = makeSubmission({ blocked_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('blocked');
    });

    it('returns "present" when student is in present list', () => {
        const sub = makeSubmission({ present_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('present');
    });

    it('returns "unknown" when student is not in any list', () => {
        const sub = makeSubmission();
        expect(getAttendanceStatus(sub, 100001)).toBe('unknown');
    });

    it('prioritises absent over present (status priority order)', () => {
        const sub = makeSubmission({ absent_students: [100001], present_students: [100001] });
        expect(getAttendanceStatus(sub, 100001)).toBe('absent');
    });

    it('does not confuse one student with another', () => {
        const sub = makeSubmission({ absent_students: [100002] });
        expect(getAttendanceStatus(sub, 100001)).toBe('unknown');
    });
});

// ---------------------------------------------------------------------------
// getAttendanceColor
// ---------------------------------------------------------------------------

describe('getAttendanceColor', () => {
    it('returns a green class for present', () => {
        expect(getAttendanceColor('present')).toContain('green');
    });

    it('returns a red class for absent', () => {
        expect(getAttendanceColor('absent')).toContain('red');
    });

    it('returns a yellow class for late', () => {
        expect(getAttendanceColor('late')).toContain('yellow');
    });

    it('returns a blue class for excused', () => {
        expect(getAttendanceColor('excused')).toContain('blue');
    });

    it('returns a gray class for unknown', () => {
        expect(getAttendanceColor('unknown')).toContain('gray');
    });
});

// ---------------------------------------------------------------------------
// getAttendanceIcon
// ---------------------------------------------------------------------------

describe('getAttendanceIcon', () => {
    it('returns check_circle for present', () => {
        expect(getAttendanceIcon('present')).toBe('check_circle');
    });

    it('returns cancel for absent', () => {
        expect(getAttendanceIcon('absent')).toBe('cancel');
    });

    it('returns schedule for late', () => {
        expect(getAttendanceIcon('late')).toBe('schedule');
    });

    it('returns help for unknown', () => {
        expect(getAttendanceIcon('unknown')).toBe('help');
    });
});

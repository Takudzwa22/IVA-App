/**
 * Tests for useStudent hooks and utilities
 */
import { getDaySchedule } from '../lib/hooks/useStudent';
import type { StudentTimetableView, TimetableHeader } from '../types';

// Mock timetable data
const mockTimetable: StudentTimetableView = {
    student_number: 100001,
    first_name: 'Test',
    last_name: 'Student',
    grade: 10,
    // Monday
    A1: 'Mathematics', B1: 'English', C1: 'Science', D1: null, E1: 'Free',
    F1: null, G1: null, H1: null, I1: null, J1: null,
    // Tuesday
    A2: 'History', B2: 'Geography', C2: null, D2: null, E2: null,
    F2: null, G2: null, H2: null, I2: null, J2: null,
    // Wednesday through Friday - empty for test simplicity
    A3: null, B3: null, C3: null, D3: null, E3: null, F3: null, G3: null, H3: null, I3: null, J3: null,
    A4: null, B4: null, C4: null, D4: null, E4: null, F4: null, G4: null, H4: null, I4: null, J4: null,
    A5: null, B5: null, C5: null, D5: null, E5: null, F5: null, G5: null, H5: null, I5: null, J5: null,
};

// Mock headers
const mockHeaders: TimetableHeader[] = [
    { code: 'A1', weekday: 'Monday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B1', weekday: 'Monday', period_number: 2, start_time: '09:00', end_time: '09:50' },
    { code: 'C1', weekday: 'Monday', period_number: 3, start_time: '10:00', end_time: '10:50' },
    { code: 'D1', weekday: 'Monday', period_number: 4, start_time: '11:00', end_time: '11:50' },
    { code: 'E1', weekday: 'Monday', period_number: 5, start_time: '12:00', end_time: '12:50' },
    { code: 'A2', weekday: 'Tuesday', period_number: 1, start_time: '08:00', end_time: '08:50' },
    { code: 'B2', weekday: 'Tuesday', period_number: 2, start_time: '09:00', end_time: '09:50' },
];

describe('useStudent utilities', () => {
    describe('getDaySchedule', () => {
        it('should return schedule for Monday', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Monday');

            expect(schedule.length).toBe(5);
            expect(schedule[0].subject).toBe('Mathematics');
            expect(schedule[0].period_number).toBe(1);
            expect(schedule[0].start_time).toBe('08:00');
        });

        it('should return schedule for Tuesday', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Tuesday');

            expect(schedule.length).toBe(2);
            expect(schedule[0].subject).toBe('History');
            expect(schedule[1].subject).toBe('Geography');
        });

        it('should include student info in each period', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Monday');

            schedule.forEach(period => {
                expect(period.student_number).toBe(100001);
                expect(period.first_name).toBe('Test');
                expect(period.last_name).toBe('Student');
                expect(period.grade).toBe(10);
            });
        });

        it('should return empty array for null timetable', () => {
            const schedule = getDaySchedule(null, mockHeaders, 'Monday');
            expect(schedule).toEqual([]);
        });

        it('should return empty array for day with no headers', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Saturday');
            expect(schedule).toEqual([]);
        });

        it('should handle Free periods', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Monday');
            const freePeriod = schedule.find(p => p.period_number === 5);

            expect(freePeriod?.subject).toBe('Free');
        });

        it('should handle null subjects', () => {
            const schedule = getDaySchedule(mockTimetable, mockHeaders, 'Monday');
            const nullPeriod = schedule.find(p => p.period_number === 4);

            expect(nullPeriod?.subject).toBeNull();
        });
    });
});

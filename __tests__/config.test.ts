/**
 * Tests for lib/config.ts
 */
import { DEV_MODE, DEV_STUDENT_NUMBER, DEV_STUDENTS } from '../lib/config';

describe('Config', () => {
    describe('DEV_MODE', () => {
        it('should be a boolean', () => {
            expect(typeof DEV_MODE).toBe('boolean');
        });
    });

    describe('DEV_STUDENT_NUMBER', () => {
        it('should be a valid 6-digit student number', () => {
            expect(DEV_STUDENT_NUMBER).toBeGreaterThanOrEqual(100000);
            expect(DEV_STUDENT_NUMBER).toBeLessThanOrEqual(999999);
        });

        it('should match one of the DEV_STUDENTS', () => {
            const studentNumbers = DEV_STUDENTS.map(s => s.student_number);
            expect(studentNumbers).toContain(DEV_STUDENT_NUMBER);
        });
    });

    describe('DEV_STUDENTS', () => {
        it('should have at least one student', () => {
            expect(DEV_STUDENTS.length).toBeGreaterThan(0);
        });

        it('should have valid student structure', () => {
            DEV_STUDENTS.forEach(student => {
                expect(student).toHaveProperty('student_number');
                expect(student).toHaveProperty('first_name');
                expect(student).toHaveProperty('last_name');
                expect(typeof student.student_number).toBe('number');
                expect(typeof student.first_name).toBe('string');
                expect(typeof student.last_name).toBe('string');
            });
        });

        it('should have unique student numbers', () => {
            const numbers = DEV_STUDENTS.map(s => s.student_number);
            const uniqueNumbers = Array.from(new Set(numbers));
            expect(uniqueNumbers.length).toBe(numbers.length);
        });
    });
});

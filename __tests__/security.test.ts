/**
 * Tests for lib/utils/validation.ts utility functions
 */
import {
    validateStudentNumber,
    validateEmailDomain,
    sanitizeInput,
    validateRequestBody
} from '../lib/utils/validation';

describe('Validation Utilities', () => {
    describe('validateStudentNumber', () => {
        it('should accept valid 6-digit numbers', () => {
            const result = validateStudentNumber(100001);
            expect(result.valid).toBe(true);
            expect(result.number).toBe(100001);
        });

        it('should accept valid string numbers', () => {
            const result = validateStudentNumber('100001');
            expect(result.valid).toBe(true);
            expect(result.number).toBe(100001);
        });

        it('should reject numbers less than 100000', () => {
            const result = validateStudentNumber(99999);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('6 digits');
        });

        it('should reject numbers greater than 999999', () => {
            const result = validateStudentNumber(1000000);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('6 digits');
        });

        it('should reject non-numeric strings', () => {
            const result = validateStudentNumber('abc');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid');
        });

        it('should reject non-number/string types', () => {
            const result = validateStudentNumber({ id: 123 });
            expect(result.valid).toBe(false);
        });
    });

    describe('validateEmailDomain', () => {
        it('should accept valid school domain', () => {
            expect(validateEmailDomain('student@ivaschool.online')).toBe(true);
        });

        it('should reject invalid domains', () => {
            expect(validateEmailDomain('student@gmail.com')).toBe(false);
        });

        it('should accept custom allowed domains', () => {
            expect(validateEmailDomain('user@test.com', ['test.com'])).toBe(true);
        });

        it('should be case insensitive', () => {
            expect(validateEmailDomain('student@IVASCHOOL.ONLINE')).toBe(true);
        });
    });

    describe('sanitizeInput', () => {
        it('should escape HTML characters', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
            );
        });

        it('should escape ampersands', () => {
            expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
        });

        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should escape single quotes', () => {
            expect(sanitizeInput("it's fine")).toBe("it&#x27;s fine");
        });
    });

    describe('validateRequestBody', () => {
        it('should accept valid body with required fields', () => {
            const result = validateRequestBody(
                { name: 'Test', email: 'test@test.com' },
                ['name', 'email']
            );
            expect(result.valid).toBe(true);
            expect(result.data).toEqual({ name: 'Test', email: 'test@test.com' });
        });

        it('should reject missing required fields', () => {
            const result = validateRequestBody(
                { name: 'Test' },
                ['name', 'email']
            );
            expect(result.valid).toBe(false);
            expect(result.error).toContain('email');
        });

        it('should reject non-object body', () => {
            const result = validateRequestBody('not an object', ['name']);
            expect(result.valid).toBe(false);
        });

        it('should reject null body', () => {
            const result = validateRequestBody(null, ['name']);
            expect(result.valid).toBe(false);
        });
    });
});

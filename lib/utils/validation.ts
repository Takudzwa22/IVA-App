/**
 * Pure Utility Functions for Security
 * 
 * These functions have no external dependencies and can be safely tested.
 */

/**
 * Validate that a student number is properly formatted
 */
export function validateStudentNumber(value: unknown): { valid: boolean; number?: number; error?: string } {
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            return { valid: false, error: 'Invalid student number format' };
        }
        value = parsed;
    }

    if (typeof value !== 'number') {
        return { valid: false, error: 'Student number must be a number' };
    }

    if (value < 100000 || value > 999999) {
        return { valid: false, error: 'Student number must be 6 digits' };
    }

    return { valid: true, number: value };
}

/**
 * Validate email matches expected domain
 */
export function validateEmailDomain(
    email: string,
    allowedDomains: string[] = ['ivaschool.online']
): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.includes(domain);
}

/**
 * Sanitize user input to prevent XSS
 * Use for any user-provided text that will be displayed
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validate request body against expected fields
 */
export function validateRequestBody<T extends Record<string, unknown>>(
    body: unknown,
    requiredFields: (keyof T)[]
): { valid: boolean; data?: T; error?: string } {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Request body must be an object' };
    }

    const data = body as Record<string, unknown>;
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        };
    }

    return { valid: true, data: data as T };
}

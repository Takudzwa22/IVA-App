/**
 * Application Configuration
 * 
 * Centralized configuration for the IVA App.
 * This file consolidates settings that were previously duplicated across files.
 */

// ============================================================================
// DEV MODE CONFIGURATION
// ============================================================================

/**
 * DEV_MODE enables development features:
 * - Student switcher in the UI
 * - Mock data when Supabase is not configured
 * - Bypasses authentication
 */
export const DEV_MODE = process.env.NODE_ENV === 'development';

/**
 * Default student number for dev mode
 * Available test students from seed data:
 *   100001 = Hadassah Adams
 *   100002 = Ella Van Der Merwe
 *   100003 = Hlalumi Qina
 */
export const DEV_STUDENT_NUMBER = 100001;

/**
 * Test students available in dev mode
 */
export const DEV_STUDENTS = [
    { student_number: 100001, first_name: 'Hadassah', last_name: 'Adams' },
    { student_number: 100002, first_name: 'Ella', last_name: 'Van Der Merwe' },
    { student_number: 100003, first_name: 'Hlalumi', last_name: 'Qina' },
] as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Enable/disable AI assistant feature
 */
export const AI_ENABLED = true;

/**
 * Current academic year for data filtering
 */
export const CURRENT_ACADEMIC_YEAR = '2026';

/**
 * Current term
 */
export const CURRENT_TERM = 1;

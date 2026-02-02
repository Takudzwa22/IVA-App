/**
 * Server-side Supabase Client
 * 
 * SECURITY WARNING:
 * This file uses the service role key which bypasses RLS.
 * ONLY import this in:
 * - API routes (app/api/*)
 * - Server actions
 * - Server components that need admin access
 * 
 * NEVER import this in client components or expose to the browser.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient as createSSRServerClient } from '@supabase/ssr';

// Environment variables (validated inside functions to avoid crash on import)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Server client with user's session - respects RLS
 * Use this for most authenticated operations
 */
export async function createServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  const cookieStore = await cookies();

  return createSSRServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Ignore errors in Server Components (read-only)
          if (process.env.NODE_ENV === 'development') {
            console.warn('[Supabase] Cookie set failed:', error);
          }
        }
      },
    },
  });
}

/**
 * Admin client with service role - BYPASSES RLS
 * Use ONLY for admin operations that require elevated access
 * 
 * Examples:
 * - Importing timetables from Excel
 * - Bulk user creation
 * - Data migrations
 */
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Admin operations require the service role key.'
    );
  }

  return createSupabaseClient(supabaseUrl!, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Validate that the current user has the required role
 * Use in API routes to protect admin/teacher endpoints
 */
export async function validateUserRole(
  requiredRole: 'admin' | 'teacher' | 'student'
): Promise<{ valid: boolean; userId?: string; role?: string; error?: string }> {
  const supabase = await createServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { valid: false, error: 'Unauthorized: Not authenticated' };
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return { valid: false, error: 'Unauthorized: User not found' };
  }

  const roleHierarchy = { admin: 3, teacher: 2, student: 1 };
  const userLevel = roleHierarchy[userData.role as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    return {
      valid: false,
      error: `Forbidden: Requires ${requiredRole} role`,
      userId: user.id,
      role: userData.role
    };
  }

  return { valid: true, userId: user.id, role: userData.role };
}

/**
 * Get the current user's student number (if they are a student)
 */
export async function getStudentNumber(): Promise<number | null> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_links')
    .select('student_number')
    .eq('user_id', user.id)
    .single();

  return data?.student_number || null;
}

/**
 * Get the current user's teacher ID (if they are a teacher)
 */
export async function getTeacherId(): Promise<string | null> {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_links')
    .select('teacher_id')
    .eq('user_id', user.id)
    .single();

  return data?.teacher_id || null;
}

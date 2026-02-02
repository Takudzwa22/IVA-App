/**
 * Next.js Middleware
 * 
 * Handles:
 * - Session refresh for authenticated users
 * - Route protection based on authentication status
 * - Security headers
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/callback',
  '/auth/confirm',
  '/api/ai', // AI assistant endpoint (has its own rate limiting)
  '/api/auth/verify-email', // Email verification for login
  '/api/student/timetable', // Student timetable data
  '/api/student/attendance', // Student attendance data
  '/api/student/assessments', // Student assessments data
  '/api/teacher/subjects', // Teacher subjects data
  '/api/teacher/assessments', // Teacher assessments CRUD
  '/api/teacher/marks', // Teacher marks/grading
];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, ('admin' | 'teacher' | 'student')[]> = {
  '/admin': ['admin'],
  '/teacher': ['admin', 'teacher'],
  '/api/admin': ['admin'],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Skip auth if Supabase not configured (development)
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith('/api/public')
  );

  if (isPublicRoute) {
    return response;
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login for non-API routes
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check role-based access
  for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!userData || !allowedRoles.includes(userData.role)) {
        if (!pathname.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Security Utilities
 * 
 * Common security functions for API routes and server actions.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter for API routes
 * Use Redis or similar in production for distributed rate limiting
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): { limited: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { limited: false, remaining: config.maxRequests - 1 };
  }

  record.count++;
  const remaining = Math.max(0, config.maxRequests - record.count);

  if (record.count > config.maxRequests) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining };
}

/**
 * Create rate-limited response
 */
export function rateLimitedResponse(retryAfterSeconds: number = 60): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString(),
      }
    }
  );
}

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
 * Create standardized API error responses
 */
export function apiError(
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details })
    },
    { status }
  );
}

/**
 * Create standardized API success responses
 */
export function apiSuccess<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status });
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

/**
 * Log security events (use proper logging service in production)
 */
export function logSecurityEvent(
  event: 'auth_failure' | 'rate_limit' | 'forbidden' | 'invalid_input',
  details: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp} - ${event}:`, JSON.stringify(details));

  // TODO: Send to logging service (e.g., Sentry, LogRocket, etc.)
}

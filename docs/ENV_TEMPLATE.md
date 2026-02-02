# Environment Variables Template

Copy these variables to your `.env.local` file.

## Required Variables

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================

# Public URL - safe to expose to client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anon Key - safe for client, RLS enforced
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Service Role Key - SERVER ONLY, bypasses RLS
# NEVER expose this to the client or browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# ============================================================================
# AUTHENTICATION
# ============================================================================

# JWT Secret for custom token validation
SUPABASE_JWT_SECRET=your-jwt-secret

# ============================================================================
# APPLICATION SETTINGS
# ============================================================================

# Current academic year
NEXT_PUBLIC_ACADEMIC_YEAR=2025

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Optional Variables

```bash
# ============================================================================
# AI CONFIGURATION (Gemini)
# ============================================================================

# Google Gemini API Key - SERVER ONLY
GEMINI_API_KEY=your-gemini-api-key

# ============================================================================
# SECURITY SETTINGS
# ============================================================================

# Rate limiting (requests per minute)
RATE_LIMIT_RPM=60

# Admin email domain
ADMIN_EMAIL_DOMAIN=ivaschool.online
```

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side code
- [ ] All API routes validate user authentication
- [ ] Rate limiting is enabled in production

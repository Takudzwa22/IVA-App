<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# IVA Continuous Reporting App (Next.js)

Next.js App Router UI for student/teacher continuous reporting. Supabase integration and AI assistant wiring are planned; current build uses mock data.

## Run Locally
**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Set environment variables in `.env.local`:
   - `GEMINI_API_KEY` - Your Gemini API key (server-side, secure)
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (optional for dev)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (optional for dev)
3. Start dev server: `npm run dev` (http://localhost:3000)
4. Production build: `npm run build` and `npm run start`

> **Note:** The Gemini API key is now handled server-side via `/api/ai` route for security. Do NOT use `NEXT_PUBLIC_GEMINI_API_KEY` as it exposes the key in the browser.


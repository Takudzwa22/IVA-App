# IVA App Roadmap (Next.js + Supabase)

## Current State
- Mobile-style React UI with mock data and a single-page state machine. No auth, real data, teacher workflows, or persistence. AI call stubbed with a Gemini API key.

## Goals
- Students (≈1,250): view timetables/schedules, class details, assignments/submissions, grades with continuous feedback, attendance record, notifications; later an AI study assistant.
- Teachers (≈100): manage classes/rosters, take attendance, create/grade assignments, upload scores/feedback, track schedules, send notifications, export data.
- Admin: manage terms/courses/sections/enrollments, roles/permissions, audits, reports.
- Platform: Next.js front end with routing and RBAC, Supabase auth/storage/DB with RLS, observability, CI/CD; AI via Gemini later behind an edge function.

## Phase Plan
1) Foundations & UX Skeleton
   - Move to Next.js (App Router) with shared layout and design tokens.
   - Introduce routing, role-aware navigation, and a query/data layer (Supabase client + TanStack Query).
   - Establish environment handling, linting/typing, and basic loading/error states.

2) Data Model & Supabase Setup
   - Create schema with RLS; seed minimal fixtures.
   - Configure Supabase auth (email/SAML/OTP), storage buckets, and service-role edge functions.
   - Wire JWT claims for roles/section membership.

3) Core Student Features
   - Schedule/timetable from `class_meetings` + `enrollments`.
   - Assignments + submissions; statuses and detail view.
   - Grades and feedback (per-assignment and aggregate trends).
   - Attendance history and alerts.
   - Notifications (in-app + email webhook).

4) Core Teacher Features
   - Class roster and schedule.
   - Attendance marking (bulk + quick mark).
   - Assignment creation and grading with feedback; CSV import for grades.
   - Exports for grades/attendance; audit trail surfaced.

5) Admin & Quality
   - Term/course/section/enrollment management.
   - Reporting dashboards (grades, attendance, missing work).
   - Access logs, audit trails, backups/retention.

6) AI (Flagged/Later)
   - Gemini via secured edge function scoped to a student’s data.
   - Study suggestions and feedback summarization; feature-flagged rollout.

## Target Schema (Supabase)
- `profiles` (id -> auth.uid, role enum ['student','teacher','admin'], name, email).
- `terms` (id, name, start_date, end_date, is_active).
- `courses` (id, code, name, description, credits, level).
- `class_sections` (id, course_id, term_id, name, schedule_info JSON, room, primary_teacher_id).
- `enrollments` (section_id, student_id, status, enrolled_at).
- `class_meetings` (section_id, starts_at, ends_at, room, topic).
- `attendance` (meeting_id, student_id, status ['present','late','absent','excused'], marked_by, marked_at, note).
- `assignments` (section_id, title, description, due_at, max_points, type, attachments JSON).
- `submissions` (assignment_id, student_id, submitted_at, content_url, status, attempt_number).
- `grades` (submission_id, grader_id, score, letter, feedback, graded_at, rubric JSON).
- `grade_overrides` (student_id, section_id, reason, score, created_by).
- `notifications` (user_id, type, payload JSON, read_at, created_at).
- `audit_logs` (actor_id, action, entity, entity_id, before JSON, after JSON, created_at).
- Indexes on FKs; `(user_id, read_at)` for notifications; `(section_id, due_at)` for assignments; `(meeting_id, student_id)` unique for attendance.

## RLS / Access (high level)
- Students: read their enrollments/attendance/assignments/submissions/grades; write their submissions.
- Teachers: read/write rows for sections they teach (assignments, grades, attendance, enrollments view).
- Admins: read/write all; manage schema/data corrections.
- Use JWT claims for role and section membership; all writes through edge functions where possible.

## Tech Choices
- Front end: Next.js (App Router, TypeScript), Tailwind, TanStack Query, React Hook Form + Zod.
- Backend: Supabase (Postgres, Auth, RLS, Storage, Functions, Realtime).
- Observability: Supabase logs + client telemetry; feature flags for AI.
- AI: Gemini via edge function; client uses public key only with RLS-protected reads.

## Release Milestones
1) Auth + schema + RLS; Next UI reads live data.
2) Student flows live (schedule, assignments, submissions, grades, attendance view, notifications).
3) Teacher flows live (attendance, assignment creation, grading, exports).
4) Admin tools + reports + audit surfacing.
5) AI assistant/feedback under feature flag.

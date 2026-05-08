-- 011_v_student_attendance.sql
-- Mobile reads student attendance via this view, which unnests the submissions
-- arrays into per-(student, date) rows. The Attendance App keeps writing to
-- the wide `submissions` table; the view is a thin read-side projection.

create or replace view public.v_student_attendance as
select
  s.date,
  s.subject_name,
  s.subject_id,
  s.class_name,
  s.grade,
  sn::int           as student_num,
  case
    when sn = any(coalesce(s.present_students,     '{}'::int[])) then 'present'
    when sn = any(coalesce(s.late_students,        '{}'::int[])) then 'late'
    when sn = any(coalesce(s.excused_students,     '{}'::int[])) then 'excused'
    when sn = any(coalesce(s.absent_students,      '{}'::int[])) then 'absent'
    when sn = any(coalesce(s.blocked_students,     '{}'::int[])) then 'blocked'
    when sn = any(coalesce(s.cycle_test_students,  '{}'::int[])) then 'cycle_test'
    else 'unknown'
  end as status
from public.submissions s,
     unnest(coalesce(s.student_numbers, '{}'::int[])) as sn;

-- Anon can read the view; underlying submissions table stays default-deny via RLS
-- (since service-role is what the Attendance App uses for writes anyway).
-- We DO need to ensure submissions has RLS so that anon can't `from('submissions')` directly.
alter table public.submissions enable row level security;

-- Make sure no permissive SELECT exists on submissions
drop policy if exists "anon read submissions" on public.submissions;

-- Grant the view; views inherit the SECURITY model of their owner unless we use security_invoker.
-- For now: view is owned by postgres (default), runs as creator, so it can read submissions
-- regardless of caller's RLS.
grant select on public.v_student_attendance to anon, authenticated;

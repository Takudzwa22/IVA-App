-- 007_mobile_v1_rls.sql
-- v1: RLS posture for the new mobile app.
--
-- Mobile reaches student PII only through SECURITY DEFINER RPCs (whoami).
-- Attendance App uses service-role which bypasses all RLS.
-- So student tables stay RLS-enabled with no SELECT policy = default-deny for anon.
-- Other tables (announcements, assessments, etc.) get permissive SELECT
-- because mobile reads them directly via PostgREST and they don't carry PII.

-- Enable RLS on every table mobile or web touches.
alter table public.announcements        enable row level security;
alter table public.assessments          enable row level security;
alter table public.assessment_marks     enable row level security;
alter table public.assessment_cycles    enable row level security;
alter table public.class_groups         enable row level security;
alter table public.trial_students       enable row level security;
alter table public.teachers             enable row level security;

-- Per-grade student tables (4..12 + british): RLS on, NO policy.
-- Default-deny for anon. SECURITY DEFINER RPCs (whoami) bypass.
do $$
declare g text;
begin
  foreach g in array array['4','5','6','7','8','9','10','11','12','british']
  loop
    execute format('alter table public.grade_%s_students enable row level security', g);
    -- Drop any pre-existing permissive policy from earlier versions of this migration:
    execute format('drop policy if exists "anon can read grade_%1$s_students" on public.grade_%1$s_students', g, g);
  end loop;
end $$;

-- Timetable tables: same pattern. Mobile reads timetables via SECURITY DEFINER RPC/view (Plan B). Default-deny for anon.
do $$
declare g text;
begin
  foreach g in array array['grade7','grade8','grade9','10','11','12']
  loop
    execute format('alter table public.timetables_%s enable row level security', g);
    execute format('drop policy if exists "anon can read timetables_%1$s" on public.timetables_%1$s', g, g);
  end loop;
end $$;

-- Drop the trial_students permissive policy if it exists from an earlier version.
drop policy if exists "anon read trial_students" on public.trial_students;

-- Tables that are safe to expose to anon (no PII):
drop policy if exists "anon read announcements"     on public.announcements;
drop policy if exists "anon read assessments"       on public.assessments;
drop policy if exists "anon read assessment_marks"  on public.assessment_marks;
drop policy if exists "anon read assessment_cycles" on public.assessment_cycles;
drop policy if exists "anon read class_groups"      on public.class_groups;
drop policy if exists "anon read teachers"          on public.teachers;

create policy "anon read announcements"     on public.announcements     for select to anon, authenticated using (true);
create policy "anon read assessments"       on public.assessments       for select to anon, authenticated using (true);
create policy "anon read assessment_marks"  on public.assessment_marks  for select to anon, authenticated using (is_published is true);
create policy "anon read assessment_cycles" on public.assessment_cycles for select to anon, authenticated using (true);
create policy "anon read class_groups"      on public.class_groups      for select to anon, authenticated using (true);
-- teachers: contains email + name, no payload. OK to expose to anon.
create policy "anon read teachers"          on public.teachers          for select to anon, authenticated using (true);

-- NOTE: assessment_marks gates on is_published — students never see unpublished marks.
-- Trial/grade student tables and timetable tables stay default-deny for anon. All mobile access goes through SECURITY DEFINER RPCs.

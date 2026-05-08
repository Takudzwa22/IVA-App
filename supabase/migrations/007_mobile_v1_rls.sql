-- 007_mobile_v1_rls.sql
-- v1: permissive RLS so the mobile app (using the anon key, no auth session)
-- can read everything. Tightened in v2 when Magic Link OTP arrives.
-- Writes are NOT covered by RLS — they go through SECURITY DEFINER RPCs and
-- Edge Functions that hold service-role server-side.

-- Enable RLS on every read table mobile touches.
alter table public.announcements        enable row level security;
alter table public.assessments          enable row level security;
alter table public.assessment_marks     enable row level security;
alter table public.assessment_cycles    enable row level security;
alter table public.class_groups         enable row level security;
alter table public.trial_students       enable row level security;
alter table public.teachers             enable row level security;

-- Per-grade student tables (4..12 + british).
do $$
declare g text;
begin
  foreach g in array array['4','5','6','7','8','9','10','11','12','british']
  loop
    execute format('alter table public.grade_%s_students enable row level security', g);
    execute format($f$
      drop policy if exists "anon can read grade_%1$s_students" on public.grade_%1$s_students;
      create policy "anon can read grade_%1$s_students"
        on public.grade_%1$s_students for select
        to anon, authenticated
        using (true);
    $f$, g);
  end loop;
end $$;

-- Timetable tables.
do $$
declare g text;
begin
  foreach g in array array['grade7','grade8','grade9','10','11','12']
  loop
    execute format('alter table public.timetables_%s enable row level security', g);
    execute format($f$
      drop policy if exists "anon can read timetables_%1$s" on public.timetables_%1$s;
      create policy "anon can read timetables_%1$s"
        on public.timetables_%1$s for select
        to anon, authenticated
        using (true);
    $f$, g);
  end loop;
end $$;

-- Generic permissive SELECT for everything else mobile reads.
drop policy if exists "anon read announcements"     on public.announcements;
drop policy if exists "anon read assessments"       on public.assessments;
drop policy if exists "anon read assessment_marks"  on public.assessment_marks;
drop policy if exists "anon read assessment_cycles" on public.assessment_cycles;
drop policy if exists "anon read class_groups"      on public.class_groups;
drop policy if exists "anon read trial_students"    on public.trial_students;
drop policy if exists "anon read teachers"          on public.teachers;

create policy "anon read announcements"     on public.announcements     for select to anon, authenticated using (true);
create policy "anon read assessments"       on public.assessments       for select to anon, authenticated using (true);
create policy "anon read assessment_marks"  on public.assessment_marks  for select to anon, authenticated using (is_published is true);
create policy "anon read assessment_cycles" on public.assessment_cycles for select to anon, authenticated using (true);
create policy "anon read class_groups"      on public.class_groups      for select to anon, authenticated using (true);
create policy "anon read trial_students"    on public.trial_students    for select to anon, authenticated using (true);
create policy "anon read teachers"          on public.teachers          for select to anon, authenticated using (true);

-- NOTE: assessment_marks is "published only" even at v1, since unpublished marks are by definition not for student eyes yet.

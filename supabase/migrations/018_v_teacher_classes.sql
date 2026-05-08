-- 018_v_teacher_classes.sql
-- Returns one row per (teacher, subject, grade, class_group) with a count of
-- assessments. Teachers' "Classes" tab queries this, filtered by teacher_email.

create or replace view public.v_teacher_classes as
  select
    a.teacher_email,
    a.subject_name,
    a.grade,
    a.class_group,
    count(*)::int        as assessment_count,
    max(a.due_date)      as latest_due_date
  from public.assessments a
  where a.teacher_email is not null
  group by a.teacher_email, a.subject_name, a.grade, a.class_group;

grant select on public.v_teacher_classes to anon, authenticated;

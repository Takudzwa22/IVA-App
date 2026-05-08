-- 008_mobile_v1_views.sql
-- Pre-joined read view for student grades. Other views deferred to later plans.

-- v_student_current_grades: assessments × marks for a student in a cycle, grade-aware.
create or replace view public.v_student_current_grades as
  select
    am.student_num,
    a.grade,
    a.cycle,
    a.subject_id,
    a.id as assessment_id,
    a.title as assessment_title,
    a.weight,
    a.max_mark,
    am.mark_obtained,
    am.is_published,
    am.teacher_comments,
    am.updated_at
  from public.assessment_marks am
  join public.assessments a on a.id = am.assessment_id
  where am.is_published is true;

-- Permissive RLS on assessment_marks (Task 1) covers reads through the view.
grant select on public.v_student_current_grades to anon, authenticated;

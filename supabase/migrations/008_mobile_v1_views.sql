-- 008_mobile_v1_views.sql
-- Pre-joined read view for student grades. Other views deferred to later plans.

-- v_student_current_grades: assessments × marks for a student in a cycle, grade-aware.
-- Schema note: prod `assessments` uses subject_name, weighting, max_marks, class_group,
-- is_test, due_date, teacher_email (no subject_id / weight / max_mark / class_group_id).
create or replace view public.v_student_current_grades as
  select
    am.student_num,
    a.grade,
    a.cycle,
    a.subject_name,
    a.class_group,
    a.id as assessment_id,
    a.title as assessment_title,
    a.due_date,
    a.is_test,
    a.weighting,
    a.max_marks,
    am.mark_obtained,
    am.is_published,
    am.teacher_comments,
    am.updated_at
  from public.assessment_marks am
  join public.assessments a on a.id = am.assessment_id
  where am.is_published is true;

-- Permissive RLS on assessment_marks (Task 1) covers reads through the view.
grant select on public.v_student_current_grades to anon, authenticated;

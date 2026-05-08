-- 012_fix_whoami_trial_students.sql
-- Bug fix: trial_students uses lowercase snake_case columns (student_num, full_name,
-- name, surname, grade) while grade_X_students use uppercase quoted columns
-- ("Number", "Full Name", "Name", "Surname", "Grade"). The original 009 whoami
-- assumed both followed the grade_X_students convention, causing
-- `column "Number" does not exist` on trial-student lookups.
--
-- This migration replaces the whoami function with the correct trial-students
-- column names. Other branches (grade tables 4..12, british, teachers) are
-- unchanged.

create or replace function public.whoami(p_email text)
returns table (
  role          text,
  student_num   int,
  grade         int,
  full_name     text,
  teacher_email text
)
security definer
set search_path = public
language plpgsql
as $$
declare
  v_num text;
  v_grade int;
  v_role text;
  v_student_num int;
  v_full_name text;
begin
  if p_email is null or trim(p_email) = '' then
    return;
  end if;

  -- Numeric prefix at @ivaschool.online → student
  v_num := substring(lower(p_email) from '^([0-9]+)@ivaschool\.online$');

  if v_num is not null then
    -- Trial students first (sentinel grade=0).
    -- Schema: trial_students has lowercase columns: student_num, full_name, name, surname, grade.
    select 'student'::text,
           student_num::int,
           coalesce(full_name, concat_ws(' ', name, surname))::text
      into v_role, v_student_num, v_full_name
      from public.trial_students
      where student_num = v_num::int
      limit 1;
    if found then
      role := v_role; student_num := v_student_num; grade := 0;
      full_name := v_full_name; teacher_email := null;
      return next;
      return;
    end if;

    -- Numbered grade tables (4..12).
    -- Schema: grade_X_students has uppercase quoted columns: "Number", "Full Name", "Name", "Surname".
    foreach v_grade in array array[4,5,6,7,8,9,10,11,12]
    loop
      v_role := null; v_student_num := null; v_full_name := null;
      execute format($f$
        select 'student'::text, "Number"::int,
               coalesce("Full Name", concat_ws(' ', "Name", "Surname"))::text
          from public.grade_%1$s_students
          where "Number" = $1
          limit 1
      $f$, v_grade)
      into v_role, v_student_num, v_full_name
      using v_num::int;
      if found then
        role := v_role; student_num := v_student_num; grade := v_grade;
        full_name := v_full_name; teacher_email := null;
        return next;
        return;
      end if;
    end loop;

    -- British grade. Same uppercase convention as numbered grade tables.
    select 'student'::text, "Number"::int,
           coalesce("Full Name", concat_ws(' ', "Name", "Surname"))::text
      into v_role, v_student_num, v_full_name
      from public.grade_british_students
      where "Number" = v_num::int
      limit 1;
    if found then
      role := v_role; student_num := v_student_num; grade := null;
      full_name := v_full_name; teacher_email := null;
      return next;
      return;
    end if;

    -- No match: return nothing.
    return;
  end if;

  -- Otherwise: teacher lookup by Email column (uppercase quoted).
  declare
    v_teacher_email text;
  begin
    select coalesce("Role", 'teacher')::text,
           coalesce("Full Name", concat_ws(' ', "Name", "Surname"))::text,
           "Email"::text
      into v_role, v_full_name, v_teacher_email
      from public.teachers
      where lower("Email") = lower(p_email)
      limit 1;
    if found then
      role := v_role; student_num := null; grade := null;
      full_name := v_full_name; teacher_email := v_teacher_email;
      return next;
      return;
    end if;
  end;
end;
$$;

grant execute on function public.whoami(text) to anon, authenticated;

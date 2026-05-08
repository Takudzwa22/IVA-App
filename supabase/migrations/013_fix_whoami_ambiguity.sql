-- 013_fix_whoami_ambiguity.sql
-- Bug fix: in 012, the trial_students lookup wrote `where student_num = v_num::int`,
-- but `student_num` is ALSO the function's OUT parameter (from `returns table (...,
-- student_num int, ...)`). Postgres rejects with "column reference student_num is
-- ambiguous". Fix: qualify trial_students columns via a table alias.

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

  v_num := substring(lower(p_email) from '^([0-9]+)@ivaschool\.online$');

  if v_num is not null then
    -- Trial students (lowercase columns; alias to avoid OUT-param collision).
    select 'student'::text,
           ts.student_num::int,
           coalesce(ts.full_name, concat_ws(' ', ts.name, ts.surname))::text
      into v_role, v_student_num, v_full_name
      from public.trial_students ts
      where ts.student_num = v_num::int
      limit 1;
    if found then
      role := v_role; student_num := v_student_num; grade := 0;
      full_name := v_full_name; teacher_email := null;
      return next;
      return;
    end if;

    -- Grade tables 4..12 (uppercase quoted columns; no ambiguity).
    foreach v_grade in array array[4,5,6,7,8,9,10,11,12]
    loop
      v_role := null; v_student_num := null; v_full_name := null;
      execute format($f$
        select 'student'::text, gs."Number"::int,
               coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
          from public.grade_%1$s_students gs
          where gs."Number" = $1
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

    -- British grade.
    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_student_num, v_full_name
      from public.grade_british_students gs
      where gs."Number" = v_num::int
      limit 1;
    if found then
      role := v_role; student_num := v_student_num; grade := null;
      full_name := v_full_name; teacher_email := null;
      return next;
      return;
    end if;

    return;
  end if;

  -- Teacher lookup.
  declare
    v_teacher_email text;
  begin
    select coalesce(t."Role", 'teacher')::text,
           coalesce(t."Full Name", concat_ws(' ', t."Name", t."Surname"))::text,
           t."Email"::text
      into v_role, v_full_name, v_teacher_email
      from public.teachers t
      where lower(t."Email") = lower(p_email)
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

-- 017_whoami_static.sql
-- Replaces whoami's dynamic-SQL grade loop with explicit static SELECTs per
-- grade. The previous version used EXECUTE format(...) INTO ... USING ... and
-- was silently returning empty even for confirmed students; static SELECTs
-- close the bug and are simple to read.

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
  v_email text;
  v_num   int;
  v_role  text;
  v_snum  int;
  v_full  text;
begin
  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' then return; end if;

  if v_email ~ '^[0-9]+@ivaschool\.online$' then
    v_num := substring(v_email from '^([0-9]+)')::int;

    -- trial_students (lowercase columns)
    select 'student'::text, ts.student_num::int,
           coalesce(ts.full_name, concat_ws(' ', ts.name, ts.surname))::text
      into v_role, v_snum, v_full
      from public.trial_students ts
      where ts.student_num = v_num
      limit 1;
    if found then
      role := v_role; student_num := v_snum; grade := 0;
      full_name := v_full; teacher_email := null;
      return next; return;
    end if;

    -- grade_4..12 (uppercase quoted columns)
    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_4_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 4; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_5_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 5; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_6_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 6; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_7_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 7; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_8_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 8; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_9_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 9; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_10_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 10; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_11_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 11; full_name := v_full; teacher_email := null; return next; return; end if;

    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_12_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := 12; full_name := v_full; teacher_email := null; return next; return; end if;

    -- british (no Grade)
    select 'student'::text, gs."Number"::int,
           coalesce(gs."Full Name", concat_ws(' ', gs."Name", gs."Surname"))::text
      into v_role, v_snum, v_full
      from public.grade_british_students gs where gs."Number" = v_num limit 1;
    if found then role := v_role; student_num := v_snum; grade := null; full_name := v_full; teacher_email := null; return next; return; end if;

    return;
  end if;

  -- teachers (lowercase user_role + "Full name" lowercase n)
  declare v_temail text;
  begin
    select coalesce(t.user_role, 'teacher')::text,
           coalesce(t."Full name", concat_ws(' ', t."Name", t."Surname"))::text,
           t."Email"::text
      into v_role, v_full, v_temail
      from public.teachers t
      where lower(t."Email") = v_email
      limit 1;
    if found then
      role := v_role; student_num := null; grade := null;
      full_name := v_full; teacher_email := v_temail;
      return next; return;
    end if;
  end;
end;
$$;

grant execute on function public.whoami(text) to anon, authenticated;

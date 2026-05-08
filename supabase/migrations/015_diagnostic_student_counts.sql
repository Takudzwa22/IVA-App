-- 015_diagnostic_student_counts.sql
-- Throwaway diagnostic. Returns row counts per student table so we can confirm
-- which tables actually have students in prod. Drop once we've used it.

create or replace function public.dbg_student_counts()
returns table (table_name text, row_count bigint)
security definer
set search_path = public
language plpgsql
as $$
declare
  g text;
  c bigint;
begin
  -- trial_students
  execute 'select count(*) from public.trial_students' into c;
  table_name := 'trial_students'; row_count := c; return next;

  -- grade_4..12
  foreach g in array array['4','5','6','7','8','9','10','11','12']
  loop
    execute format('select count(*) from public.grade_%s_students', g) into c;
    table_name := format('grade_%s_students', g); row_count := c; return next;
  end loop;

  -- british
  execute 'select count(*) from public.grade_british_students' into c;
  table_name := 'grade_british_students'; row_count := c; return next;
end;
$$;

grant execute on function public.dbg_student_counts() to anon, authenticated;

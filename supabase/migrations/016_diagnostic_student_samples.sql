-- 016_diagnostic_student_samples.sql
-- Returns up to 3 student numbers per table so we can see formats and verify
-- whoami's lookup logic. Drop later.

create or replace function public.dbg_student_samples()
returns table (table_name text, sample_numbers bigint[], sample_names text[])
security definer
set search_path = public
language plpgsql
as $$
declare g text;
begin
  -- trial_students: lowercase student_num + full_name
  select 'trial_students'::text,
         array_agg(student_num order by student_num)::bigint[],
         array_agg(coalesce(full_name, name) order by student_num)::text[]
    into table_name, sample_numbers, sample_names
    from (select student_num, full_name, name from public.trial_students order by student_num limit 3) s;
  return next;

  -- grade_X_students: uppercase "Number" + "Full Name"
  foreach g in array array['4','5','6','7','8','9','10','11','12']
  loop
    execute format($f$
      select format('grade_%s_students')::text,
             array_agg(num order by num)::bigint[],
             array_agg(name order by num)::text[]
      from (select "Number" as num, coalesce("Full Name", "Name") as name
            from public.grade_%s_students order by "Number" limit 3) s
    $f$, g, g)
    into table_name, sample_numbers, sample_names;
    return next;
  end loop;

  -- british
  select 'grade_british_students'::text,
         array_agg(num order by num)::bigint[],
         array_agg(nm order by num)::text[]
    into table_name, sample_numbers, sample_names
    from (select "Number" as num, coalesce("Full Name", "Name") as nm
          from public.grade_british_students order by "Number" limit 3) s;
  return next;
end;
$$;

grant execute on function public.dbg_student_samples() to anon, authenticated;

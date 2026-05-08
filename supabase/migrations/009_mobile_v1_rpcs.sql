-- 009_mobile_v1_rpcs.sql

-- 1. Idempotency log for write RPCs / Edge Functions.
create table if not exists public.mutation_log (
  idempotency_key uuid primary key,
  result          jsonb not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_mutation_log_recent
  on public.mutation_log (idempotency_key)
  where created_at > now() - interval '24 hours';

-- pg_cron-driven prune (requires pg_cron extension enabled in Supabase dashboard).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'prune-mutation-log',
      '5 * * * *',
      $cron$ delete from public.mutation_log where created_at < now() - interval '24 hours'; $cron$
    );
  end if;
end $$;

-- 2. whoami: identity lookup for v1 sign-in. Returns role + identity attributes.
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
  v_row record;
begin
  if p_email is null or trim(p_email) = '' then
    return;
  end if;

  -- Numeric prefix at @ivaschool.online → student
  v_num := substring(lower(p_email) from '^([0-9]+)@ivaschool\.online$');

  if v_num is not null then
    -- Trial students first (sentinel grade=0)
    select 'student'::text, "Number"::int, 0::int, coalesce("Full Name", concat_ws(' ', "Name", "Surname")), null::text
      into v_row
      from public.trial_students
      where "Number" = v_num::int
      limit 1;
    if found then
      role := v_row.role;
      student_num := v_row.student_num;
      grade := v_row.grade;
      full_name := v_row.full_name;
      teacher_email := null;
      return next;
      return;
    end if;

    -- Numbered grade tables
    foreach v_grade in array array[4,5,6,7,8,9,10,11,12]
    loop
      execute format($f$
        select 'student'::text, "Number"::int, %1$s::int,
               coalesce("Full Name", concat_ws(' ', "Name", "Surname"))::text, null::text
          from public.grade_%1$s_students
          where "Number" = $1
          limit 1
      $f$, v_grade)
      into v_row
      using v_num::int;
      if v_row.full_name is not null or v_row.student_num is not null then
        role := v_row.role; student_num := v_row.student_num; grade := v_row.grade;
        full_name := v_row.full_name; teacher_email := null;
        return next;
        return;
      end if;
    end loop;

    -- British grade
    select 'student', "Number"::int, null::int,
           coalesce("Full Name", concat_ws(' ', "Name", "Surname")), null
      into v_row
      from public.grade_british_students
      where "Number" = v_num::int
      limit 1;
    if found then
      role := v_row.role; student_num := v_row.student_num; grade := v_row.grade;
      full_name := v_row.full_name; teacher_email := null;
      return next;
      return;
    end if;

    -- No match: return nothing (signal = "email not found")
    return;
  end if;

  -- Otherwise: teacher lookup by Email column.
  select coalesce("Role", 'teacher'), null::int, null::int,
         coalesce("Full Name", concat_ws(' ', "Name", "Surname")), "Email"
    into v_row
    from public.teachers
    where lower("Email") = lower(p_email)
    limit 1;
  if found then
    role := v_row.role; student_num := null; grade := null;
    full_name := v_row.full_name; teacher_email := v_row.teacher_email;
    return next;
    return;
  end if;
end;
$$;

revoke all on function public.whoami(text) from public;
grant execute on function public.whoami(text) to anon, authenticated;

-- 3. current_cycle: today's active cycle for a grade.
create or replace function public.current_cycle(p_grade int)
returns table (cycle int, year int, start_date date, end_date date)
security definer
set search_path = public
language sql
stable
as $$
  select cycle, year, start_date, end_date
  from public.assessment_cycles
  where grade = p_grade
    and current_date between start_date and end_date
  order by start_date desc
  limit 1;
$$;
grant execute on function public.current_cycle(int) to anon, authenticated;

-- 4. record_attendance: idempotent attendance write.
create or replace function public.record_attendance(
  p_idempotency_key uuid,
  p_class_group_id  uuid,
  p_date            date,
  p_records         jsonb  -- [{ student_num, status, note }, ...]
)
returns jsonb
security definer
set search_path = public
language plpgsql
as $$
declare
  v_existing jsonb;
  v_result   jsonb;
begin
  -- Idempotency check
  select result into v_existing
    from public.mutation_log
    where idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  -- Apply attendance: upsert by (class_group_id, date, student_num)
  insert into public.attendance_records (class_group_id, "date", student_num, status, note, recorded_at)
  select p_class_group_id, p_date, (rec->>'student_num')::int, rec->>'status', rec->>'note', now()
    from jsonb_array_elements(p_records) rec
  on conflict (class_group_id, "date", student_num)
  do update set status = excluded.status, note = excluded.note, recorded_at = now();

  v_result := jsonb_build_object('ok', true, 'count', jsonb_array_length(p_records));
  insert into public.mutation_log (idempotency_key, result) values (p_idempotency_key, v_result);
  return v_result;
end;
$$;
grant execute on function public.record_attendance(uuid, uuid, date, jsonb) to anon, authenticated;

-- 5. upsert_mark: idempotent single-mark write.
create or replace function public.upsert_mark(
  p_idempotency_key uuid,
  p_assessment_id   uuid,
  p_student_num     int,
  p_mark_obtained   numeric,
  p_teacher_comments text default null,
  p_publish         boolean default false
)
returns jsonb
security definer
set search_path = public
language plpgsql
as $$
declare v_existing jsonb; v_result jsonb;
begin
  select result into v_existing from public.mutation_log where idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  insert into public.assessment_marks (assessment_id, student_num, mark_obtained, teacher_comments, is_published, updated_at)
  values (p_assessment_id, p_student_num, p_mark_obtained, p_teacher_comments, p_publish, now())
  on conflict (assessment_id, student_num)
  do update set mark_obtained = excluded.mark_obtained,
                teacher_comments = excluded.teacher_comments,
                is_published = excluded.is_published,
                updated_at = now();

  v_result := jsonb_build_object('ok', true, 'assessment_id', p_assessment_id, 'student_num', p_student_num);
  insert into public.mutation_log (idempotency_key, result) values (p_idempotency_key, v_result);
  return v_result;
end;
$$;
grant execute on function public.upsert_mark(uuid, uuid, int, numeric, text, boolean) to anon, authenticated;

-- 6. upsert_excusal: view + create from mobile (approval stays web-side per spec).
create or replace function public.upsert_excusal(
  p_idempotency_key uuid,
  p_student_num int,
  p_date date,
  p_reason text,
  p_supporting_doc_url text default null
)
returns jsonb
security definer
set search_path = public
language plpgsql
as $$
declare v_existing jsonb; v_result jsonb; v_id uuid;
begin
  select result into v_existing from public.mutation_log where idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  insert into public.excusals (student_num, "date", reason, supporting_doc_url, status, created_at)
  values (p_student_num, p_date, p_reason, p_supporting_doc_url, 'pending', now())
  returning id into v_id;

  v_result := jsonb_build_object('ok', true, 'id', v_id);
  insert into public.mutation_log (idempotency_key, result) values (p_idempotency_key, v_result);
  return v_result;
end;
$$;
grant execute on function public.upsert_excusal(uuid, int, date, text, text) to anon, authenticated;

-- 7. log_event: fire-and-forget telemetry, no idempotency.
create table if not exists public.app_events (
  id          uuid primary key default gen_random_uuid(),
  user_email  text,
  event       text not null,
  props       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_app_events_recent on public.app_events (created_at desc);
alter table public.app_events enable row level security;
-- No SELECT policy → anon cannot read events.

create or replace function public.log_event(
  p_user_email text,
  p_event      text,
  p_props      jsonb default null
)
returns void
security definer
set search_path = public
language sql
as $$
  insert into public.app_events (user_email, event, props) values (p_user_email, p_event, p_props);
$$;
grant execute on function public.log_event(text, text, jsonb) to anon, authenticated;

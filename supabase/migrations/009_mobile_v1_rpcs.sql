-- 009_mobile_v1_rpcs.sql
-- Plan A core: identity, cycle, telemetry, idempotency log.
-- Write RPCs (record_attendance, upsert_excusal) deferred to Plan C
-- (their target tables — `submissions`, `student_excusals` per Attendance App
-- — need schema verification first). upsert_mark is included because
-- assessment_marks schema is confirmed.

-- 1. Idempotency log + prune cron.
create table if not exists public.mutation_log (
  idempotency_key uuid primary key,
  result          jsonb not null,
  created_at      timestamptz not null default now()
);

-- Index for prune (immutable predicate; the partial-index version with
-- now() was rejected by Postgres).
create index if not exists idx_mutation_log_created_at
  on public.mutation_log (created_at);

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Unschedule a prior copy so re-running this migration is idempotent.
    perform cron.unschedule('prune-mutation-log')
      where exists (select 1 from cron.job where jobname = 'prune-mutation-log');
    perform cron.schedule(
      'prune-mutation-log',
      '5 * * * *',
      $cron$ delete from public.mutation_log where created_at < now() - interval '24 hours'; $cron$
    );
  end if;
end $$;

-- 2. Unique constraint backing upsert_mark's ON CONFLICT.
create unique index if not exists ux_assessment_marks_assessment_student
  on public.assessment_marks (assessment_id, student_num);

-- 3. whoami: identity lookup. Returns role + identity attributes.
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
    -- Trial students first (sentinel grade=0)
    select 'student'::text, "Number"::int,
           coalesce("Full Name", concat_ws(' ', "Name", "Surname"))
      into v_role, v_student_num, v_full_name
      from public.trial_students
      where "Number" = v_num::int
      limit 1;
    if found then
      role := v_role; student_num := v_student_num; grade := 0;
      full_name := v_full_name; teacher_email := null;
      return next;
      return;
    end if;

    -- Numbered grade tables (4..12). Use individual local vars to avoid
    -- the "v_row not nulled between iterations" bug (INTO doesn't null
    -- on no-match in PL/pgSQL). Re-declare on each loop and check FOUND.
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

    -- British grade (no Grade column / different shape)
    select 'student'::text, "Number"::int,
           coalesce("Full Name", concat_ws(' ', "Name", "Surname"))
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

    -- No match: return nothing (signal = "email not found")
    return;
  end if;

  -- Otherwise: teacher lookup by Email column.
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

revoke all on function public.whoami(text) from public;
grant execute on function public.whoami(text) to anon, authenticated;

-- 4. current_cycle: today's active cycle for a grade.
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
declare
  v_existing jsonb;
  v_inserted boolean;
  v_result   jsonb;
begin
  -- Atomic idempotency reservation: try to claim the key. If we can't,
  -- somebody else already did — return their result without re-applying.
  insert into public.mutation_log (idempotency_key, result)
  values (p_idempotency_key, jsonb_build_object('ok', false, 'pending', true))
  on conflict (idempotency_key) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    select result into v_existing
      from public.mutation_log
      where idempotency_key = p_idempotency_key;
    return v_existing;
  end if;

  insert into public.assessment_marks (assessment_id, student_num, mark_obtained, teacher_comments, is_published, updated_at)
  values (p_assessment_id, p_student_num, p_mark_obtained, p_teacher_comments, p_publish, now())
  on conflict (assessment_id, student_num)
  do update set mark_obtained    = excluded.mark_obtained,
                teacher_comments = excluded.teacher_comments,
                is_published    = excluded.is_published,
                updated_at      = now();

  v_result := jsonb_build_object('ok', true, 'assessment_id', p_assessment_id, 'student_num', p_student_num);
  update public.mutation_log set result = v_result where idempotency_key = p_idempotency_key;
  return v_result;
end;
$$;
grant execute on function public.upsert_mark(uuid, uuid, int, numeric, text, boolean) to anon, authenticated;

-- 6. log_event: fire-and-forget telemetry.
create table if not exists public.app_events (
  id          uuid primary key default gen_random_uuid(),
  user_email  text,
  event       text not null,
  props       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_app_events_created_at on public.app_events (created_at desc);
alter table public.app_events enable row level security;
-- No SELECT policy → anon cannot read events. log_event RPC writes via SECURITY DEFINER.

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

-- 7. Drop deferred functions if they were created by an earlier version of this migration.
drop function if exists public.record_attendance(uuid, uuid, date, jsonb);
drop function if exists public.upsert_excusal(uuid, int, date, text, text);

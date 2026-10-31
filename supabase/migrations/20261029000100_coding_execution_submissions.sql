begin;

create table public.coding_test_submissions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.coding_test_attempts(id) on delete cascade,
  question_id uuid not null references public.coding_questions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  language text not null check (char_length(btrim(language)) between 1 and 40),
  mode text not null check (mode in ('run', 'submit')),
  status text not null check (status in (
    'accepted',
    'wrong_answer',
    'compile_error',
    'runtime_error',
    'time_limit',
    'service_error'
  )),
  passed_tests integer not null check (passed_tests >= 0),
  total_tests integer not null check (total_tests >= 0),
  hidden_passed integer not null check (hidden_passed >= 0),
  hidden_total integer not null check (hidden_total >= 0),
  score integer not null check (score >= 0),
  max_score integer not null check (max_score >= 0),
  execution_time_ms integer check (execution_time_ms >= 0),
  memory_kb integer check (memory_kb >= 0),
  stdout text not null default '',
  stderr text not null default '',
  compile_output text not null default '',
  visible_results jsonb not null default '[]'::jsonb
    check (jsonb_typeof(visible_results) = 'array'),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create index coding_test_submissions_attempt_question_idx
  on public.coding_test_submissions (attempt_id, question_id, created_at desc);

alter table public.coding_test_submissions enable row level security;
revoke all on public.coding_test_submissions from public, anon, authenticated;
grant select on public.coding_test_submissions to authenticated;
grant select, insert on public.coding_test_submissions to service_role;

create policy "Students can read their own coding submissions"
  on public.coding_test_submissions for select to authenticated
  using (user_id = (select auth.uid()));

create table public.coding_execution_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index coding_execution_requests_user_created_idx
  on public.coding_execution_requests (user_id, created_at desc);

alter table public.coding_execution_requests enable row level security;
revoke all on public.coding_execution_requests from public, anon, authenticated;
grant select, insert, delete on public.coding_execution_requests to service_role;

create or replace function public.reserve_coding_execution(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_recent_count integer;
begin
  if p_user_id is null then
    raise exception 'An authenticated user is required.'
      using errcode = '28000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text || ':coding-execution', 0)
  );

  delete from public.coding_execution_requests request
  where request.user_id = p_user_id
    and request.created_at < pg_catalog.now() - interval '1 day';

  select count(*)::integer
  into v_recent_count
  from public.coding_execution_requests request
  where request.user_id = p_user_id
    and request.created_at > pg_catalog.now() - interval '1 minute';

  if v_recent_count >= 5 then
    return false;
  end if;

  insert into public.coding_execution_requests (user_id) values (p_user_id);
  return true;
end;
$function$;

revoke all on function public.reserve_coding_execution(uuid) from public, anon, authenticated;
grant execute on function public.reserve_coding_execution(uuid) to service_role;

commit;

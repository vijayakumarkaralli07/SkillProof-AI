begin;

create table public.coding_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_id uuid not null references public.coding_test_sets(id) on delete restrict,
  language text not null check (char_length(btrim(language)) between 1 and 40),
  selected_question_count integer not null check (selected_question_count between 1 and 50),
  status text not null default 'in_progress' check (status in ('in_progress', 'paused', 'completed')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  remaining_seconds integer not null check (remaining_seconds >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index coding_test_attempts_user_started_idx
  on public.coding_test_attempts (user_id, started_at desc);

create unique index coding_test_attempts_one_active_per_user_idx
  on public.coding_test_attempts (user_id)
  where status in ('in_progress', 'paused');

create table public.coding_test_attempt_questions (
  attempt_id uuid not null references public.coding_test_attempts(id) on delete cascade,
  question_id uuid not null references public.coding_questions(id) on delete restrict,
  question_order integer not null check (question_order > 0),
  code_by_language jsonb not null default '{}'::jsonb
    check (jsonb_typeof(code_by_language) = 'object'),
  submitted_at timestamptz,
  primary key (attempt_id, question_id),
  unique (attempt_id, question_order)
);

create index coding_test_attempt_questions_question_idx
  on public.coding_test_attempt_questions (question_id);

alter table public.coding_test_attempts enable row level security;
alter table public.coding_test_attempt_questions enable row level security;

revoke all on public.coding_test_attempts, public.coding_test_attempt_questions
  from public, anon, authenticated;

grant select on public.coding_test_attempts, public.coding_test_attempt_questions to authenticated;
grant update (language, status, deadline_at, remaining_seconds, completed_at)
  on public.coding_test_attempts to authenticated;
grant update (code_by_language, submitted_at)
  on public.coding_test_attempt_questions to authenticated;

create policy "Students can read their own coding test attempts"
  on public.coding_test_attempts for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Students can update their own coding test attempts"
  on public.coding_test_attempts for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Students can read their own coding attempt questions"
  on public.coding_test_attempt_questions for select to authenticated
  using (
    exists (
      select 1
      from public.coding_test_attempts attempt
      where attempt.id = attempt_id
        and attempt.user_id = (select auth.uid())
    )
  );

create policy "Students can save answers to their own active attempts"
  on public.coding_test_attempt_questions for update to authenticated
  using (
    exists (
      select 1
      from public.coding_test_attempts attempt
      where attempt.id = attempt_id
        and attempt.user_id = (select auth.uid())
        and attempt.status = 'in_progress'
    )
  )
  with check (
    exists (
      select 1
      from public.coding_test_attempts attempt
      where attempt.id = attempt_id
        and attempt.user_id = (select auth.uid())
        and attempt.status = 'in_progress'
    )
  );

create or replace function public.start_coding_test(
  p_collection_id uuid,
  p_language text,
  p_requested_count integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_languages jsonb;
  v_duration_minutes integer;
  v_available_count integer;
  v_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to start a coding test.'
      using errcode = '28000';
  end if;

  if p_requested_count is null or p_requested_count < 1 or p_requested_count > 50 then
    raise exception 'Choose between 1 and 50 questions.'
      using errcode = '22023';
  end if;

  if p_language is null or char_length(btrim(p_language)) = 0 then
    raise exception 'Choose a supported programming language.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  if exists (
    select 1
    from public.coding_test_attempts active_attempt
    where active_attempt.user_id = v_user_id
      and active_attempt.status in ('in_progress', 'paused')
  ) then
    raise exception 'Pause or complete your active coding test before starting another.'
      using errcode = '23505';
  end if;

  select test_set.supported_languages, test_set.duration_minutes
  into v_languages, v_duration_minutes
  from public.coding_test_sets test_set
  where test_set.id = p_collection_id
    and test_set.publication_status = 'published'
  for share;

  if not found then
    raise exception 'The selected coding test collection is unavailable.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from pg_catalog.jsonb_array_elements_text(v_languages) as supported(language)
    where supported.language = p_language
  ) then
    raise exception 'The selected language is not supported by this collection.'
      using errcode = '22023';
  end if;

  select count(*)
  into v_available_count
  from public.coding_questions question
  where question.collection_id = p_collection_id
    and question.publication_status = 'published';

  if p_requested_count > v_available_count then
    raise exception 'This collection has only % published questions available.',
      v_available_count
      using errcode = '22023';
  end if;

  insert into public.coding_test_attempts (
    user_id,
    collection_id,
    language,
    selected_question_count,
    status,
    started_at,
    deadline_at,
    remaining_seconds
  )
  values (
    v_user_id,
    p_collection_id,
    p_language,
    p_requested_count,
    'in_progress',
    pg_catalog.now(),
    pg_catalog.now() + pg_catalog.make_interval(mins => v_duration_minutes),
    v_duration_minutes * 60
  )
  returning id into v_attempt_id;

  insert into public.coding_test_attempt_questions (
    attempt_id,
    question_id,
    question_order
  )
  select
    v_attempt_id,
    selected.question_id,
    selected.selection_order::integer
  from (
    select
      question.id as question_id,
      row_number() over (order by pg_catalog.random()) as selection_order
    from public.coding_questions question
    where question.collection_id = p_collection_id
      and question.publication_status = 'published'
  ) selected
  where selected.selection_order <= p_requested_count
  order by selected.selection_order;

  return v_attempt_id;
end;
$function$;

revoke all on function public.start_coding_test(uuid, text, integer) from public, anon;
grant execute on function public.start_coding_test(uuid, text, integer) to authenticated;

commit;

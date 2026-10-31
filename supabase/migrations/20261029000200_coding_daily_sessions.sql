begin;

alter table public.coding_test_attempts
  add column if not exists daily_session_date date;

comment on column public.coding_test_attempts.daily_session_date is
  'UTC calendar date for daily sessions created by start_coding_test; legacy attempts remain NULL.';

drop index if exists public.coding_test_attempts_one_active_per_track_idx;

create unique index if not exists coding_test_attempts_one_daily_session_per_track_idx
  on public.coding_test_attempts (user_id, collection_id, daily_session_date)
  where daily_session_date is not null;

create index if not exists coding_test_attempts_user_collection_day_idx
  on public.coding_test_attempts (user_id, collection_id, daily_session_date desc)
  where daily_session_date is not null;

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
  v_selected_count integer;
  v_session_date date := (pg_catalog.now() at time zone 'UTC')::date;
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
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_collection_id::text, 0)
  );

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

  select attempt.id
  into v_attempt_id
  from public.coding_test_attempts attempt
  where attempt.user_id = v_user_id
    and attempt.collection_id = p_collection_id
    and attempt.daily_session_date = v_session_date;

  if found then
    return v_attempt_id;
  end if;

  select count(*)::integer
  into v_available_count
  from public.coding_questions question
  where question.collection_id = p_collection_id
    and question.publication_status = 'published';

  if v_available_count = 0 then
    raise exception 'This collection has no published questions available.'
      using errcode = '22023';
  end if;

  v_selected_count := least(p_requested_count, v_available_count);

  insert into public.coding_test_attempts (
    user_id,
    collection_id,
    language,
    selected_question_count,
    status,
    started_at,
    deadline_at,
    remaining_seconds,
    daily_session_date
  )
  values (
    v_user_id,
    p_collection_id,
    p_language,
    v_selected_count,
    'in_progress',
    pg_catalog.now(),
    pg_catalog.now() + pg_catalog.make_interval(mins => v_duration_minutes),
    v_duration_minutes * 60,
    v_session_date
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
      row_number() over (
        order by
          (history.last_seen_at is not null),
          history.last_seen_at nulls first,
          question.question_order,
          question.id
      ) as selection_order
    from public.coding_questions question
    left join lateral (
      select max(attempt.started_at) as last_seen_at
      from public.coding_test_attempt_questions served_question
      join public.coding_test_attempts attempt
        on attempt.id = served_question.attempt_id
      where attempt.user_id = v_user_id
        and served_question.question_id = question.id
    ) history on true
    where question.collection_id = p_collection_id
      and question.publication_status = 'published'
  ) selected
  where selected.selection_order <= v_selected_count
  order by selected.selection_order;

  return v_attempt_id;
end;
$function$;

revoke all on function public.start_coding_test(uuid, text, integer) from public, anon;
grant execute on function public.start_coding_test(uuid, text, integer) to authenticated;

commit;

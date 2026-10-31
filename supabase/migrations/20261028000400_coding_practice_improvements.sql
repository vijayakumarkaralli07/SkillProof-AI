begin;

drop index if exists public.coding_test_attempts_one_active_per_user_idx;

create unique index coding_test_attempts_one_active_per_track_idx
  on public.coding_test_attempts (user_id, collection_id)
  where status in ('in_progress', 'paused');

create or replace function public.get_coding_question_availability()
returns table (
  collection_id uuid,
  published_count integer,
  eligible_count integer
)
language sql
stable
security definer
set search_path = ''
as $function$
  with question_counts as (
    select
      test_set.id as collection_id,
      count(question.id)::integer as published_count,
      count(question.id) filter (
        where not exists (
          select 1
          from public.coding_test_attempt_questions served_question
          join public.coding_test_attempts served_attempt
            on served_attempt.id = served_question.attempt_id
          where served_attempt.user_id = auth.uid()
            and served_question.question_id = question.id
        )
      )::integer as unseen_count
    from public.coding_test_sets test_set
    left join public.coding_questions question
      on question.collection_id = test_set.id
      and question.publication_status = 'published'
    where test_set.publication_status = 'published'
    group by test_set.id
  )
  select
    question_counts.collection_id,
    question_counts.published_count,
    case
      when question_counts.unseen_count = 0 then question_counts.published_count
      else question_counts.unseen_count
    end as eligible_count
  from question_counts;
$function$;

revoke all on function public.get_coding_question_availability() from public, anon;
grant execute on function public.get_coding_question_availability() to authenticated;

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
  v_unseen_count integer;
  v_selected_count integer;
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

  if exists (
    select 1
    from public.coding_test_attempts active_attempt
    where active_attempt.user_id = v_user_id
      and active_attempt.collection_id = p_collection_id
      and active_attempt.status in ('in_progress', 'paused')
  ) then
    raise exception 'An active attempt already exists for this track. Resume it instead.'
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

  if v_available_count = 0 then
    raise exception 'This collection has no published questions available.'
      using errcode = '22023';
  end if;

  select count(*)
  into v_unseen_count
  from public.coding_questions question
  where question.collection_id = p_collection_id
    and question.publication_status = 'published'
    and not exists (
      select 1
      from public.coding_test_attempt_questions served_question
      join public.coding_test_attempts served_attempt
        on served_attempt.id = served_question.attempt_id
      where served_attempt.user_id = v_user_id
        and served_question.question_id = question.id
    );

  v_selected_count := least(
    p_requested_count,
    case when v_unseen_count = 0 then v_available_count else v_unseen_count end
  );

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
    v_selected_count,
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
      and (
        v_unseen_count = 0
        or not exists (
          select 1
          from public.coding_test_attempt_questions served_question
          join public.coding_test_attempts served_attempt
            on served_attempt.id = served_question.attempt_id
          where served_attempt.user_id = v_user_id
            and served_question.question_id = question.id
        )
      )
  ) selected
  where selected.selection_order <= v_selected_count
  order by selected.selection_order;

  return v_attempt_id;
end;
$function$;

commit;

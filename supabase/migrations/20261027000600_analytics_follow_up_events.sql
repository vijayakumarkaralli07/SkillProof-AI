begin;

alter table public.application_status_history
  add column if not exists event_type text not null default 'status_changed';

alter table public.application_status_history
  add constraint application_status_history_event_type_check
  check (event_type in ('status_changed', 'follow_up_updated'));

create or replace function public.record_external_follow_up_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_follow_up text;
  next_follow_up text;
begin
  if auth.uid() is distinct from new.user_id then
    raise exception 'Application owner must be the authenticated user'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    return new;
  end if;

  previous_follow_up := nullif(btrim(old.application_data ->> 'followUpDate'), '');
  next_follow_up := nullif(btrim(new.application_data ->> 'followUpDate'), '');
  if previous_follow_up is not distinct from next_follow_up then
    return new;
  end if;

  insert into public.application_status_history (
    application_kind, application_id, job_id, applicant_id, employer_id,
    previous_status, new_status, changed_by, source, event_type, note,
    follow_up_date
  ) values (
    'external', new.application_record_id, new.job_id, new.user_id, null,
    new.status, new.status, auth.uid(), 'student_reported', 'follow_up_updated', '',
    next_follow_up::date
  );

  return new;
end;
$$;

revoke all on function public.record_external_follow_up_change() from public, anon, authenticated;

create trigger job_applications_follow_up_history
  after update of application_data on public.job_applications
  for each row execute function public.record_external_follow_up_change();

create or replace function public.record_native_follow_up_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_value text;
  note_value text;
begin
  if auth.uid() is distinct from new.applicant_id
    and auth.uid() is distinct from new.employer_id then
    raise exception 'Only the applicant or assigned employer may update this application'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status
    or new.follow_up_date is not distinct from old.follow_up_date then
    return new;
  end if;

  if auth.uid() = new.employer_id then
    source_value := 'employer_reported';
    note_value := coalesce(new.recruiter_note, '');
  else
    source_value := 'student_reported';
    note_value := coalesce(new.applicant_note, '');
  end if;

  insert into public.application_status_history (
    application_kind, application_id, job_id, applicant_id, employer_id,
    previous_status, new_status, changed_by, source, event_type, note,
    follow_up_date, assessment_at, interview_at
  ) values (
    'native', new.id, new.job_id::text, new.applicant_id, new.employer_id,
    new.status, new.status, auth.uid(), source_value, 'follow_up_updated', note_value,
    new.follow_up_date, new.assessment_at, new.interview_at
  );

  return new;
end;
$$;

revoke all on function public.record_native_follow_up_change() from public, anon, authenticated;

create trigger native_job_applications_follow_up_history
  after update of follow_up_date on public.native_job_applications
  for each row execute function public.record_native_follow_up_change();

commit;

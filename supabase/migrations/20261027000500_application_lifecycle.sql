begin;

alter table public.job_applications
  add column if not exists application_record_id uuid not null default gen_random_uuid();

create unique index if not exists job_applications_application_record_id_unique
  on public.job_applications (application_record_id);

update public.job_applications
set status = case status
  when 'prepared' then 'preparing'
  when 'submitted' then 'applied'
  when 'reviewing' then 'under_review'
  else status
end
where status in ('prepared', 'submitted', 'reviewing');

alter table public.job_applications
  add constraint job_applications_lifecycle_status_check
  check (status in ('saved', 'preparing', 'applied', 'assessment', 'under_review', 'interview', 'offer', 'rejected', 'withdrawn'));

alter table public.native_job_applications
  drop constraint native_job_applications_status_check;

update public.native_job_applications
set status = case status
  when 'submitted' then 'applied'
  when 'reviewing' then 'under_review'
  else status
end;

alter table public.native_job_applications
  add column applicant_note text not null default '',
  add column follow_up_date date,
  add column assessment_at timestamptz,
  add column interview_at timestamptz,
  add constraint native_job_applications_applicant_note_check check (char_length(applicant_note) <= 5000),
  add constraint native_job_applications_status_check
    check (status in ('saved', 'preparing', 'applied', 'assessment', 'under_review', 'interview', 'offer', 'rejected', 'withdrawn'));

revoke update on public.native_job_applications from authenticated;
revoke update (status, recruiter_note) on public.native_job_applications from authenticated;
grant update (status, applicant_note, follow_up_date, assessment_at, interview_at)
  on public.native_job_applications to authenticated;
grant update (status, recruiter_note, assessment_at, interview_at)
  on public.native_job_applications to authenticated;

create policy "Applicants can update their own lifecycle fields"
  on public.native_job_applications for update to authenticated
  using (applicant_id = auth.uid())
  with check (applicant_id = auth.uid());

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_kind text not null check (application_kind in ('native', 'external')),
  application_id uuid not null,
  job_id text not null,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  employer_id uuid references auth.users(id) on delete cascade,
  previous_status text,
  new_status text not null
    check (new_status in ('saved', 'preparing', 'applied', 'assessment', 'under_review', 'interview', 'offer', 'rejected', 'withdrawn')),
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  source text not null check (source in (
    'student_reported',
    'employer_reported',
    'verified_employer_integration',
    'platform_submission',
    'system_backfill'
  )),
  note text not null default '',
  follow_up_date date,
  assessment_at timestamptz,
  interview_at timestamptz
);

create index application_status_history_timeline_idx
  on public.application_status_history (application_id, changed_at, id);
create index application_status_history_applicant_idx
  on public.application_status_history (applicant_id, changed_at desc);
create index application_status_history_employer_idx
  on public.application_status_history (employer_id, changed_at desc)
  where employer_id is not null;

alter table public.application_status_history enable row level security;
revoke all on public.application_status_history from public, anon, authenticated;
grant select on public.application_status_history to authenticated;

create policy "Applicants and assigned employers can view status history"
  on public.application_status_history for select to authenticated
  using (applicant_id = auth.uid() or employer_id = auth.uid());

create or replace function public.record_external_application_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_value text := 'student_reported';
  detail jsonb;
begin
  if auth.uid() is distinct from new.user_id then
    raise exception 'Application owner must be the authenticated user'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id
      or new.job_id is distinct from old.job_id
      or new.application_record_id is distinct from old.application_record_id then
      raise exception 'Application identity and ownership cannot be changed'
        using errcode = '42501';
    end if;
  end if;

  detail := case when jsonb_typeof(new.application_data) = 'object' then new.application_data else '{}'::jsonb end;

  if detail ->> 'sourceType' = 'himalayas'
    and new.status = 'applied'
    and detail ->> 'externalTrackingStatus' is distinct from 'user_confirmed_submitted' then
    raise exception 'Confirm the external submission before marking it applied'
      using errcode = '23514';
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.application_status_history (
      application_kind, application_id, job_id, applicant_id, employer_id,
      previous_status, new_status, changed_by, source, note,
      follow_up_date, assessment_at, interview_at
    ) values (
      'external', new.application_record_id, new.job_id, new.user_id, null,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status, auth.uid(), source_value,
      coalesce(detail ->> 'notes', ''),
      nullif(detail ->> 'followUpDate', '')::date,
      nullif(detail ->> 'assessmentAt', '')::timestamptz,
      nullif(detail ->> 'interviewAt', '')::timestamptz
    );
  end if;

  return new;
end;
$$;

revoke all on function public.record_external_application_status() from public, anon, authenticated;

create trigger job_applications_status_history
  before insert or update on public.job_applications
  for each row execute function public.record_external_application_status();

create or replace function public.finalize_native_application_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'applied';
    return new;
  end if;

  if auth.uid() = new.applicant_id then
    if new.employer_id is distinct from old.employer_id
      or new.applicant_id is distinct from old.applicant_id
      or new.job_id is distinct from old.job_id
      or new.recruiter_note is distinct from old.recruiter_note
      or new.applicant_profile is distinct from old.applicant_profile
      or new.resume_snapshot is distinct from old.resume_snapshot
      or new.cover_letter is distinct from old.cover_letter
      or new.answers is distinct from old.answers then
      raise exception 'Applicants may update only their own lifecycle details'
        using errcode = '42501';
    end if;
  elsif auth.uid() = new.employer_id then
    if new.employer_id is distinct from old.employer_id
      or new.applicant_id is distinct from old.applicant_id
      or new.job_id is distinct from old.job_id
      or new.applicant_note is distinct from old.applicant_note
      or new.follow_up_date is distinct from old.follow_up_date
      or new.applicant_profile is distinct from old.applicant_profile
      or new.resume_snapshot is distinct from old.resume_snapshot
      or new.cover_letter is distinct from old.cover_letter
      or new.answers is distinct from old.answers then
      raise exception 'Employers may update only their review fields'
        using errcode = '42501';
    end if;
  else
    raise exception 'Only the applicant or assigned employer may update this application'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.finalize_native_application_lifecycle() from public, anon, authenticated;

create trigger zzz_native_application_lifecycle_guard
  before insert or update on public.native_job_applications
  for each row execute function public.finalize_native_application_lifecycle();

create or replace function public.record_native_application_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_value text;
  status_changed boolean;
begin
  status_changed := tg_op = 'INSERT' or new.status is distinct from old.status;
  if not status_changed then
    return new;
  end if;

  source_value := case
    when tg_op = 'INSERT' then 'platform_submission'
    when auth.uid() = new.employer_id then 'employer_reported'
    else 'student_reported'
  end;

  insert into public.application_status_history (
    application_kind, application_id, job_id, applicant_id, employer_id,
    previous_status, new_status, changed_by, source, note,
    follow_up_date, assessment_at, interview_at
  ) values (
    'native', new.id, new.job_id::text, new.applicant_id, new.employer_id,
    case when tg_op = 'INSERT' then null else old.status end,
    new.status, auth.uid(), source_value,
    case when auth.uid() = new.employer_id then coalesce(new.recruiter_note, '') else coalesce(new.applicant_note, '') end,
    new.follow_up_date, new.assessment_at, new.interview_at
  );

  return new;
end;
$$;

revoke all on function public.record_native_application_status() from public, anon, authenticated;

create trigger native_job_applications_status_history
  after insert or update on public.native_job_applications
  for each row execute function public.record_native_application_status();

insert into public.application_status_history (
  application_kind, application_id, job_id, applicant_id, employer_id,
  previous_status, new_status, changed_by, source, note
)
select
  'external', application_record_id, job_id, user_id, null,
  null, status, null, 'system_backfill', coalesce(notes, '')
from public.job_applications
on conflict do nothing;

insert into public.application_status_history (
  application_kind, application_id, job_id, applicant_id, employer_id,
  previous_status, new_status, changed_by, source, note,
  follow_up_date, assessment_at, interview_at
)
select
  'native', id, job_id::text, applicant_id, employer_id,
  null, status, null, 'system_backfill', coalesce(applicant_note, ''),
  follow_up_date, assessment_at, interview_at
from public.native_job_applications
on conflict do nothing;

commit;

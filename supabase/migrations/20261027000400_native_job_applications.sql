begin;

create or replace function public.native_job_fields_are_valid(fields jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  field jsonb;
  field_id text;
  field_label text;
  field_ids text[] := array[]::text[];
begin
  if jsonb_typeof(fields) is distinct from 'array' then
    return false;
  end if;
  if jsonb_array_length(fields) > 25 then
    return false;
  end if;

  for field in select value from jsonb_array_elements(fields) as items(value)
  loop
    field_id := field ->> 'id';
    field_label := field ->> 'label';
    if jsonb_typeof(field) <> 'object'
      or field_id is null
      or field_id !~ '^[A-Za-z0-9_-]{1,60}$'
      or field_label is null
      or char_length(btrim(field_label)) not between 1 and 160
      or field ->> 'type' is null
      or field ->> 'type' not in ('text', 'textarea', 'url')
      or jsonb_typeof(field -> 'required') is distinct from 'boolean' then
      return false;
    end if;
    if field_id = any(field_ids) then
      return false;
    end if;
    field_ids := array_append(field_ids, field_id);
  end loop;

  return true;
end;
$$;

create table public.native_jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  company_name text not null check (char_length(btrim(company_name)) between 1 and 160),
  location text not null default '',
  employment_type text not null default '',
  description text not null check (char_length(btrim(description)) between 1 and 30000),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  required_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint native_jobs_required_fields_check
    check (public.native_job_fields_are_valid(required_fields)),
  constraint native_jobs_id_employer_unique unique (id, employer_id)
);

create index native_jobs_status_created_idx
  on public.native_jobs (status, created_at desc);
create index native_jobs_employer_created_idx
  on public.native_jobs (employer_id, created_at desc);

alter table public.native_jobs enable row level security;
revoke all on public.native_jobs from public, anon, authenticated;
grant select on public.native_jobs to authenticated;

create policy "Authenticated users can view open native jobs"
  on public.native_jobs for select to authenticated
  using (status = 'open' or employer_id = auth.uid());

create table public.native_job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  employer_id uuid not null references auth.users(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  applicant_profile jsonb not null,
  resume_id uuid not null,
  resume_title text not null,
  resume_template text not null,
  resume_snapshot jsonb not null,
  resume_reviewed boolean not null default false,
  cover_letter text not null default '',
  answers jsonb not null default '{}'::jsonb,
  job_title text not null default '',
  company_name text not null default '',
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'interview', 'offer', 'rejected')),
  recruiter_note text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint native_job_applications_job_owner_fkey
    foreign key (job_id, employer_id)
    references public.native_jobs (id, employer_id) on delete cascade,
  constraint native_job_applications_cover_letter_check
    check (char_length(cover_letter) <= 20000),
  constraint native_job_applications_recruiter_note_check
    check (char_length(recruiter_note) <= 5000),
  constraint native_job_applications_resume_size_check
    check (octet_length(resume_snapshot::text) <= 200000),
  constraint native_job_applications_answers_size_check
    check (octet_length(answers::text) <= 100000),
  constraint native_job_applications_profile_size_check
    check (octet_length(applicant_profile::text) <= 10000),
  constraint native_job_applications_unique_applicant_job
    unique (applicant_id, job_id)
);

create index native_job_applications_employer_submitted_idx
  on public.native_job_applications (employer_id, submitted_at desc);
create index native_job_applications_applicant_submitted_idx
  on public.native_job_applications (applicant_id, submitted_at desc);

create or replace function public.validate_native_job_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.native_jobs%rowtype;
  saved_resume public.resumes%rowtype;
  required_field jsonb;
  required_id text;
  answer_value text;
begin
  if auth.uid() is null or new.applicant_id <> auth.uid() then
    raise exception 'Application applicant must be the authenticated user'
      using errcode = '42501';
  end if;

  select * into target_job
  from public.native_jobs
  where id = new.job_id;

  if not found or target_job.status <> 'open' then
    raise exception 'This SkillProof AI job is not accepting applications'
      using errcode = '23514';
  end if;

  if new.employer_id <> target_job.employer_id then
    raise exception 'Application employer does not own this job'
      using errcode = '23514';
  end if;

  if jsonb_typeof(new.applicant_profile) <> 'object'
    or nullif(btrim(new.applicant_profile ->> 'name'), '') is null
    or nullif(btrim(new.applicant_profile ->> 'email'), '') is null
    or auth.jwt() ->> 'email' is null
    or lower(new.applicant_profile ->> 'email') <> lower(auth.jwt() ->> 'email') then
    raise exception 'Applicant name and email are required'
      using errcode = '23514';
  end if;

  if new.resume_reviewed is not true then
    raise exception 'Review the selected resume before submitting'
      using errcode = '23514';
  end if;

  select * into saved_resume
  from public.resumes
  where user_id = new.applicant_id
    and id = new.resume_id;

  if not found
    or saved_resume.content is distinct from new.resume_snapshot
    or coalesce(saved_resume.title, saved_resume.name) is distinct from new.resume_title
    or saved_resume.template_id is distinct from new.resume_template then
    raise exception 'Selected resume does not match the saved applicant resume'
      using errcode = '23514';
  end if;

  if jsonb_typeof(new.answers) <> 'object'
    or octet_length(new.resume_snapshot::text) > 200000
    or octet_length(new.answers::text) > 100000
    or octet_length(new.applicant_profile::text) > 10000
    or char_length(new.cover_letter) > 20000 then
    raise exception 'Application content is invalid or too large'
      using errcode = '23514';
  end if;

  for required_field in
    select value
    from jsonb_array_elements(target_job.required_fields) as fields(value)
  loop
    if (required_field ->> 'required')::boolean then
      required_id := required_field ->> 'id';
      answer_value := new.answers ->> required_id;
      if nullif(btrim(answer_value), '') is null then
        raise exception 'Complete all required job application fields'
          using errcode = '23514';
      end if;
      if char_length(answer_value) > 5000 then
        raise exception 'Job application answers must be 5,000 characters or fewer'
          using errcode = '23514';
      end if;
    else
      required_id := required_field ->> 'id';
      answer_value := new.answers ->> required_id;
      if answer_value is not null and char_length(answer_value) > 5000 then
        raise exception 'Job application answers must be 5,000 characters or fewer'
          using errcode = '23514';
      end if;
    end if;

    required_id := required_field ->> 'id';
    answer_value := new.answers ->> required_id;
    if required_field ->> 'type' = 'url'
      and nullif(btrim(answer_value), '') is not null
      and answer_value !~* '^https?://[^/@[:space:]]+(:[0-9]+)?([/?#]|$)' then
      raise exception 'Enter a valid HTTP or HTTPS URL for the job application field'
        using errcode = '23514';
    end if;
  end loop;

  new.job_title := target_job.title;
  new.company_name := target_job.company_name;
  new.status := 'submitted';
  new.recruiter_note := '';
  new.submitted_at := now();
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.validate_native_job_application() from public, anon, authenticated;

create trigger native_job_application_validate_insert
  before insert on public.native_job_applications
  for each row execute function public.validate_native_job_application();

create or replace function public.set_native_application_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger native_jobs_set_updated_at
  before update on public.native_jobs
  for each row execute function public.set_native_application_updated_at();

create trigger native_job_applications_set_updated_at
  before update on public.native_job_applications
  for each row execute function public.set_native_application_updated_at();

alter table public.native_job_applications enable row level security;
revoke all on public.native_job_applications from public, anon, authenticated;
grant select, insert on public.native_job_applications to authenticated;
grant update (status, recruiter_note) on public.native_job_applications to authenticated;

create policy "Applicants and assigned employers can view native applications"
  on public.native_job_applications for select to authenticated
  using (applicant_id = auth.uid() or employer_id = auth.uid());

create policy "Applicants can submit to open native jobs"
  on public.native_job_applications for insert to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1
      from public.native_jobs as job
      where job.id = native_job_applications.job_id
        and job.employer_id = native_job_applications.employer_id
        and job.status = 'open'
    )
  );

create policy "Assigned employers can update application status"
  on public.native_job_applications for update to authenticated
  using (employer_id = auth.uid())
  with check (employer_id = auth.uid());

commit;

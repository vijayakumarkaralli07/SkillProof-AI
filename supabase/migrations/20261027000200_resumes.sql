begin;

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  content jsonb not null default '{}'::jsonb,
  resume_type text not null default 'general' check (resume_type in ('general', 'job-tailored')),
  job_title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;
revoke all on public.resumes from public, anon;
grant select, insert on public.resumes to authenticated;

create policy "Users can view their own resumes"
  on public.resumes for select to authenticated
  using (user_id = auth.uid());
create policy "Users can create their own resumes"
  on public.resumes for insert to authenticated
  with check (user_id = auth.uid());

commit;

begin;

alter table public.resumes
  add column if not exists title text not null default '',
  add column if not exists template_id text not null default 'modern',
  add column if not exists status text not null default 'draft';

update public.resumes
set title = name
where title = '';

alter table public.resumes
  add constraint resumes_title_check check (char_length(btrim(title)) between 1 and 120),
  add constraint resumes_template_id_check check (char_length(btrim(template_id)) between 1 and 80),
  add constraint resumes_status_check check (status in ('draft', 'final'));

create unique index if not exists resumes_user_id_id_unique
  on public.resumes (user_id, id);
create index if not exists resumes_user_updated_at_idx
  on public.resumes (user_id, updated_at desc);

alter table public.resumes enable row level security;
revoke all on public.resumes from public, anon;
grant select, insert, update, delete on public.resumes to authenticated;

drop policy if exists "Users can view their own resumes" on public.resumes;
drop policy if exists "Users can create their own resumes" on public.resumes;
drop policy if exists "resume_owner_access" on public.resumes;
create policy "resume_owner_access"
  on public.resumes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.resume_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid,
  file_name text not null check (char_length(file_name) between 1 and 255),
  file_type text not null check (file_type in ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  ats_score integer check (ats_score is null or ats_score between 0 and 100),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resume_scans_user_resume_fkey
    foreign key (user_id, resume_id) references public.resumes (user_id, id) on delete set null (resume_id)
);

create index resume_scans_user_created_at_idx
  on public.resume_scans (user_id, created_at desc);
create index resume_scans_resume_id_idx
  on public.resume_scans (resume_id)
  where resume_id is not null;

alter table public.resume_scans enable row level security;
revoke all on public.resume_scans from public, anon;
grant select, insert, update, delete on public.resume_scans to authenticated;

create policy "resume_scan_owner_access"
  on public.resume_scans for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.set_resume_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_resume_updated_at();

create trigger resume_scans_set_updated_at
  before update on public.resume_scans
  for each row execute function public.set_resume_updated_at();

commit;

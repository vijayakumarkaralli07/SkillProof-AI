begin;

create table if not exists public.profiles (
  user_id uuid primary key,
  name text not null default '',
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  education jsonb not null default '[]'::jsonb,
  profile_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.career_preferences (
  user_id uuid primary key,
  interests text[] not null default '{}',
  priorities text[] not null default '{}',
  background text not null default '',
  experience_level text not null default '',
  education text not null default '',
  technologies text[] not null default '{}',
  study_time text not null default '',
  goal text not null default '',
  timeline text not null default '',
  target_role text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.selected_career_paths (
  user_id uuid not null,
  path_id text not null,
  role_id text not null default '',
  role_title text not null default '',
  selected_role text not null default '',
  selected_path text not null default '',
  discovery_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, path_id)
);

create table if not exists public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  career_path_id text not null,
  target_role text not null default '',
  plan_data jsonb not null default '{}'::jsonb,
  duration_weeks integer not null default 12,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, career_path_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null,
  learning_plan_id uuid not null,
  task_id text not null,
  lesson_id text,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, learning_plan_id, task_id)
);

create table if not exists public.practice_attempts (
  user_id uuid not null,
  attempt_id text not null,
  language text not null default '',
  topic text not null default '',
  score numeric,
  total_questions integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  attempt_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, attempt_id)
);

create table if not exists public.user_projects (
  user_id uuid not null,
  project_id text not null,
  status text not null default 'saved',
  milestones text[] not null default '{}',
  progress jsonb not null default '{}'::jsonb,
  attempt_data jsonb not null default '{}'::jsonb,
  project_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists public.saved_jobs (
  user_id uuid not null,
  job_id text not null,
  title text not null default '',
  company text not null default '',
  source text not null default '',
  source_url text not null default '',
  original_url text not null default '',
  job_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table if not exists public.job_applications (
  user_id uuid not null,
  job_id text not null,
  job_title text not null default '',
  company text not null default '',
  location text not null default '',
  status text not null default 'saved',
  applied_at timestamptz,
  notes text not null default '',
  application_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

commit;
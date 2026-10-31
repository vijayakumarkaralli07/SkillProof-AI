begin;

alter table public.saved_jobs add column if not exists job_data jsonb not null default '{}'::jsonb;

do $$
declare
  target_table text;
  table_oid oid;
  user_id_type oid;
  user_id_attnum smallint;
begin
  foreach target_table in array array[
    'profiles',
    'career_preferences',
    'selected_career_paths',
    'learning_plans',
    'lesson_progress',
    'practice_attempts',
    'user_projects',
    'saved_jobs',
    'job_applications'
  ] loop
    if to_regclass(format('public.%I', target_table)) is null then
      raise exception 'Required table public.% is missing; reconcile the existing schema before applying this migration.', target_table;
    end if;

    execute format('alter table public.%I enable row level security', target_table);
    execute format('revoke all on public.%I from public, anon', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);

    table_oid := to_regclass(format('public.%I', target_table));
    select atttypid, attnum into user_id_type, user_id_attnum
    from pg_attribute
    where attrelid = table_oid and attname = 'user_id' and not attisdropped;
    if user_id_type = 'uuid'::regtype and not exists (
      select 1 from pg_constraint
      where conrelid = table_oid and confrelid = 'auth.users'::regclass
        and contype = 'f' and conkey @> array[user_id_attnum]::smallint[]
    ) then
      execute format('alter table public.%I add constraint %I foreign key (user_id) references auth.users(id) on delete cascade', target_table, target_table || '_user_id_fkey');
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = 'skillproof_user_owns_records'
    ) then
      execute format(
        'create policy skillproof_user_owns_records on public.%I as permissive for all to authenticated using (user_id::text = auth.uid()::text) with check (user_id::text = auth.uid()::text)',
        target_table
      );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = target_table and policyname = 'skillproof_restrict_to_owner'
    ) then
      execute format(
        'create policy skillproof_restrict_to_owner on public.%I as restrictive for all to authenticated using (user_id::text = auth.uid()::text) with check (user_id::text = auth.uid()::text)',
        target_table
      );
    end if;
  end loop;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.lesson_progress'::regclass
      and confrelid = 'public.learning_plans'::regclass and contype = 'f'
  ) then
    if (select atttypid from pg_attribute where attrelid = 'public.lesson_progress'::regclass and attname = 'learning_plan_id' and not attisdropped)
      = (select atttypid from pg_attribute where attrelid = 'public.learning_plans'::regclass and attname = 'id' and not attisdropped) then
      alter table public.lesson_progress add constraint lesson_progress_learning_plan_fkey
        foreign key (learning_plan_id) references public.learning_plans(id) on delete cascade;
    end if;
  end if;

end $$;

create unique index if not exists profiles_user_id_unique on public.profiles (user_id);
create unique index if not exists career_preferences_user_id_unique on public.career_preferences (user_id);
create unique index if not exists selected_career_paths_user_path_unique on public.selected_career_paths (user_id, path_id);
create unique index if not exists learning_plans_user_path_unique on public.learning_plans (user_id, career_path_id);
create unique index if not exists lesson_progress_user_plan_task_unique on public.lesson_progress (user_id, learning_plan_id, task_id);
create unique index if not exists practice_attempts_user_attempt_unique on public.practice_attempts (user_id, attempt_id);
create unique index if not exists user_projects_user_project_unique on public.user_projects (user_id, project_id);
create unique index if not exists saved_jobs_user_job_unique on public.saved_jobs (user_id, job_id);
create unique index if not exists job_applications_user_job_unique on public.job_applications (user_id, job_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.learning_plans'::regclass
      and confrelid = 'public.selected_career_paths'::regclass and contype = 'f'
  ) and (select atttypid from pg_attribute where attrelid = 'public.learning_plans'::regclass and attname = 'career_path_id' and not attisdropped)
    = (select atttypid from pg_attribute where attrelid = 'public.selected_career_paths'::regclass and attname = 'path_id' and not attisdropped) then
    alter table public.learning_plans add constraint learning_plans_user_path_fkey
      foreign key (user_id, career_path_id) references public.selected_career_paths(user_id, path_id) on delete cascade;
  end if;
end $$;

commit;
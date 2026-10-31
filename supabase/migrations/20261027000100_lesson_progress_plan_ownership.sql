begin;

create unique index if not exists learning_plans_user_id_id_unique
  on public.learning_plans (user_id, id);

do $$
declare
  progress_user_id_type oid;
  progress_plan_id_type oid;
  plan_user_id_type oid;
  plan_id_type oid;
begin
  select atttypid into progress_user_id_type
  from pg_attribute
  where attrelid = 'public.lesson_progress'::regclass and attname = 'user_id' and not attisdropped;

  select atttypid into progress_plan_id_type
  from pg_attribute
  where attrelid = 'public.lesson_progress'::regclass and attname = 'learning_plan_id' and not attisdropped;

  select atttypid into plan_user_id_type
  from pg_attribute
  where attrelid = 'public.learning_plans'::regclass and attname = 'user_id' and not attisdropped;

  select atttypid into plan_id_type
  from pg_attribute
  where attrelid = 'public.learning_plans'::regclass and attname = 'id' and not attisdropped;

  if progress_user_id_type = plan_user_id_type and progress_plan_id_type = plan_id_type
    and not exists (
      select 1 from pg_constraint
      where conrelid = 'public.lesson_progress'::regclass
        and conname = 'lesson_progress_user_plan_owner_fkey'
    ) then
    alter table public.lesson_progress
      add constraint lesson_progress_user_plan_owner_fkey
      foreign key (user_id, learning_plan_id)
      references public.learning_plans (user_id, id)
      on delete cascade not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lesson_progress'
      and policyname = 'skillproof_progress_plan_owner'
  ) then
    create policy skillproof_progress_plan_owner
      on public.lesson_progress as restrictive for all to authenticated
      using (
        user_id::text = auth.uid()::text
        and exists (
          select 1 from public.learning_plans as owned_plan
          where owned_plan.id::text = lesson_progress.learning_plan_id::text
            and owned_plan.user_id::text = auth.uid()::text
        )
      )
      with check (
        user_id::text = auth.uid()::text
        and exists (
          select 1 from public.learning_plans as owned_plan
          where owned_plan.id::text = lesson_progress.learning_plan_id::text
            and owned_plan.user_id::text = auth.uid()::text
        )
      );
  end if;
end $$;

commit;
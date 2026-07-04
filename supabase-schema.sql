create extension if not exists pgcrypto;

create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{"playersDatabase": [], "ranking": {}, "history": []}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.app_state (id, payload)
values ('global', '{"playersDatabase": [], "ranking": {}, "history": []}'::jsonb)
on conflict (id) do nothing;

alter table public.app_state enable row level security;

drop policy if exists "Public can read app state" on public.app_state;
create policy "Public can read app state"
on public.app_state
for select
using (true);

drop policy if exists "Public can upsert app state" on public.app_state;
create policy "Public can upsert app state"
on public.app_state
for all
using (true)
with check (true);

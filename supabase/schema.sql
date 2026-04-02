create table if not exists public.pc_builds (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subtotal numeric not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.pc_builds enable row level security;

create policy "users can insert own builds"
  on public.pc_builds
  for insert
  with check (auth.uid() = user_id);

create policy "users can read own builds"
  on public.pc_builds
  for select
  using (auth.uid() = user_id);

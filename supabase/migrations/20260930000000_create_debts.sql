-- Kasbon: tabel debts + RLS strict
-- Cara jalanin: Dashboard > SQL Editor > paste > Run
-- atau: npx supabase db push (setelah supabase link)

do $$ begin
  create type debt_type as enum ('owed_to_me', 'i_owe');
exception when duplicate_object then null;
end $$;

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type debt_type not null,
  counterpart_name text not null check (char_length(counterpart_name) >= 1 and char_length(counterpart_name) <= 100),
  amount bigint not null check (amount > 0),
  note text check (char_length(note) <= 200),
  due_date date,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists debts_user_id_idx on public.debts(user_id);
create index if not exists debts_settled_at_idx on public.debts(settled_at);
create index if not exists debts_created_at_idx on public.debts(created_at desc);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists set_debts_updated_at on public.debts;
create trigger set_debts_updated_at
  before update on public.debts
  for each row execute function public.handle_updated_at();

alter table public.debts enable row level security;

drop policy if exists "user_select_own" on public.debts;
drop policy if exists "user_insert_own" on public.debts;
drop policy if exists "user_update_own" on public.debts;
drop policy if exists "user_delete_own" on public.debts;

create policy "user_select_own" on public.debts
  for select using (auth.uid() = user_id);

create policy "user_insert_own" on public.debts
  for insert with check (auth.uid() = user_id);

create policy "user_update_own" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_delete_own" on public.debts
  for delete using (auth.uid() = user_id);

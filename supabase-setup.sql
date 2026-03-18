-- FinanzasPro - Supabase Schema
-- Ejecuta esto en Supabase > SQL Editor

-- INCOMES
create table if not exists incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  category text not null,
  date text not null,
  month text not null,
  created_at timestamptz default now()
);
alter table incomes enable row level security;
create policy "users see own incomes" on incomes for all using (auth.uid() = user_id);

-- EXPENSES
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  category text not null,
  date text not null,
  month text not null,
  created_at timestamptz default now()
);
alter table expenses enable row level security;
create policy "users see own expenses" on expenses for all using (auth.uid() = user_id);

-- BUDGET ITEMS
create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  estimated_amount numeric not null,
  category text not null,
  month text not null,
  spent boolean default false,
  created_at timestamptz default now()
);
alter table budget_items enable row level security;
create policy "users see own budget" on budget_items for all using (auth.uid() = user_id);

-- PROSPECTIVE EXPENSES
create table if not exists prospective_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  month text not null,
  created_at timestamptz default now()
);
alter table prospective_expenses enable row level security;
create policy "users see own prospective" on prospective_expenses for all using (auth.uid() = user_id);

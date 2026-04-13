-- ============================================================
-- POWER KOMBUCHA — B2B customers table migration
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.b2b_customers (
  id        uuid default uuid_generate_v4() primary key,
  nombre    text not null,
  empresa   text,
  telefono  text,
  email     text,
  direccion text,
  notas     text,
  created_at timestamptz default now()
);

alter table public.b2b_customers enable row level security;

-- Only authenticated admins can access B2B customer data
create policy "admin all b2b_customers"
  on public.b2b_customers
  for all
  using (auth.role() = 'authenticated');

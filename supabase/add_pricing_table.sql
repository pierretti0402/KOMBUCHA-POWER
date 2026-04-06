-- ============================================================
-- POWER KOMBUCHA — Pricing table migration
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.pricing (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value numeric(12,2) not null default 0,
  label text,
  updated_at timestamptz default now()
);

alter table public.pricing enable row level security;

create policy "public read pricing" on public.pricing for select using (true);
create policy "admin all pricing" on public.pricing for all using (auth.role() = 'authenticated');

-- Initial data (upsert so re-running is safe)
insert into public.pricing (key, value, label) values
  ('cost_per_unit',          0,     'Costo de la lata (por unidad)'),
  ('shipping_cost_per_unit', 0,     'Costo de traslado (por unidad)'),
  ('price_b2c',              0,     'Precio B2C (precio al público)'),
  ('price_b2b',              0,     'Precio B2B (precio mayorista)'),
  ('pack_price_3',           12000, 'Pack 3 unidades'),
  ('pack_price_6',           21000, 'Pack 6 unidades'),
  ('pack_price_12',          40000, 'Pack 12 unidades'),
  ('pack_price_24',          74000, 'Pack 24 unidades')
on conflict (key) do update set
  value      = excluded.value,
  updated_at = now();

-- ============================================================
-- POWER KOMBUCHA — Add estado column to b2b_customers
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.b2b_customers
  add column if not exists estado text
    not null
    default 'Prospecto'
    check (estado in ('Activo', 'Inactivo', 'Prospecto', 'En pausa'));

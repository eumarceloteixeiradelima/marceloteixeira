-- ═══════════════════════════════════════════════════════
-- SCHEMA — Dashboard Fiscalização (Supabase)
-- Cole este SQL no Supabase Dashboard > SQL Editor > New query
-- ═══════════════════════════════════════════════════════

-- 1. Dados do dashboard
create table if not exists dashboard_data (
  id uuid default gen_random_uuid() primary key,
  section text unique not null,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2. Snapshots históricos de campanhas
create table if not exists campaign_snapshots (
  id uuid default gen_random_uuid() primary key,
  bm text not null,
  brand text,
  data jsonb not null,
  fetched_at timestamptz default now()
);

-- ═══ Row Level Security ═══
alter table dashboard_data enable row level security;
alter table campaign_snapshots enable row level security;

-- Acesso público total (dashboard interno sem autenticação)
create policy "public_all" on dashboard_data for all using (true) with check (true);
create policy "public_all" on campaign_snapshots for all using (true) with check (true);

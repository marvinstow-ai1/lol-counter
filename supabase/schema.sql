-- LoL Counter App - Supabase Schema
-- Run this in the Supabase SQL Editor before seed.sql

create table if not exists counters (
    id bigserial primary key,
    champion_id text not null,
    counter_id text not null,
    counter_role text,
    win_rate numeric(5,2),
    tier text check (tier in ('S','A','B','C','D')) default 'B',
    notes text,
    patch text,
    updated_at timestamptz default now(),
    unique(champion_id, counter_id, counter_role)
);

create table if not exists counter_items (
    id bigserial primary key,
    champion_id text not null,
    item_id text not null,
    reason text,
    priority integer default 1,
    patch text,
    updated_at timestamptz default now(),
    unique(champion_id, item_id)
);

create index if not exists idx_counters_champion on counters(champion_id);
create index if not exists idx_counter_items_champion on counter_items(champion_id);

-- Enable Row Level Security with public read access
alter table counters enable row level security;
alter table counter_items enable row level security;

drop policy if exists "Public read counters" on counters;
create policy "Public read counters"
    on counters for select
    using (true);

drop policy if exists "Public read counter_items" on counter_items;
create policy "Public read counter_items"
    on counter_items for select
    using (true);

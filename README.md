# Rift Counter

A modern League of Legends counter-pick & counter-item finder.

- **Search** any champion (fuzzy autocomplete)
- **Counter champions** across **all roles** (S/A/B/C tier + win-rate bar)
- **Counter items** with reasons, gold cost, and tooltips
- **Favorites + history** stored locally
- **Always patch-current** via [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- **Counter data** from a Supabase Postgres database (curated seed included)

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom glassmorphism dark theme)
- Supabase (Postgres + RLS, public read access)
- Riot Data Dragon (CDN, no API key required)
- Hosted on Vercel

## Quickstart

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full step-by-step guide.

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

## Updating counter data

Edit `supabase/seed.sql` and re-run it in the Supabase SQL editor, or insert
rows manually. The schema:

- `counters(champion_id, counter_id, counter_role, win_rate, tier, notes, patch)`
- `counter_items(champion_id, item_id, reason, priority, patch)`

`champion_id` and `counter_id` must match Data Dragon IDs (e.g. `Yasuo`,
`MasterYi`, `Kaisa`). `item_id` must match Data Dragon item numbers.

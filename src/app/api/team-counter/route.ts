import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getChampions, getItems, getLatestVersion } from "@/lib/ddragon";
import { scoreTeam, type Role, type CounterRow, type ItemRow } from "@/lib/teamScore";

export async function POST(req: NextRequest) {
  let body: { enemies?: string[]; role?: Role };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const enemies = (body.enemies ?? []).filter(Boolean);
  const role = (body.role ?? "ALL") as Role;

  if (enemies.length < 2) {
    return NextResponse.json(
      { error: "at least 2 enemy champions required" },
      { status: 400 }
    );
  }
  if (enemies.length > 5) {
    return NextResponse.json(
      { error: "max 5 enemy champions allowed" },
      { status: 400 }
    );
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase env vars missing on server" },
      { status: 500 }
    );
  }

  const [version, champions, items] = await Promise.all([
    getLatestVersion(),
    getChampions(),
    getItems(),
  ]);

  // Validate enemy ids
  const unknown = enemies.filter((e) => !champions[e]);
  if (unknown.length) {
    return NextResponse.json(
      { error: `unknown champion ids: ${unknown.join(", ")}` },
      { status: 400 }
    );
  }

  const [{ data: counterRows, error: cErr }, { data: itemRows, error: iErr }] =
    await Promise.all([
      supabase.from("counters").select("*").in("champion_id", enemies),
      supabase.from("counter_items").select("*").in("champion_id", enemies),
    ]);

  if (cErr || iErr) {
    return NextResponse.json(
      { error: `Supabase: ${(cErr ?? iErr)?.message}` },
      { status: 500 }
    );
  }

  const { recommendations, overlapItems } = scoreTeam({
    enemies,
    role,
    counterRows: (counterRows ?? []) as CounterRow[],
    itemRows: (itemRows ?? []) as ItemRow[],
  });

  // Hydrate with Data Dragon details
  const enrichedRecs = recommendations
    .map((r) => ({
      ...r,
      champion: champions[r.candidateId] ?? null,
    }))
    .filter((r) => r.champion);

  const enrichedOverlap = overlapItems
    .map((o) => ({
      ...o,
      item: items[o.item_id] ?? null,
    }))
    .filter((o) => o.item);

  const enrichedEnemies = enemies.map((id) => ({
    id,
    champion: champions[id] ?? null,
  }));

  return NextResponse.json({
    version,
    enemies: enrichedEnemies,
    overlapItems: enrichedOverlap,
    recommendations: enrichedRecs,
  });
}

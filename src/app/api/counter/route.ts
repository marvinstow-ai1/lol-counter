import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getChampions, getItems, getLatestVersion } from "@/lib/ddragon";

export const revalidate = 600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const championId = searchParams.get("champion");

  if (!championId) {
    return NextResponse.json({ error: "missing ?champion=" }, { status: 400 });
  }

  const [version, champions, items] = await Promise.all([
    getLatestVersion(),
    getChampions(),
    getItems(),
  ]);

  const champion = champions[championId];
  if (!champion) {
    return NextResponse.json({ error: "champion not found" }, { status: 404 });
  }

  const [{ data: counters, error: cErr }, { data: counterItems, error: iErr }] =
    await Promise.all([
      supabase
        .from("counters")
        .select("*")
        .eq("champion_id", championId)
        .order("win_rate", { ascending: false }),
      supabase
        .from("counter_items")
        .select("*")
        .eq("champion_id", championId)
        .order("priority", { ascending: true }),
    ]);

  if (cErr || iErr) {
    return NextResponse.json(
      { error: cErr?.message ?? iErr?.message ?? "supabase error" },
      { status: 500 }
    );
  }

  const enrichedCounters =
    counters?.map((c) => ({
      ...c,
      champion: champions[c.counter_id] ?? null,
    })) ?? [];

  const enrichedItems =
    counterItems?.map((i) => ({
      ...i,
      item: items[i.item_id] ?? null,
    })) ?? [];

  return NextResponse.json({
    version,
    champion,
    counters: enrichedCounters,
    items: enrichedItems,
  });
}

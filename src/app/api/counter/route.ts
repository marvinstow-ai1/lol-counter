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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        error:
          "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then Redeploy.",
      },
      { status: 500 }
    );
  }

  let version = "";
  let champions: Awaited<ReturnType<typeof getChampions>> = {};
  let items: Awaited<ReturnType<typeof getItems>> = {};
  try {
    [version, champions, items] = await Promise.all([
      getLatestVersion(),
      getChampions(),
      getItems(),
    ]);
  } catch (e) {
    return NextResponse.json(
      { error: `Data Dragon fetch failed: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  const champion = champions[championId];
  if (!champion) {
    return NextResponse.json(
      { error: `champion "${championId}" not found in Data Dragon` },
      { status: 404 }
    );
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
    const detail = cErr ?? iErr;
    console.error("[api/counter] supabase error", detail);
    return NextResponse.json(
      {
        error: `Supabase: ${detail?.message ?? "unknown error"}`,
        hint:
          detail?.code === "42P01"
            ? "Table not found. Run supabase/schema.sql in the Supabase SQL Editor."
            : detail?.code === "PGRST301" || detail?.message?.includes("permission")
              ? "Permission denied. Re-run schema.sql to set up RLS policies."
              : detail?.code === "PGRST116" || detail?.message?.includes("JWT")
                ? "Invalid Supabase key. Check NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel."
                : undefined,
      },
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

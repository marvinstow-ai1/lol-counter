"use client";

import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/NavBar";
import { EnemySlot } from "@/components/team/EnemySlot";
import { RecommendationCard } from "@/components/team/RecommendationCard";
import { OverlapItemsPanel } from "@/components/team/OverlapItemsPanel";
import type { Champion, Item } from "@/types";
import type { Recommendation, OverlapItem, Role } from "@/lib/teamScore";

interface ChampionLite {
  id: string;
  name: string;
  title: string;
  tags: string[];
  image: string;
}

interface TeamResponse {
  version: string;
  enemies: { id: string; champion: Champion }[];
  overlapItems: (OverlapItem & { item: Item })[];
  recommendations: (Recommendation & { champion: Champion })[];
}

const ROLE_FILTERS: { id: Role; label: string; short: string }[] = [
  { id: "ALL", label: "All Roles", short: "ALL" },
  { id: "TOP", label: "Top", short: "TOP" },
  { id: "JUNGLE", label: "Jungle", short: "JG" },
  { id: "MIDDLE", label: "Mid", short: "MID" },
  { id: "BOTTOM", label: "ADC", short: "ADC" },
  { id: "UTILITY", label: "Support", short: "SUP" },
];

const SLOT_COUNT = 5;
const CACHE_KEY = "rift-counter:champions-v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export default function TeamPage() {
  const [version, setVersion] = useState("");
  const [champions, setChampions] = useState<ChampionLite[]>([]);
  const [enemies, setEnemies] = useState<(string | null)[]>(
    Array(SLOT_COUNT).fill(null)
  );
  const [role, setRole] = useState<Role>("ALL");
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load champions (with localStorage cache)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.t && Date.now() - parsed.t < CACHE_TTL_MS) {
          setVersion(parsed.version);
          setChampions(parsed.champions);
          return;
        }
      }
    } catch {}

    fetch("/api/champions")
      .then((r) => r.json())
      .then((d) => {
        setVersion(d.version);
        setChampions(d.champions);
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ t: Date.now(), version: d.version, champions: d.champions })
          );
        } catch {}
      })
      .catch((e) => setError(`Failed to load champions: ${e}`));
  }, []);

  // Run team query whenever enemies/role change & we have >=2 picks
  const validEnemies = useMemo(
    () => enemies.filter((e): e is string => Boolean(e)),
    [enemies]
  );

  useEffect(() => {
    if (validEnemies.length < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetch("/api/team-counter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enemies: validEnemies, role }),
      signal: controller.signal,
    })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? "request failed");
        return body as TeamResponse;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e.message ?? e));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [validEnemies.join(","), role]);

  const enemyMap = useMemo(() => {
    const m: Record<string, Champion> = {};
    data?.enemies.forEach((e) => (m[e.id] = e.champion));
    return m;
  }, [data]);

  function setSlot(idx: number, id: string | null) {
    setEnemies((prev) => {
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  }

  function clearAll() {
    setEnemies(Array(SLOT_COUNT).fill(null));
  }

  return (
    <main className="min-h-screen">
      <NavBar patch={version} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-block mb-3 px-4 py-1 rounded-full glass text-[10px] sm:text-xs uppercase tracking-[0.3em] text-rift-gold/80">
            ⚔ team draft mode
          </div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="gold-text">Counter</span>{" "}
            <span className="text-rift-goldLight">the Whole</span>{" "}
            <span className="bg-gradient-to-r from-rift-blue to-rift-deep bg-clip-text text-transparent">
              Enemy Team
            </span>
          </h1>
          <p className="text-rift-goldLight/60 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Add up to 5 enemies. Get the Top 10 picks ranked by win-rate, counter strength, and item synergy.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="inline-flex gap-1 glass rounded-full p-1 min-w-max">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  role === r.id
                    ? "bg-rift-gold text-rift-bg shadow-lg shadow-rift-gold/30"
                    : "text-rift-goldLight/60 hover:text-rift-gold"
                }`}
              >
                {r.short}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
          {/* Left col: Enemy slots */}
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-rift-goldLight">
                Enemy Team
              </h2>
              {validEnemies.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] uppercase tracking-widest text-rift-goldLight/50 hover:text-rift-danger transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              {enemies.map((id, i) => (
                <EnemySlot
                  key={i}
                  index={i}
                  version={version}
                  champions={champions}
                  selected={id}
                  onSelect={(newId) => setSlot(i, newId)}
                  excludeIds={validEnemies.filter((e) => e !== id)}
                />
              ))}
            </div>

            {validEnemies.length < 2 && (
              <div className="glass rounded-xl p-3 text-xs text-rift-goldLight/50 italic">
                Pick at least 2 enemies to see recommendations.
              </div>
            )}

            {data && data.overlapItems.length > 0 && (
              <div className="pt-4">
                <OverlapItemsPanel
                  version={version}
                  items={data.overlapItems}
                  enemyMap={enemyMap}
                />
              </div>
            )}
          </aside>

          {/* Right col: Recommendations */}
          <section>
            {error && (
              <div className="glass border-rift-danger/40 rounded-xl p-4 text-sm text-rift-danger mb-4">
                ⚠ {error}
              </div>
            )}

            {loading && (
              <div className="py-16 text-center">
                <div className="inline-block w-10 h-10 border-2 border-rift-gold/30 border-t-rift-blue rounded-full animate-spin" />
                <div className="mt-3 text-rift-goldLight/50 uppercase tracking-widest text-xs">
                  Crunching matchups…
                </div>
              </div>
            )}

            {!loading && validEnemies.length < 2 && (
              <div className="glass rounded-2xl p-8 sm:p-12 text-center text-rift-goldLight/50 animate-fade-in">
                <div className="text-5xl mb-4">⚔</div>
                <div className="font-display text-lg sm:text-xl mb-2 text-rift-goldLight">
                  Build the enemy team
                </div>
                <p className="text-sm">
                  Add 2 to 5 enemy champions on the left. We'll rank the strongest counter picks across the entire team.
                </p>
              </div>
            )}

            {!loading && data && data.recommendations.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-rift-goldLight/50">
                No recommendations match this filter. Try changing the role or removing an enemy.
              </div>
            )}

            {data && data.recommendations.length > 0 && !loading && (
              <div className="space-y-3 sm:space-y-4 animate-slide-up">
                {data.recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={rec.candidateId}
                    rank={idx + 1}
                    version={data.version}
                    rec={rec}
                    enemyMap={enemyMap}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

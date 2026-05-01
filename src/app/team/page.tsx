"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  ownTeam: { id: string; champion: Champion }[];
  overlapItems: (OverlapItem & { item: Item })[];
  recommendations: (Recommendation & { champion: Champion })[];
  availableRoles: string[];
}

const ROLE_FILTERS: { id: Role; short: string }[] = [
  { id: "ALL", short: "ALL" },
  { id: "TOP", short: "TOP" },
  { id: "JUNGLE", short: "JG" },
  { id: "MIDDLE", short: "MID" },
  { id: "BOTTOM", short: "ADC" },
  { id: "UTILITY", short: "SUP" },
];

const ENEMY_SLOTS = 5;
const OWN_SLOTS = 4;
const CACHE_KEY = "rift-counter:champions-v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export default function TeamPage() {
  return (
    <Suspense fallback={null}>
      <TeamPageInner />
    </Suspense>
  );
}

function TeamPageInner() {
  const searchParams = useSearchParams();
  const [version, setVersion] = useState("");
  const [champions, setChampions] = useState<ChampionLite[]>([]);
  const [enemies, setEnemies] = useState<(string | null)[]>(() =>
    Array(ENEMY_SLOTS).fill(null)
  );
  const [ownTeam, setOwnTeam] = useState<(string | null)[]>(() =>
    Array(OWN_SLOTS).fill(null)
  );
  const [role, setRole] = useState<Role>("ALL");
  const [data, setData] = useState<TeamResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deep-link from Lane Counter view: ?enemy=Yasuo  or  ?ally=Yasuo
  useEffect(() => {
    const enemyParam = searchParams.get("enemy");
    const allyParam = searchParams.get("ally");
    if (enemyParam) {
      setEnemies((prev) => {
        if (prev.some((e) => e === enemyParam)) return prev;
        const next = [...prev];
        const idx = next.findIndex((s) => s == null);
        if (idx >= 0) next[idx] = enemyParam;
        return next;
      });
    }
    if (allyParam) {
      setOwnTeam((prev) => {
        if (prev.some((e) => e === allyParam)) return prev;
        const next = [...prev];
        const idx = next.findIndex((s) => s == null);
        if (idx >= 0) next[idx] = allyParam;
        return next;
      });
    }
  }, [searchParams]);

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

  // Stable string keys derived from state — guaranteed to change on any slot edit
  const enemyKey = enemies.filter(Boolean).join("|");
  const ownKey = ownTeam.filter(Boolean).join("|");
  const enemyIds = useMemo(() => enemyKey.split("|").filter(Boolean), [enemyKey]);
  const ownIds = useMemo(() => ownKey.split("|").filter(Boolean), [ownKey]);

  // Refetch on any change to enemies / ownTeam / role
  useEffect(() => {
    if (enemyIds.length < 2) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetch("/api/team-counter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enemies: enemyIds, ownTeam: ownIds, role }),
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
  }, [enemyKey, ownKey, role]);

  const enemyMap = useMemo(() => {
    const m: Record<string, Champion> = {};
    data?.enemies.forEach((e) => (m[e.id] = e.champion));
    return m;
  }, [data]);

  function setEnemySlot(idx: number, id: string | null) {
    setEnemies((prev) => {
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  }

  function setOwnSlot(idx: number, id: string | null) {
    setOwnTeam((prev) => {
      const next = [...prev];
      next[idx] = id;
      return next;
    });
  }

  function addToOwnTeam(id: string) {
    setOwnTeam((prev) => {
      if (prev.some((s) => s === id)) return prev;
      const next = [...prev];
      const idx = next.findIndex((s) => s == null);
      if (idx >= 0) next[idx] = id;
      return next;
    });
  }

  function clearAll() {
    setEnemies(Array(ENEMY_SLOTS).fill(null));
    setOwnTeam(Array(OWN_SLOTS).fill(null));
  }

  // Hide role tabs that have no recs
  const visibleRoles = useMemo(() => {
    if (!data) return ROLE_FILTERS;
    const avail = new Set(data.availableRoles);
    return ROLE_FILTERS.filter((r) => r.id === "ALL" || avail.has(r.id));
  }, [data]);

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
            Build both teams. Get the Top 10 picks ranked by win rate, counter strength, item synergy, and class fit.
          </p>
        </div>

        {/* Two-team panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* OWN TEAM (green) */}
          <TeamPanel
            variant="ally"
            title="My Team"
            slots={ownTeam}
            count={ownIds.length}
            max={OWN_SLOTS}
            version={version}
            champions={champions}
            excludeIds={[...enemyIds, ...ownIds]}
            onSet={setOwnSlot}
          />

          {/* ENEMY TEAM (red) */}
          <TeamPanel
            variant="enemy"
            title="Enemy Team"
            slots={enemies}
            count={enemyIds.length}
            max={ENEMY_SLOTS}
            version={version}
            champions={champions}
            excludeIds={[...enemyIds, ...ownIds]}
            onSet={setEnemySlot}
          />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="text-xs text-rift-goldLight/50">
            {enemyIds.length < 2 ? (
              <>Pick at least 2 enemies to see recommendations.</>
            ) : (
              <>
                <span className="text-rift-blue font-semibold">{enemyIds.length}</span> enemies
                {ownIds.length > 0 && (
                  <>
                    {" · "}
                    <span className="text-emerald-400 font-semibold">{ownIds.length}</span> allies
                  </>
                )}
              </>
            )}
          </div>
          {(enemyIds.length > 0 || ownIds.length > 0) && (
            <button
              onClick={clearAll}
              className="text-[10px] uppercase tracking-widest text-rift-goldLight/50 hover:text-rift-danger transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Role tabs (only roles with recs) */}
        {data && visibleRoles.length > 1 && (
          <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="inline-flex gap-1 glass rounded-full p-1 min-w-max">
              {visibleRoles.map((r) => (
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
        )}

        {/* Recommendations */}
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

          {!loading && enemyIds.length < 2 && (
            <div className="glass rounded-2xl p-8 sm:p-12 text-center text-rift-goldLight/50">
              <div className="text-5xl mb-4">⚔</div>
              <div className="font-display text-lg sm:text-xl mb-2 text-rift-goldLight">
                Build the enemy team
              </div>
              <p className="text-sm">
                Add 2 to 5 enemies on the right. We'll rank the strongest counter picks across the entire team.
              </p>
            </div>
          )}

          {!loading && data && data.recommendations.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-rift-goldLight/50">
              No recommendations match this filter. Try changing the role or removing a champion.
            </div>
          )}

          {data && data.recommendations.length > 0 && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
              <div className="space-y-3 sm:space-y-4 animate-slide-up">
                {data.recommendations.map((rec, idx) => (
                  <RecommendationCard
                    key={rec.candidateId}
                    rank={idx + 1}
                    version={data.version}
                    rec={rec}
                    enemyMap={enemyMap}
                    onAddToTeam={addToOwnTeam}
                    alreadyOwn={ownIds.includes(rec.candidateId)}
                  />
                ))}
              </div>

              {data.overlapItems.length > 0 && (
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <OverlapItemsPanel
                    version={version}
                    items={data.overlapItems}
                    enemyMap={enemyMap}
                  />
                </aside>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

interface TeamPanelProps {
  variant: "ally" | "enemy";
  title: string;
  slots: (string | null)[];
  count: number;
  max: number;
  version: string;
  champions: ChampionLite[];
  excludeIds: string[];
  onSet: (idx: number, id: string | null) => void;
}

function TeamPanel({
  variant,
  title,
  slots,
  count,
  max,
  version,
  champions,
  excludeIds,
  onSet,
}: TeamPanelProps) {
  const tint =
    variant === "ally"
      ? "bg-emerald-500/10 border-emerald-400/30"
      : "bg-rift-danger/10 border-rift-danger/30";
  const labelColor =
    variant === "ally" ? "text-emerald-300" : "text-rift-danger";
  const dotColor = variant === "ally" ? "bg-emerald-400" : "bg-rift-danger";

  return (
    <section
      className={`glass rounded-2xl p-3 sm:p-4 border ${tint} relative overflow-hidden`}
    >
      <div
        className={`absolute inset-0 opacity-10 pointer-events-none ${variant === "ally" ? "bg-gradient-to-br from-emerald-500/40 via-transparent to-transparent" : "bg-gradient-to-br from-rift-danger/40 via-transparent to-transparent"}`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse-slow`} />
            <h2 className="font-display text-sm sm:text-base font-bold text-rift-goldLight tracking-wider">
              {title}
            </h2>
          </div>
          <div className={`text-[10px] uppercase tracking-widest font-bold ${labelColor}`}>
            {count}/{max}
          </div>
        </div>

        <div className="space-y-2">
          {slots.map((id, i) => (
            <EnemySlot
              key={i}
              index={i}
              version={version}
              champions={champions}
              selected={id}
              variant={variant}
              onSelect={(newId) => onSet(i, newId)}
              excludeIds={excludeIds.filter((e) => e !== id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

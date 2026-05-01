"use client";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CounterCard } from "@/components/CounterCard";
import { ItemCard } from "@/components/ItemCard";
import { ChampionChips, useFavorites, useHistory } from "@/components/Favorites";
import type { Champion, Item } from "@/types";

interface ChampionLite {
  id: string;
  name: string;
  title: string;
  tags: string[];
  image: string;
}

interface CounterPayload {
  version: string;
  champion: Champion;
  counters: {
    counter_id: string;
    counter_role: string | null;
    win_rate: number | null;
    tier: "S" | "A" | "B" | "C" | "D";
    notes: string | null;
    champion: Champion | null;
  }[];
  items: {
    item_id: string;
    reason: string | null;
    priority: number;
    item: Item | null;
  }[];
}

const ROLE_FILTERS = ["ALL", "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

export default function Home() {
  const [version, setVersion] = useState("");
  const [champions, setChampions] = useState<ChampionLite[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<CounterPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const { favs, toggle, isFav } = useFavorites();
  const { history, push } = useHistory();

  useEffect(() => {
    fetch("/api/champions")
      .then((r) => r.json())
      .then((d) => {
        setVersion(d.version);
        setChampions(d.champions);
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    fetch(`/api/counter?champion=${encodeURIComponent(selected)}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) {
          const msg = body.error ?? "fetch failed";
          throw new Error(body.hint ? `${msg}\n\nHint: ${body.hint}` : msg);
        }
        return body;
      })
      .then((d: CounterPayload) => {
        setData(d);
        push(selected);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [selected]);

  const visibleCounters =
    data?.counters.filter(
      (c) =>
        roleFilter === "ALL" ||
        c.counter_role === roleFilter ||
        c.counter_role == null
    ) ?? [];

  return (
    <main className="min-h-screen relative">
      {/* Top bar */}
      <header className="relative z-10 px-6 pt-8 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="font-display text-xl font-bold gold-text tracking-wider">
                RIFT COUNTER
              </div>
              {version && (
                <div className="text-[10px] uppercase tracking-[0.2em] text-rift-goldLight/40">
                  Patch {version}
                </div>
              )}
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rift-goldLight/50 hover:text-rift-gold transition-colors"
          >
            data via Riot DDragon · counters via Supabase
          </a>
        </div>

        {/* Hero */}
        {!selected && (
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-[0.3em] text-rift-gold/80">
              ⚔ choose your matchup
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
              <span className="gold-text">Counter</span>{" "}
              <span className="text-rift-goldLight">Every</span>{" "}
              <span className="bg-gradient-to-r from-rift-blue to-rift-deep bg-clip-text text-transparent">
                Champion
              </span>
            </h1>
            <p className="text-rift-goldLight/60 text-lg max-w-2xl mx-auto">
              Find the strongest counter picks and counter items for any LoL champion —
              across <em>every</em> role, every patch.
            </p>
          </div>
        )}

        <SearchBar
          version={version}
          champions={champions}
          onSelect={(id) => setSelected(id)}
        />

        {/* History + Favs (only on landing) */}
        {!selected && (history.length > 0 || favs.length > 0) && (
          <div className="mt-8 max-w-2xl mx-auto space-y-4 animate-fade-in">
            <ChampionChips
              version={version}
              ids={history}
              champions={champions}
              onPick={(id) => setSelected(id)}
              label="Recently viewed"
            />
            <ChampionChips
              version={version}
              ids={favs}
              champions={champions}
              onPick={(id) => setSelected(id)}
              onRemove={toggle}
              label="Favorites"
            />
          </div>
        )}
      </header>

      {/* Loading */}
      {loading && (
        <div className="px-6 max-w-7xl mx-auto py-20 text-center">
          <div className="inline-block w-12 h-12 border-2 border-rift-gold/30 border-t-rift-blue rounded-full animate-spin" />
          <div className="mt-4 text-rift-goldLight/50 uppercase tracking-widest text-xs">
            Summoning data…
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-6 max-w-3xl mx-auto py-8">
          <div className="glass border-rift-danger/40 rounded-xl p-4 text-sm text-rift-danger whitespace-pre-line">
            ⚠ {error}
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <section className="relative z-10 px-6 max-w-7xl mx-auto pb-24 animate-slide-up">
          {/* Champion banner */}
          <div className="glass-strong rounded-3xl overflow-hidden mb-10 relative">
            <div
              className="h-64 md:h-80 relative"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(7,10,24,0.2), rgba(7,10,24,0.95)), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${data.champion.id}_0.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
              }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 text-xs uppercase tracking-widest hover:bg-rift-blue/10 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => toggle(data.champion.id)}
                className="absolute top-4 right-4 glass rounded-full w-10 h-10 flex items-center justify-center hover:bg-rift-gold/10 transition-colors"
                aria-label="Toggle favorite"
              >
                <span
                  className={`text-lg ${isFav(data.champion.id) ? "text-rift-gold" : "text-rift-goldLight/40"}`}
                >
                  ★
                </span>
              </button>
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-4">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${data.champion.image.full}`}
                  alt={data.champion.name}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-2xl ring-2 ring-rift-gold shadow-2xl"
                />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-rift-gold mb-1">
                    counters for
                  </div>
                  <h2 className="font-display text-4xl md:text-6xl font-bold gold-text leading-none">
                    {data.champion.name}
                  </h2>
                  <div className="text-rift-goldLight/70 italic mt-1">
                    {data.champion.title}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Counters */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-rift-blue/80 mb-1">
                  Section 01
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-rift-goldLight">
                  Counter Champions
                </h3>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${
                      roleFilter === r
                        ? "bg-rift-gold text-rift-bg shadow-lg shadow-rift-gold/30"
                        : "glass text-rift-goldLight/60 hover:text-rift-gold"
                    }`}
                  >
                    {r === "BOTTOM" ? "ADC" : r === "UTILITY" ? "Sup" : r === "MIDDLE" ? "Mid" : r}
                  </button>
                ))}
              </div>
            </div>

            {visibleCounters.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-rift-goldLight/50">
                No counters found for this filter. Try a different role or champion.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {visibleCounters.map((c, idx) => (
                  <div key={`${c.counter_id}-${c.counter_role}-${idx}`} style={{ animationDelay: `${idx * 40}ms` }} className="animate-slide-up">
                    <CounterCard version={version} counter={c} onPick={setSelected} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          {data.items.length > 0 && (
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-rift-gold/80 mb-1">
                    Section 02
                  </div>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-rift-goldLight">
                    Counter Items
                  </h3>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.items.map((i, idx) => (
                  <div key={i.item_id} style={{ animationDelay: `${idx * 60}ms` }} className="animate-slide-up">
                    <ItemCard version={version} itemRow={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-rift-gold/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-rift-goldLight/40 flex flex-wrap justify-between gap-3">
          <div>
            Rift Counter isn't endorsed by Riot Games. League of Legends © Riot Games, Inc.
          </div>
          <div>Built with Next.js · Supabase · Vercel</div>
        </div>
      </footer>
    </main>
  );
}

function Logo() {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rift-gold via-rift-deep to-rift-blue flex items-center justify-center shadow-lg shadow-rift-blue/30 animate-glow">
      <span className="font-display text-lg font-black text-rift-bg">⚔</span>
    </div>
  );
}

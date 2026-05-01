"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";

interface ChampionLite {
  id: string;
  name: string;
  title: string;
  image: string;
}

interface Props {
  index: number;
  version: string;
  champions: ChampionLite[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** ids that are already in other slots, hidden from suggestions */
  excludeIds: string[];
}

export function EnemySlot({
  index,
  version,
  champions,
  selected,
  onSelect,
  excludeIds,
}: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const fuse = useMemo(
    () =>
      new Fuse(champions, {
        keys: ["name", "id"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [champions]
  );

  const results = useMemo(() => {
    if (!debounced.trim()) return [];
    return fuse
      .search(debounced.trim())
      .map((r) => r.item)
      .filter((c) => !excludeIds.includes(c.id))
      .slice(0, 6);
  }, [debounced, fuse, excludeIds]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const champ = selected ? champions.find((c) => c.id === selected) : null;

  function pick(id: string) {
    onSelect(id);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    onSelect(null);
    setQuery("");
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`glass input-glow flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
          champ ? "border-rift-blue/40" : ""
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-rift-bg/80 flex items-center justify-center text-xs font-bold text-rift-gold/70 shrink-0">
          {index + 1}
        </div>

        {champ ? (
          <>
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.image}`}
              alt={champ.name}
              className="w-9 h-9 rounded-lg ring-1 ring-rift-gold/40"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-rift-goldLight truncate">
                {champ.name}
              </div>
              <div className="text-[10px] text-rift-goldLight/40 truncate">
                {champ.title}
              </div>
            </div>
            <button
              onClick={clear}
              className="w-7 h-7 rounded-full hover:bg-rift-danger/20 text-rift-goldLight/60 hover:text-rift-danger transition-colors flex items-center justify-center shrink-0"
              aria-label="Remove champion"
            >
              ×
            </button>
          </>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={`Enemy ${index + 1}…`}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-rift-goldLight/30 text-rift-goldLight min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
        )}
      </div>

      {!champ && open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50 animate-fade-in">
          <ul className="max-h-72 overflow-y-auto">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => pick(c.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-rift-blue/10 transition-colors"
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image}`}
                    alt={c.name}
                    className="w-8 h-8 rounded-lg ring-1 ring-rift-gold/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-rift-goldLight truncate">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-rift-goldLight/40 truncate">
                      {c.title}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

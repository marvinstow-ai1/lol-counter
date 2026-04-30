"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";

interface ChampionLite {
  id: string;
  name: string;
  title: string;
  tags: string[];
  image: string;
}

interface Props {
  version: string;
  champions: ChampionLite[];
  onSelect: (id: string) => void;
}

export function SearchBar({ version, champions, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(champions, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "id", weight: 0.2 },
          { name: "title", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [champions]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).slice(0, 8).map((r) => r.item);
  }, [query, fuse]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIdx];
      if (target) pick(target.id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={`glass input-glow flex items-center gap-3 px-5 py-4 rounded-2xl transition-all`}
      >
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Champion suchen — z.B. Yasuo, Lee Sin, Jinx…"
          className="flex-1 bg-transparent outline-none text-lg placeholder:text-rift-goldLight/40 text-rift-goldLight"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={() => results[0] && pick(results[0].id)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-rift-blue to-rift-deep text-white font-semibold text-sm tracking-wide hover:opacity-90 transition-all shadow-lg shadow-rift-blue/30"
        >
          SEARCH
        </button>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl overflow-hidden z-50 animate-fade-in">
          <ul className="max-h-96 overflow-y-auto">
            {results.map((c, idx) => (
              <li key={c.id}>
                <button
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => pick(c.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                    idx === activeIdx
                      ? "bg-rift-blue/10 border-l-2 border-rift-gold"
                      : "border-l-2 border-transparent hover:bg-rift-blue/5"
                  }`}
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image}`}
                    alt={c.name}
                    className="w-10 h-10 rounded-lg ring-1 ring-rift-gold/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-rift-goldLight">{c.name}</div>
                    <div className="text-xs text-rift-goldLight/50 truncate">{c.title}</div>
                  </div>
                  <div className="flex gap-1">
                    {c.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-rift-gold/30 text-rift-gold/80"
                      >
                        {t}
                      </span>
                    ))}
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

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-rift-gold/80"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

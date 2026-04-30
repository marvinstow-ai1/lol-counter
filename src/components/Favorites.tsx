"use client";

import { useEffect, useState } from "react";

const KEY = "rift-counter:favs";
const HISTORY_KEY = "rift-counter:history";

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch {}
  }, []);

  function toggle(id: string) {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  return { favs, toggle, isFav: (id: string) => favs.includes(id) };
}

export function useHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  function push(id: string) {
    setHistory((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clear() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  return { history, push, clear };
}

interface ChipsProps {
  version: string;
  ids: string[];
  champions: { id: string; name: string; image: string }[];
  onPick: (id: string) => void;
  onRemove?: (id: string) => void;
  label: string;
  emptyHint?: string;
}

export function ChampionChips({
  version,
  ids,
  champions,
  onPick,
  onRemove,
  label,
  emptyHint,
}: ChipsProps) {
  const map = Object.fromEntries(champions.map((c) => [c.id, c]));
  if (ids.length === 0 && !emptyHint) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-rift-goldLight/40">
        {label}
      </div>
      {ids.length === 0 ? (
        <div className="text-xs text-rift-goldLight/40 italic">{emptyHint}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ids.map((id) => {
            const c = map[id];
            if (!c) return null;
            return (
              <div
                key={id}
                className="group glass rounded-full pl-1 pr-3 py-1 flex items-center gap-2 hover-lift cursor-pointer"
                onClick={() => onPick(id)}
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image}`}
                  alt={c.name}
                  className="w-7 h-7 rounded-full ring-1 ring-rift-gold/50"
                />
                <span className="text-xs font-medium text-rift-goldLight">
                  {c.name}
                </span>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(id);
                    }}
                    className="text-rift-goldLight/40 hover:text-rift-danger text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

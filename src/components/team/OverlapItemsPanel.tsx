"use client";

import { useState } from "react";
import type { Item, Champion } from "@/types";
import type { OverlapItem } from "@/lib/teamScore";

interface Props {
  version: string;
  items: (OverlapItem & { item: Item })[];
  enemyMap: Record<string, Champion>;
}

export function OverlapItemsPanel({ version, items, enemyMap }: Props) {
  if (!items.length) {
    return (
      <div className="glass rounded-xl p-4 text-xs text-rift-goldLight/40 italic">
        No shared counter items yet — add more enemies to find overlaps.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-rift-gold/70">
        Shared Counter Items
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <ItemRow key={it.item_id} version={version} item={it} enemyMap={enemyMap} />
        ))}
      </div>
    </div>
  );
}

function ItemRow({
  version,
  item,
  enemyMap,
}: {
  version: string;
  item: OverlapItem & { item: Item };
  enemyMap: Record<string, Champion>;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover((h) => !h)}
      className="relative glass hover-lift rounded-xl p-3 flex items-center gap-3"
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${item.item_id}.png`}
        alt={item.item.name}
        className="w-11 h-11 rounded-lg ring-2 ring-rift-gold/50 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm font-bold text-rift-goldLight truncate">
            {item.item.name}
          </span>
          <span className="text-[10px] font-bold text-rift-gold shrink-0">
            ×{item.againstEnemies.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {item.againstEnemies.map((eid) => {
            const e = enemyMap[eid];
            if (!e) return null;
            return (
              <img
                key={eid}
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${e.image.full}`}
                alt={e.name}
                title={e.name}
                className="w-5 h-5 rounded ring-1 ring-rift-gold/40"
              />
            );
          })}
        </div>
      </div>

      {hover && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 glass-strong rounded-xl p-3 text-xs leading-relaxed animate-fade-in pointer-events-none">
          <div className="font-display font-bold text-rift-gold mb-2">
            {item.item.name}
          </div>
          {item.reasons.map((r, i) => {
            const e = enemyMap[r.enemy];
            return (
              <div key={i} className="flex gap-2 items-start text-rift-goldLight/85 mb-1">
                <span className="text-rift-blue font-semibold shrink-0">
                  vs {e?.name ?? r.enemy}:
                </span>
                <span>{r.reason ?? "Strong itemization counter"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

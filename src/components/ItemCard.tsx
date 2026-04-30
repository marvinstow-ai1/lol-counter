"use client";

import { useState } from "react";
import type { Item } from "@/types";

interface Props {
  version: string;
  itemRow: {
    item_id: string;
    reason: string | null;
    priority: number;
    item: Item | null;
  };
}

export function ItemCard({ version, itemRow }: Props) {
  const [hover, setHover] = useState(false);
  const item = itemRow.item;
  if (!item) return null;

  const desc = stripHtml(item.description ?? item.plaintext ?? "");

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="glass hover-lift rounded-xl p-4 flex gap-4 items-start relative"
    >
      <div className="relative flex-shrink-0">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemRow.item_id}.png`}
          alt={item.name}
          className="w-16 h-16 rounded-lg ring-2 ring-rift-gold/50"
        />
        <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rift-gold text-rift-bg text-xs font-black flex items-center justify-center shadow-lg">
          {itemRow.priority}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="font-display font-bold text-rift-goldLight truncate">
            {item.name}
          </h4>
          {item.gold?.total != null && (
            <span className="text-xs text-rift-gold/80 font-mono whitespace-nowrap">
              {item.gold.total}g
            </span>
          )}
        </div>
        {itemRow.reason && (
          <p className="text-xs text-rift-blue/90 italic mb-1">
            {itemRow.reason}
          </p>
        )}
        <p className="text-[11px] text-rift-goldLight/60 line-clamp-2 leading-relaxed">
          {desc}
        </p>
      </div>

      {hover && (
        <div className="absolute z-30 left-0 right-0 top-full mt-2 glass-strong rounded-xl p-4 text-xs text-rift-goldLight/85 leading-relaxed pointer-events-none animate-fade-in">
          <div className="font-display font-bold text-rift-gold mb-2">
            {item.name}
          </div>
          <div dangerouslySetInnerHTML={{ __html: item.description ?? "" }} />
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>(\s*)/gi, " · ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

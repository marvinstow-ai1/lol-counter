"use client";

import type { Champion } from "@/types";

interface Props {
  version: string;
  counter: {
    counter_id: string;
    counter_role: string | null;
    win_rate: number | null;
    tier: "S" | "A" | "B" | "C" | "D";
    notes: string | null;
    champion: Champion | null;
  };
  onPick: (id: string) => void;
}

const ROLE_LABEL: Record<string, string> = {
  TOP: "Top",
  JUNGLE: "Jungle",
  MIDDLE: "Mid",
  BOTTOM: "ADC",
  UTILITY: "Support",
};

export function CounterCard({ version, counter, onPick }: Props) {
  const champ = counter.champion;
  if (!champ) return null;

  const wr = counter.win_rate ?? 50;
  const wrPct = Math.max(0, Math.min(100, wr));
  const role = counter.counter_role ? ROLE_LABEL[counter.counter_role] : null;

  return (
    <button
      onClick={() => onPick(champ.id)}
      className="glass hover-lift rounded-2xl overflow-hidden text-left group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg`}
          alt={champ.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-rift-bg via-rift-bg/30 to-transparent" />
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1.5 sm:gap-2">
          <span
            className={`tier-badge-${counter.tier} px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-black tracking-widest`}
          >
            {counter.tier}
          </span>
          {role && (
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-rift-bg/70 backdrop-blur-sm border border-rift-gold/30 text-rift-gold">
              {role}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
          <div className="font-display text-lg sm:text-2xl font-bold gold-text drop-shadow-lg leading-tight">
            {champ.name}
          </div>
          <div className="text-[10px] sm:text-xs text-rift-goldLight/70 italic line-clamp-1">
            {champ.title}
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-rift-goldLight/50">
              Win Rate
            </span>
            <span className="font-display text-base sm:text-lg font-bold text-rift-blue">
              {wr.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-rift-bg/80 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rift-blue via-rift-gold to-rift-danger rounded-full transition-all duration-700"
              style={{ width: `${wrPct}%` }}
            />
          </div>
        </div>
        {counter.notes && (
          <p className="text-[11px] sm:text-xs text-rift-goldLight/60 leading-relaxed line-clamp-2">
            {counter.notes}
          </p>
        )}
      </div>
    </button>
  );
}

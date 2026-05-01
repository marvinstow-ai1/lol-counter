"use client";

import { useState } from "react";
import type { Champion } from "@/types";
import type { Recommendation } from "@/lib/teamScore";

interface Props {
  rank: number;
  version: string;
  rec: Recommendation & { champion: Champion };
  enemyMap: Record<string, Champion>;
}

const COLOR_RING = {
  green: "ring-rift-blue/60 shadow-rift-blue/30",
  yellow: "ring-rift-gold/60 shadow-rift-gold/30",
  red: "ring-rift-danger/60 shadow-rift-danger/30",
};

const COLOR_BAR = {
  green: "from-rift-blue to-rift-deep",
  yellow: "from-rift-gold to-rift-deep",
  red: "from-rift-danger to-rift-deep",
};

const COLOR_TEXT = {
  green: "text-rift-blue",
  yellow: "text-rift-gold",
  red: "text-rift-danger",
};

export function RecommendationCard({ rank, version, rec, enemyMap }: Props) {
  const [expanded, setExpanded] = useState(rank <= 3);
  const score = rec.totalScore;
  const pct = Math.max(0, Math.min(100, score));

  return (
    <article
      className={`glass hover-lift rounded-2xl overflow-hidden ring-1 shadow-lg ${COLOR_RING[rec.color]}`}
    >
      <div className="relative">
        {/* Splash background */}
        <div
          className="h-28 sm:h-32 relative"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(7,10,24,0.85) 0%, rgba(7,10,24,0.4) 60%, rgba(7,10,24,0.85) 100%), url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${rec.champion.id}_0.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        >
          <div className="absolute inset-0 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            <div className="font-display text-3xl sm:text-4xl font-black text-rift-gold/80 leading-none w-10 sm:w-12 text-center shrink-0">
              #{rank}
            </div>
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${rec.champion.image.full}`}
              alt={rec.champion.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl ring-2 ring-rift-gold shadow-2xl shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl sm:text-2xl font-bold gold-text truncate leading-tight">
                {rec.champion.name}
              </div>
              <div className="text-[10px] sm:text-xs text-rift-goldLight/60 italic truncate">
                {rec.champion.title}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-display text-2xl sm:text-3xl font-black ${COLOR_TEXT[rec.color]}`}>
                {score.toFixed(1)}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-rift-goldLight/40">
                Score
              </div>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-1.5 bg-rift-bg/80">
          <div
            className={`h-full bg-gradient-to-r ${COLOR_BAR[rec.color]} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="px-3 sm:px-4 pt-3 flex flex-wrap gap-1.5">
        {rec.tags.map((t) => (
          <span
            key={t}
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${
              t === "Strong Counter"
                ? "border-rift-blue/50 text-rift-blue bg-rift-blue/10"
                : t === "Tier S Pick"
                  ? "border-rift-danger/50 text-rift-danger bg-rift-danger/10"
                  : t.startsWith("Item Overlap")
                    ? "border-rift-gold/40 text-rift-gold bg-rift-gold/10"
                    : "border-rift-goldLight/20 text-rift-goldLight/60"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Score breakdown */}
      <div className="px-3 sm:px-4 py-3 grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <ScoreCell label="Win Rate" value={rec.winRateScore} max={50} />
        <ScoreCell label="Counter" value={rec.counterScore} max={30} />
        <ScoreCell label="Items" value={rec.itemOverlapScore} max={20} />
      </div>

      {/* Matchups */}
      <button
        onClick={() => setExpanded((x) => !x)}
        className="w-full px-3 sm:px-4 py-2 text-[10px] uppercase tracking-widest text-rift-goldLight/50 hover:text-rift-gold border-t border-rift-gold/10 transition-colors flex items-center justify-between"
      >
        <span>Matchups ({rec.matchups.length})</span>
        <span>{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="px-3 sm:px-4 pb-4 space-y-2 animate-fade-in">
          {rec.matchups
            .slice()
            .sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0))
            .map((m) => {
              const enemy = enemyMap[m.champion_id];
              const wr = m.win_rate ?? 50;
              return (
                <div
                  key={`${m.champion_id}-${m.counter_role}`}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  {enemy && (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${enemy.image.full}`}
                      alt={enemy.name}
                      className="w-7 h-7 rounded-md ring-1 ring-rift-gold/30 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-rift-goldLight truncate">
                        vs {enemy?.name ?? m.champion_id}
                      </span>
                      <span className={`text-xs font-bold ${COLOR_TEXT[rec.color]} shrink-0`}>
                        {wr.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 mt-1 rounded-full bg-rift-bg/80 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${COLOR_BAR[rec.color]}`}
                        style={{ width: `${Math.max(0, Math.min(100, wr))}%` }}
                      />
                    </div>
                    {m.notes && (
                      <div className="text-[10px] text-rift-goldLight/50 italic mt-0.5 truncate">
                        {m.notes}
                      </div>
                    )}
                  </div>
                  <span
                    className={`tier-badge-${m.tier} px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest shrink-0`}
                  >
                    {m.tier}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </article>
  );
}

function ScoreCell({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-rift-goldLight/40 mb-1">
        {label}
      </div>
      <div className="font-display text-sm sm:text-base font-bold text-rift-goldLight">
        {value.toFixed(1)}
        <span className="text-[10px] text-rift-goldLight/30">/{max}</span>
      </div>
      <div className="h-0.5 mt-1 rounded-full bg-rift-bg/80 overflow-hidden">
        <div
          className="h-full bg-rift-gold/60"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

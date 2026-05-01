/**
 * Team Counter scoring — pure functions, no IO.
 * Given a team of enemies + counter / item rows from the DB, computes a
 * weighted score for every candidate champion that counters >=1 enemy.
 *
 *   final = winRate (0..50) + counterTier (0..30) + itemOverlap (0..20)
 *
 * Item overlap is a TEAM-LEVEL value: identical for every candidate, but
 * still factored in so picks against a team with lots of shared items get
 * a flat bonus.
 */

export type Tier = "S" | "A" | "B" | "C" | "D";
export type Role = "ALL" | "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface CounterRow {
  champion_id: string;
  counter_id: string;
  counter_role: string | null;
  win_rate: number | null;
  tier: Tier;
  notes: string | null;
}

export interface ItemRow {
  champion_id: string;
  item_id: string;
  reason: string | null;
  priority: number;
}

export interface Recommendation {
  candidateId: string;
  totalScore: number;
  winRateScore: number;
  counterScore: number;
  itemOverlapScore: number;
  matchups: CounterRow[];
  tags: string[];
  color: "green" | "yellow" | "red";
}

export interface OverlapItem {
  item_id: string;
  againstEnemies: string[];
  reasons: { enemy: string; reason: string | null }[];
}

const W_WINRATE = 0.5;
const W_COUNTER = 0.3;
const W_OVERLAP = 0.2;

const TIER_VALUE: Record<Tier, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
const NEUTRAL_WR = 50;
const WR_FLOOR = 45;
const WR_CEIL = 60;

export function scoreTeam(args: {
  enemies: string[];
  role: Role;
  counterRows: CounterRow[];
  itemRows: ItemRow[];
}): { recommendations: Recommendation[]; overlapItems: OverlapItem[] } {
  const { enemies, role, counterRows, itemRows } = args;

  // 1) Group counter rows by candidate (the champion that counters someone)
  const byCandidate: Record<string, CounterRow[]> = {};
  for (const row of counterRows) {
    if (!enemies.includes(row.champion_id)) continue;
    if (role !== "ALL" && row.counter_role && row.counter_role !== role) continue;
    (byCandidate[row.counter_id] ??= []).push(row);
  }

  // 2) Compute item overlap (which items target multiple enemies?)
  const itemEnemies: Record<string, { reason: string | null; enemy: string }[]> = {};
  for (const row of itemRows) {
    if (!enemies.includes(row.champion_id)) continue;
    (itemEnemies[row.item_id] ??= []).push({ enemy: row.champion_id, reason: row.reason });
  }
  const overlapItems: OverlapItem[] = Object.entries(itemEnemies)
    .filter(([, list]) => new Set(list.map((l) => l.enemy)).size >= 2)
    .map(([item_id, list]) => ({
      item_id,
      againstEnemies: Array.from(new Set(list.map((l) => l.enemy))),
      reasons: list,
    }))
    .sort((a, b) => b.againstEnemies.length - a.againstEnemies.length);

  const overlapBonus =
    Math.min(overlapItems.length / 5, 1) * (W_OVERLAP * 100);

  // 3) Score each candidate
  const recs: Recommendation[] = Object.entries(byCandidate).map(
    ([candidateId, matchups]) => {
      const winRates = matchups.map((m) => m.win_rate ?? NEUTRAL_WR);
      const avgWR =
        winRates.reduce((a, b) => a + b, 0) / Math.max(1, winRates.length);
      const winRateScore =
        clamp01((avgWR - WR_FLOOR) / (WR_CEIL - WR_FLOOR)) * (W_WINRATE * 100);

      const tierSum = matchups.reduce(
        (s, m) => s + (TIER_VALUE[m.tier] ?? 1),
        0
      );
      const counterScore =
        (tierSum / (5 * Math.max(1, enemies.length))) * (W_COUNTER * 100);

      const totalScore = winRateScore + counterScore + overlapBonus;

      const tags: string[] = [];
      if (totalScore >= 70) tags.push("Strong Counter");
      else if (totalScore < 50) tags.push("Situational");
      if (matchups.length >= 3) tags.push(`Counters ${matchups.length} Enemies`);
      if (matchups.some((m) => m.tier === "S")) tags.push("Tier S Pick");
      if (overlapItems.length >= 2) tags.push(`Item Overlap x${overlapItems.length}`);

      const color: Recommendation["color"] =
        totalScore >= 70 ? "green" : totalScore >= 50 ? "yellow" : "red";

      return {
        candidateId,
        totalScore,
        winRateScore,
        counterScore,
        itemOverlapScore: overlapBonus,
        matchups,
        tags,
        color,
      };
    }
  );

  recs.sort((a, b) => b.totalScore - a.totalScore);
  return { recommendations: recs.slice(0, 10), overlapItems };
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

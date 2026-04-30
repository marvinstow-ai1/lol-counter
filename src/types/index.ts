export type Role = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: { full: string };
  blurb?: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  plaintext?: string;
  gold?: { total: number };
  image: { full: string };
}

export interface CounterRow {
  champion_id: string;
  counter_id: string;
  counter_role: string | null;
  win_rate: number | null;
  tier: "S" | "A" | "B" | "C" | "D";
  notes: string | null;
  patch: string | null;
}

export interface CounterItemRow {
  champion_id: string;
  item_id: string;
  reason: string | null;
  priority: number;
}

export interface CounterResult {
  champion: Champion;
  counters: (CounterRow & { champion: Champion | null })[];
  items: (CounterItemRow & { item: Item | null })[];
}

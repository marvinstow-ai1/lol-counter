import type { Champion, Item } from "@/types";

const DDRAGON = "https://ddragon.leagueoflegends.com";

let cachedVersion: string | null = null;
let cachedChampions: Record<string, Champion> | null = null;
let cachedItems: Record<string, Item> | null = null;

export async function getLatestVersion(): Promise<string> {
  if (cachedVersion) return cachedVersion;
  const res = await fetch(`${DDRAGON}/api/versions.json`, {
    next: { revalidate: 60 * 60 * 12 },
  });
  const versions: string[] = await res.json();
  cachedVersion = versions[0];
  return cachedVersion;
}

export async function getChampions(): Promise<Record<string, Champion>> {
  if (cachedChampions) return cachedChampions;
  const v = await getLatestVersion();
  const res = await fetch(`${DDRAGON}/cdn/${v}/data/en_US/champion.json`, {
    next: { revalidate: 60 * 60 * 12 },
  });
  const data = await res.json();
  cachedChampions = data.data as Record<string, Champion>;
  return cachedChampions;
}

export async function getItems(): Promise<Record<string, Item>> {
  if (cachedItems) return cachedItems;
  const v = await getLatestVersion();
  const res = await fetch(`${DDRAGON}/cdn/${v}/data/en_US/item.json`, {
    next: { revalidate: 60 * 60 * 12 },
  });
  const data = await res.json();
  cachedItems = data.data as Record<string, Item>;
  return cachedItems;
}

export async function championIcon(championId: string): Promise<string> {
  const v = await getLatestVersion();
  return `${DDRAGON}/cdn/${v}/img/champion/${championId}.png`;
}

export function championIconSync(championId: string, version: string): string {
  return `${DDRAGON}/cdn/${version}/img/champion/${championId}.png`;
}

export function itemIconSync(itemId: string, version: string): string {
  return `${DDRAGON}/cdn/${version}/img/item/${itemId}.png`;
}

export function championSplash(championId: string): string {
  return `${DDRAGON}/cdn/img/champion/splash/${championId}_0.jpg`;
}

export function championLoading(championId: string): string {
  return `${DDRAGON}/cdn/img/champion/loading/${championId}_0.jpg`;
}

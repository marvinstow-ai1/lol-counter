import { NextResponse } from "next/server";
import { getChampions, getLatestVersion } from "@/lib/ddragon";

export const revalidate = 3600;

export async function GET() {
  const [version, champions] = await Promise.all([
    getLatestVersion(),
    getChampions(),
  ]);

  const list = Object.values(champions).map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    tags: c.tags,
    image: c.image.full,
  }));

  return NextResponse.json({ version, champions: list });
}

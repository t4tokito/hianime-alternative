import { NextResponse } from "next/server";
import { getTrendingAnime, getPopularAnime, getTopAiringAnime } from "@/lib/anilist";

export async function GET() {
  try {
    const [trending, popular, topAiring] = await Promise.all([
      getTrendingAnime(),
      getPopularAnime(),
      getTopAiringAnime(),
    ]);
    return NextResponse.json({ trending, popular, topAiring });
  } catch {
    return NextResponse.json({ trending: [], popular: [], topAiring: [] }, { status: 500 });
  }
}

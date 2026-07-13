import { NextResponse } from "next/server";
import { getPopularAnime } from "@/lib/anilist";
import { toAnime } from "@/lib/anilist";

export async function GET() {
  try {
    const results = await getPopularAnime();
    return NextResponse.json(results.map(toAnime));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

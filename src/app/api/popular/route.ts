import { NextResponse } from "next/server";
import { getPopularAnime, toAnime } from "@/lib/anilist";

export async function GET() {
  try {
    const results = await getPopularAnime();
    return NextResponse.json(results.map(toAnime));
  } catch (e) {
    console.error("Popular API error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

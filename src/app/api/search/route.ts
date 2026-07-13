import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json([]);

  try {
    const results = await searchAnime(q);
    return NextResponse.json(results.media);
  } catch (e) {
    console.error("Search API error:", e);
    return NextResponse.json([], { status: 500 });
  }
}

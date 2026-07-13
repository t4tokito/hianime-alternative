import { NextRequest, NextResponse } from "next/server";
import { searchAnimeExternal } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    if (!q) return NextResponse.json([]);
    const results = await searchAnimeExternal(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

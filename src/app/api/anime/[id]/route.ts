import { NextRequest, NextResponse } from "next/server";
import { getAnimeById, toAnime } from "@/lib/anilist";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anilistId = parseInt(id.replace("anilist-", ""), 10);
    if (isNaN(anilistId)) return NextResponse.json(null, { status: 400 });

    const media = await getAnimeById(anilistId);
    if (!media) return NextResponse.json(null, { status: 404 });

    return NextResponse.json(toAnime(media));
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}

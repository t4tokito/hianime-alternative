import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Try fetching the home page and finding the anime by _id
    const res = await fetch(`${API_BASE}/home`, { next: { revalidate: 300 } });
    const data = await res.json();

    const allAnime = [
      ...data.trending?.animes || [],
      ...data.popular?.animes || [],
      ...data.currentlyAiring?.animes || [],
      ...data.finishedAiring?.animes || [],
      ...data.latestAnime?.animes || [],
    ];

    const anime = allAnime.find((a: { _id?: string; slug?: string }) => a._id === id || a.slug === id);
    if (anime) {
      return NextResponse.json(anime);
    }

    return NextResponse.json(null, { status: 404 });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}

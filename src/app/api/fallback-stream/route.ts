import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET(request: NextRequest) {
  const malId = request.nextUrl.searchParams.get("malId");
  const episode = request.nextUrl.searchParams.get("episode");
  const type = request.nextUrl.searchParams.get("type") || "sub";

  if (!malId || !episode) {
    return NextResponse.json({ error: "Missing malId or episode" }, { status: 400 });
  }

  try {
    // Search for anime by MAL ID to get slugs
    const searchRes = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `mal_id:${malId}` }),
    });

    if (!searchRes.ok) {
      // Try alternative: fetch from home data
      const homeRes = await fetch(`${API_BASE}/home`);
      if (homeRes.ok) {
        const homeData = await homeRes.json();
        const allAnime = [
          ...homeData.trending?.animes || [],
          ...homeData.popular?.animes || [],
          ...homeData.currentlyAiring?.animes || [],
          ...homeData.finishedAiring?.animes || [],
        ];
        const matched = allAnime.find((a: { mal_id?: number }) => a.mal_id === parseInt(malId));
        if (matched?.episodes?.[0]) {
          const slug = matched.episodes[0].slug || matched.episodes[0].slugs?.[0];
          if (slug) {
            const epRes = await fetch(`${API_BASE}/episode/${slug}`);
            if (epRes.ok) {
              const epData = await epRes.json();
              return NextResponse.json(epData);
            }
          }
        }
      }
      return NextResponse.json(null);
    }

    const searchData = await searchRes.json();

    // Find the matching anime
    const anime = Array.isArray(searchData)
      ? searchData.find((a: { mal_id?: number }) => String(a.mal_id) === String(malId))
      : null;

    if (!anime?.slugs?.length) {
      return NextResponse.json(null);
    }

    // Try each slug until we find one that works
    for (const slug of anime.slugs.slice(0, 5)) {
      try {
        const epRes = await fetch(`${API_BASE}/episode/${slug}`);
        if (epRes.ok) {
          const epData = await epRes.json();
          if (epData?.episode?.link) {
            return NextResponse.json(epData);
          }
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json(null);
  } catch (e) {
    console.error("Fallback stream error:", e);
    return NextResponse.json(null, { status: 500 });
  }
}

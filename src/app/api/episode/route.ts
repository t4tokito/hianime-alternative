import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://animedata.cfd/api";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ episode: null }, { status: 400 });

    const res = await fetch(`${API_BASE}/episode/${slug}`);
    const data = await res.json();
    const ep = data.episode;

    // If anime_id is empty, try to find it from home data
    if (ep && (!ep.anime_id || Object.keys(ep.anime_id).length === 0)) {
      try {
        const homeRes = await fetch(`${API_BASE}/home`);
        const homeData = await homeRes.json();
        const allAnime = [
          ...homeData.trending?.animes || [],
          ...homeData.popular?.animes || [],
          ...homeData.currentlyAiring?.animes || [],
          ...homeData.finishedAiring?.animes || [],
          ...homeData.latestAnime?.animes || [],
        ];

        // Extract anime name from slug: "naruto-shippuden-episode-500-o1g0qc" → try to match
        const slugAnimePart = slug.replace(/-episode-\d+.*/, '').replace(/-[a-z0-9]{6}$/, '');

        const matched = allAnime.find((a: { title?: string; slug?: string; mal_id?: number }) => {
          const aSlug = (a.slug || '').replace(/-[a-z0-9]{6}$/, '');
          return aSlug === slugAnimePart || a.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slugAnimePart;
        });

        if (matched) {
          ep.anime_id = {
            _id: matched._id,
            title: matched.title,
            mal_id: matched.mal_id,
            slug: matched.slug,
          };
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ episode: null }, { status: 500 });
  }
}

const ANILIST_URL = "https://graphql.anilist.co";

async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList query failed");
  return json.data;
}

export interface AniListMedia {
  id: number;
  title: { english: string | null; romaji: string | null; native: string | null };
  coverImage: { large: string | null; medium: string | null };
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  status: string;
  averageScore: number | null;
  genres: string[];
  format: string;
  duration: number | null;
  season: string | null;
  seasonYear: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  NextAiringEpisode: { episode: number; airingAt: number } | null;
  characters: {
    nodes: {
      id: number;
      name: { full: string };
      image: { large: string | null };
      role: string;
      voiceActors: {
        id: number;
        name: { full: string };
        image: { large: string | null };
        language: string;
      }[];
    }[];
  } | null;
  relations: {
    edges: {
      relationType: string;
      node: { id: number; title: { english: string | null; romaji: string | null }; format: string };
    }[];
  } | null;
  recommendations: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { english: string | null; romaji: string | null };
        coverImage: { large: string | null };
        averageScore: number | null;
        episodes: number | null;
        format: string;
      };
    }[];
  } | null;
  studios: { nodes: { name: string }[] } | null;
}

const MEDIA_FIELDS = `
  id
  title { english romaji native }
  coverImage { large medium }
  bannerImage
  description(asHtml: false)
  episodes
  status
  averageScore
  genres
  format
  duration
  season
  seasonYear
  startDate { year month day }
  NextAiringEpisode: nextAiringEpisode { episode airingAt }
  characters(perPage: 10, sort: ROLE) {
    nodes {
      id
      name { full }
      image { large }
      role
      voiceActors(sort: LANGUAGE, limit: 2) {
        id
        name { full }
        image { large }
        language
      }
    }
  }
  relations {
    edges {
      relationType
      node {
        id
        title { english romaji }
        format
      }
    }
  }
  recommendations(perPage: 10, sort: RATING_DESC) {
    nodes {
      mediaRecommendation {
        id
        title { english romaji }
        coverImage { large }
        averageScore
        episodes
        format
      }
    }
  }
  studios(isMain: true) { nodes { name } }
`;

// ============ Public API ============

export async function getTrendingAnime(): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC, status: RELEASING) { ${MEDIA_FIELDS} }
      }
    }`,
    { page: 1, perPage: 12 }
  );
  return data.Page.media;
}

export async function getPopularAnime(): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
    }`,
    { page: 1, perPage: 12 }
  );
  return data.Page.media;
}

export async function getTopAiringAnime(): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC, status: RELEASING) { ${MEDIA_FIELDS} }
      }
    }`,
    { page: 1, perPage: 12 }
  );
  return data.Page.media;
}

export async function getRecentlyUpdatedAnime(): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: UPDATED_AT_DESC) { ${MEDIA_FIELDS} }
      }
    }`,
    { page: 1, perPage: 12 }
  );
  return data.Page.media;
}

export async function getUpcomingAnime(): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED) { ${MEDIA_FIELDS} }
      }
    }`,
    { page: 1, perPage: 12 }
  );
  return data.Page.media;
}

export async function searchAnime(query: string, page = 1): Promise<{ media: AniListMedia[]; totalPages: number }> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[]; pageInfo: { lastPage: number } } }>(
    `query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_FIELDS} }
        pageInfo { lastPage }
      }
    }`,
    { search: query, page, perPage: 20 }
  );
  return { media: data.Page.media, totalPages: data.Page.pageInfo.lastPage };
}

export async function getAnimeById(id: number): Promise<AniListMedia | null> {
  const data = await anilistQuery<{ Media: AniListMedia | null }>(
    `query ($id: Int) {
      Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
    }`,
    { id }
  );
  return data.Media;
}

export async function getSeasonalAnime(season: string, year: number): Promise<AniListMedia[]> {
  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(
    `query ($season: MediaSeason, $year: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
      }
    }`,
    { season, year, perPage: 12 }
  );
  return data.Page.media;
}

// ============ Streaming URL helpers ============

export function getStreamUrl(malId: number, episode: number, type: "sub" | "dub" = "sub", server = 0): string {
  const servers = [
    `https://zokoanime.video/stream/mal/${malId}/${episode}/${type}`,
    `https://animeplay.cfd/stream/mal/${malId}/${episode}/${type}`,
  ];
  return servers[server] || servers[0];
}

// Convert AniList media to our Anime type for backwards compatibility
export function toAnime(anilist: AniListMedia): {
  _id: string;
  title: string;
  image: string;
  bannerImage: string | null;
  description: string;
  Type: string;
  Status: string;
  Score: string;
  Duration: string;
  genres: string[];
  episodes: number;
  mal_id: number | null;
  totalSubbed: number;
  totalDubbed: number;
  Japanese: string;
  Aired: string;
  Broadcast: string;
  studios: string;
  related: { id: number; title: string; format: string; image: string }[];
  recommended: { id: number; title: string; format: string; image: string; score: number | null; episodes: number | null }[];
  characters: { name: string; image: string; role: string; voiceActors: { name: string; image: string; language: string }[] }[];
} {
  const startDate = anilist.startDate?.year
    ? `${anilist.startDate.year}-${String(anilist.startDate.month || 1).padStart(2, "0")}-${String(anilist.startDate.day || 1).padStart(2, "0")}`
    : "TBA";

  return {
    _id: `anilist-${anilist.id}`,
    title: anilist.title.english || anilist.title.romaji || "Unknown",
    image: anilist.coverImage?.large || anilist.coverImage?.medium || "",
    bannerImage: anilist.bannerImage,
    description: anilist.description?.replace(/<[^>]*>/g, "").replace(/&#039;/g, "'").replace(/&quot;/g, '"') || "",
    Type: anilist.format || "TV",
    Status: anilist.status,
    Score: anilist.averageScore ? `${(anilist.averageScore / 10).toFixed(1)}` : "N/A",
    Duration: anilist.duration ? `${anilist.duration} min` : "Unknown",
    genres: anilist.genres || [],
    episodes: anilist.episodes || 0,
    mal_id: null,
    totalSubbed: 0,
    totalDubbed: 0,
    Japanese: anilist.title.native || "",
    Aired: startDate,
    Broadcast: anilist.season && anilist.seasonYear ? `${anilist.season} ${anilist.seasonYear}` : "",
    studios: anilist.studios?.nodes?.map((n) => n.name).join(", ") || "",
    related: anilist.relations?.edges
      ?.filter((e) => ["PREQUEL", "SEQUEL", "SPIN_OFF", "SIDE_STORY"].includes(e.relationType))
      .map((e) => ({
        id: e.node.id,
        title: e.node.title.english || e.node.title.romaji || "",
        format: e.node.format || "",
        image: "",
      })) || [],
    recommended: anilist.recommendations?.nodes?.map((n) => ({
      id: n.mediaRecommendation.id,
      title: n.mediaRecommendation.title.english || n.mediaRecommendation.title.romaji || "",
      format: n.mediaRecommendation.format || "",
      image: n.mediaRecommendation.coverImage?.large || "",
      score: n.mediaRecommendation.averageScore,
      episodes: n.mediaRecommendation.episodes,
    })) || [],
    characters: anilist.characters?.nodes?.map((c) => ({
      name: c.name.full,
      image: c.image?.large || "",
      role: c.role,
      voiceActors: c.voiceActors?.map((va) => ({
        name: va.name.full,
        image: va.image?.large || "",
        language: va.language,
      })) || [],
    })) || [],
  };
}

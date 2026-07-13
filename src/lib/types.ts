export interface Anime {
  _id?: string;
  id?: string;
  mal_id?: number;
  title: string;
  English?: string;
  Japanese?: string;
  slug?: string;
  slugs?: string[];
  image?: string;
  poster?: string;
  synopsis?: string;
  description?: string;
  Type?: string;
  type?: string;
  Duration?: string;
  duration?: string;
  Status?: string;
  status?: string;
  Score?: string;
  score?: number;
  rating?: string;
  Aired?: string;
  Broadcast?: string;
  Source?: string;
  Genres?: string[];
  genres?: string[];
  Episodes?: number;
  episodes?: number | { slug: string; slugs?: string[]; episodeNumber?: number; title?: string; link?: EpisodeLink; }[];
  totalSubbed?: number;
  totalDubbed?: number;
  anime_info?: AnimeInfoNested;
  anime_id?: Anime | string;
  link?: EpisodeLink;
  episodeNumber?: number;
}

export interface AnimeInfoNested {
  title?: string;
  Japanese?: string;
  image?: string;
  synopsis?: string;
  Type?: string;
  Duration?: string;
  genres?: string[];
  Aired?: string;
  Status?: string;
  totalSubbed?: number;
  totalDubbed?: number;
}

export interface EpisodeLink {
  sub: string[];
  dub: string[];
}

export interface FeaturedItem {
  anime: Anime;
}

export interface TrendingData {
  animes: Anime[];
}

export interface HomeData {
  featured: FeaturedItem[];
  trending: TrendingData;
  popular: TrendingData;
  currentlyAiring: TrendingData;
  finishedAiring: TrendingData;
  latestAnime: TrendingData;
  latestEpisodes: {
    episodes: Anime[];
    currentPage?: number;
    totalPages?: number;
    total?: number;
  };
}

export interface EpisodeData {
  episode: {
    id: string;
    link: EpisodeLink;
    public_id: string[];
    slug: string;
    episodeNumber?: number;
    title?: string;
    anime_id?: Anime;
  };
}

export interface SearchResults {
  animes: Anime[];
  nextCursor?: string;
  hasNextPage?: boolean;
  pageSize?: number;
}

export interface AnimeListResponse {
  animes: Anime[];
  nextCursor?: string;
  hasNextPage?: boolean;
  pageSize?: number;
}

import { RawArticle } from "@/types/news";
import { getCached, setCache } from "@/lib/cache";

const API_KEY = process.env.NEWSAPI_KEY;
const CACHE_KEY = "newsapi-articles";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  source: { name: string };
  publishedAt: string;
}

interface NewsAPIResponse {
  status: string;
  articles: NewsAPIArticle[];
}

export async function fetchNewsAPI(): Promise<RawArticle[]> {
  if (!API_KEY) return [];

  const cached = getCached<RawArticle[]>(CACHE_KEY);
  if (cached) return cached;

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", "Alzheimer");
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "30");

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": API_KEY },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.error(`[NewsAPI] HTTP ${res.status}`);
    return [];
  }

  const data: NewsAPIResponse = await res.json();
  if (data.status !== "ok") return [];

  const articles: RawArticle[] = data.articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a) => ({
      title: a.title,
      description: (a.description ?? "").slice(0, 500),
      url: a.url,
      imageUrl: a.urlToImage ?? undefined,
      source: a.source.name,
      publishedAt: a.publishedAt,
      language: "en" as const,
    }));

  setCache(CACHE_KEY, articles, CACHE_TTL);
  return articles;
}

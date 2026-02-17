import { RawArticle } from "@/types/news";
import { getCached, setCache } from "@/lib/cache";

const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const CACHE_KEY = "naver-articles";
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "900", 10) * 1000;

const QUERIES = ["아리바이오", "알츠하이머 치료제"];

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverResponse {
  items: NaverNewsItem[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

async function searchNaver(query: string): Promise<RawArticle[]> {
  const url = new URL("https://openapi.naver.com/v1/search/news.json");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "30");
  url.searchParams.set("sort", "date");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": CLIENT_ID!,
      "X-Naver-Client-Secret": CLIENT_SECRET!,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    console.error(`[Naver] HTTP ${res.status} for query "${query}"`);
    return [];
  }

  const data: NaverResponse = await res.json();

  return (data.items ?? []).map((item) => ({
    title: stripHtml(item.title),
    description: stripHtml(item.description).slice(0, 500),
    url: item.originallink || item.link,
    source: "네이버 뉴스",
    publishedAt: new Date(item.pubDate).toISOString(),
    language: "ko" as const,
  }));
}

export async function fetchNaver(): Promise<RawArticle[]> {
  if (!CLIENT_ID || !CLIENT_SECRET) return [];

  const cached = getCached<RawArticle[]>(CACHE_KEY);
  if (cached) return cached;

  const results = await Promise.allSettled(
    QUERIES.map((q) => searchNaver(q))
  );

  const articles: RawArticle[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const article of result.value) {
        const key = article.url.replace(/\/+$/, "").toLowerCase();
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          articles.push(article);
        }
      }
    }
  }

  setCache(CACHE_KEY, articles, CACHE_TTL);
  return articles;
}

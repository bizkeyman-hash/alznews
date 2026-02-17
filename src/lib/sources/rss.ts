import Parser from "rss-parser";
import { RawArticle } from "@/types/news";
import { RSS_FEEDS, ALZ_KEYWORDS } from "@/lib/constants";
import { getCached, setCache } from "@/lib/cache";

const parser = new Parser({
  timeout: 15_000,
  headers: {
    "User-Agent": "AlzNews/1.0 (RSS Reader)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

const CACHE_KEY = "rss-articles";
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "900", 10) * 1000;

function isAlzRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return ALZ_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

export async function fetchRSS(): Promise<RawArticle[]> {
  const cached = getCached<RawArticle[]>(CACHE_KEY);
  if (cached) return cached;

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      const items: RawArticle[] = [];

      for (const item of parsed.items ?? []) {
        const title = item.title?.trim() ?? "";
        const description =
          item.contentSnippet?.trim() || item.content?.trim() || "";

        if (!title) continue;
        if (!feed.alzSpecific && !isAlzRelated(title, description)) continue;

        items.push({
          title,
          description: description.slice(0, 500),
          url: item.link ?? "",
          imageUrl: item.enclosure?.url || extractImageFromContent(item.content),
          source: feed.source,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          language: isKorean(title) ? "ko" : "en",
        });
      }

      return items;
    })
  );

  const articles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  setCache(CACHE_KEY, articles, CACHE_TTL);
  return articles;
}

function extractImageFromContent(content?: string): string | undefined {
  if (!content) return undefined;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function isKorean(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text);
}

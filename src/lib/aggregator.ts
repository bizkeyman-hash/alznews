import crypto from "crypto";
import { Article, RawArticle } from "@/types/news";
import { categorize } from "@/lib/categorize";
import { fetchRSS } from "@/lib/sources/rss";
import { fetchNewsAPI } from "@/lib/sources/newsapi";
import { fetchClinicalTrials } from "@/lib/sources/clinicaltrials";
import { fetchNaver } from "@/lib/sources/naver";
import { scoreArticles } from "@/lib/scoring";
import { summarizeArticles } from "@/lib/summarize";
import { mockArticles } from "@/lib/mock-data";
import {
  kvGetAllArticles,
  kvSetArticles,
  kvClearArticles,
} from "@/lib/kv";

// In-memory cache (tier 1) — survives within a warm instance
const articleStore = new Map<string, Article>();

// Whether we've loaded from KV on this instance's first request
let kvLoaded = false;

export async function clearArticleStore(): Promise<void> {
  articleStore.clear();
  kvLoaded = false;
  await kvClearArticles();
}

// Last aggregation stats (for logging from route handlers)
let lastAggregationStats = { newCount: 0, totalCount: 0 };
export function getAggregationStats() {
  return lastAggregationStats;
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "").toLowerCase();
}

const BLOCKED_DOMAINS = ["msn.com"];
const BLOCKED_SOURCES = ["MSN", "프리스탁뉴스", "네이트"];

function isBlocked(url: string, title: string): boolean {
  // Check URL domain
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
      return true;
    }
  } catch { /* ignore */ }

  // Check title suffix (Google News RSS format: "Title - Source")
  const match = title.match(/\s+-\s+([^-]+)$/);
  if (match && BLOCKED_SOURCES.some((s) => match[1].trim().toLowerCase() === s.toLowerCase())) {
    return true;
  }

  return false;
}

function generateId(source: string, url: string): string {
  return crypto
    .createHash("md5")
    .update(`${source}:${url}`)
    .digest("hex")
    .slice(0, 12);
}

function normalize(raw: RawArticle): Article {
  return {
    id: generateId(raw.source, raw.url),
    title: raw.title,
    description: raw.description,
    fullContent: raw.fullContent,
    source: raw.source,
    category: categorize(raw.title, raw.description),
    imageUrl: raw.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(raw.title.slice(0, 20))}/600/400`,
    url: raw.url,
    publishedAt: raw.publishedAt,
    language: raw.language,
  };
}

function deduplicateByUrl(articles: Article[]): Article[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.url.replace(/\/+$/, "").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function tokenize(text: string): Set<string> {
  // Split into 2-gram tokens for Korean/mixed text comparison
  const normalized = text.replace(/[\s,.\-–—·:;'"!?()[\]{}]+/g, "").toLowerCase();
  const tokens = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i++) {
    tokens.add(normalized.slice(i, i + 2));
  }
  return tokens;
}

function titleSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const smaller = Math.min(setA.size, setB.size);
  return intersection / smaller;
}

interface GetArticlesOptions {
  category?: string;
  limit?: number;
}

export async function getArticles(
  options: GetArticlesOptions = {}
): Promise<Article[]> {
  const { category, limit } = options;

  // Tier 1: Cold start — load from KV into in-memory cache
  if (!kvLoaded) {
    try {
      const kvArticles = await kvGetAllArticles();
      if (kvArticles.size > 0) {
        for (const [key, val] of kvArticles) {
          if (isBlocked(val.url, val.title)) continue;
          articleStore.set(key, val);
        }
        console.log(`[Aggregator] Loaded ${kvArticles.size} articles from KV`);

        // Backfill summaries for existing non-blocked articles
        const unsummarized = Array.from(articleStore.entries()).filter(
          ([, a]) => !a.summary
        );
        if (unsummarized.length > 0) {
          console.log(`[Aggregator] Backfilling summaries for ${unsummarized.length} articles`);
          try {
            const summarized = await summarizeArticles(unsummarized.map(([, a]) => a));
            const updates = new Map<string, Article>();
            for (const article of summarized) {
              if (article.summary) {
                const key = normalizeUrl(article.url);
                articleStore.set(key, article);
                updates.set(key, article);
              }
            }
            if (updates.size > 0) {
              await kvSetArticles(updates);
              console.log(`[Aggregator] Backfilled ${updates.size} summaries`);
            }
          } catch (err) {
            console.error("[Aggregator] Summary backfill failed:", err);
          }
        }
      }
    } catch (err) {
      console.error("[Aggregator] KV load failed, continuing with empty store:", err);
    }
    kvLoaded = true;
  }

  const results = await Promise.allSettled([
    fetchRSS(),
    fetchNewsAPI(),
    fetchClinicalTrials(),
    fetchNaver(),
  ]);

  const rawArticles: RawArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      rawArticles.push(...result.value);
    } else {
      console.error("[Aggregator] Source failed:", result.reason);
    }
  }

  if (rawArticles.length === 0 && articleStore.size === 0) {
    console.warn("[Aggregator] All sources failed and store empty, using mock data");
    let fallback = [...mockArticles];
    if (category) fallback = fallback.filter((a) => a.category === category);
    if (limit) fallback = fallback.slice(0, limit);
    return fallback;
  }

  // Normalize, filter blocked domains, and dedup within the fetched batch
  let batchArticles = rawArticles.map(normalize);
  batchArticles = batchArticles.filter((a) => !isBlocked(a.url, a.title));
  batchArticles = deduplicateByUrl(batchArticles);

  // Filter out articles already in the store
  const newArticles = batchArticles.filter(
    (a) => !articleStore.has(normalizeUrl(a.url))
  );

  if (newArticles.length > 0) {
    // Sort new articles by date desc for title dedup (newest first)
    newArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Dedup new articles by title, also comparing against existing store articles
    const existingArticles = Array.from(articleStore.values());
    const dedupedNew: Article[] = [];
    for (const article of newArticles) {
      const isDuplicateOfExisting = existingArticles.some(
        (kept) => titleSimilarity(kept.title, article.title) >= 0.5
      );
      const isDuplicateOfNew = dedupedNew.some(
        (kept) => titleSimilarity(kept.title, article.title) >= 0.5
      );
      if (!isDuplicateOfExisting && !isDuplicateOfNew) {
        dedupedNew.push(article);
      }
    }

    // Score and summarize new articles
    const scoredNew = await scoreArticles(dedupedNew);
    const summarizedNew = await summarizeArticles(scoredNew);

    // Build a map of new articles to persist to KV
    const newKvEntries = new Map<string, Article>();
    for (const article of summarizedNew) {
      const key = normalizeUrl(article.url);
      articleStore.set(key, article);
      newKvEntries.set(key, article);
    }

    // Persist new articles to KV (non-blocking — don't await in critical path)
    kvSetArticles(newKvEntries).catch((err) =>
      console.error("[Aggregator] KV write failed:", err)
    );

    lastAggregationStats = { newCount: summarizedNew.length, totalCount: articleStore.size };
  } else {
    lastAggregationStats = { newCount: 0, totalCount: articleStore.size };
  }

  // Return all articles from store, sorted by date desc
  let articles = Array.from(articleStore.values());
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (category) {
    articles = articles.filter((a) => a.category === category);
  }
  if (limit) {
    articles = articles.slice(0, limit);
  }

  return articles;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const articles = await getArticles();
  return articles.find((a) => a.id === id) ?? null;
}

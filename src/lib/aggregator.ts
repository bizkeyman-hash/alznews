import crypto from "crypto";
import { Article, RawArticle } from "@/types/news";
import { categorize } from "@/lib/categorize";
import { fetchRSS } from "@/lib/sources/rss";
import { fetchNewsAPI } from "@/lib/sources/newsapi";
import { fetchClinicalTrials } from "@/lib/sources/clinicaltrials";
import { fetchNaver } from "@/lib/sources/naver";
import { scoreArticles } from "@/lib/scoring";
import { mockArticles } from "@/lib/mock-data";

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

function deduplicateByTitle(articles: Article[]): Article[] {
  // articles must be sorted by date desc (newest first)
  const result: Article[] = [];
  for (const article of articles) {
    const isDuplicate = result.some(
      (kept) => titleSimilarity(kept.title, article.title) >= 0.5
    );
    if (!isDuplicate) {
      result.push(article);
    }
  }
  return result;
}

interface GetArticlesOptions {
  category?: string;
  limit?: number;
}

export async function getArticles(
  options: GetArticlesOptions = {}
): Promise<Article[]> {
  const { category, limit } = options;

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

  if (rawArticles.length === 0) {
    console.warn("[Aggregator] All sources failed, using mock data");
    let fallback = [...mockArticles];
    if (category) fallback = fallback.filter((a) => a.category === category);
    if (limit) fallback = fallback.slice(0, limit);
    return fallback;
  }

  let articles = rawArticles.map(normalize);
  articles = deduplicateByUrl(articles);
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  articles = deduplicateByTitle(articles);

  articles = await scoreArticles(articles);

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

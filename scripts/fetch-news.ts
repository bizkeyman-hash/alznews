import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Article, RawArticle } from "@/types/news";
import { categorize } from "@/lib/categorize";
import { fetchRSS } from "@/lib/sources/rss";
import { fetchNewsAPI } from "@/lib/sources/newsapi";
import { fetchClinicalTrials } from "@/lib/sources/clinicaltrials";
import { fetchNaver } from "@/lib/sources/naver";
import { scoreArticles } from "@/lib/scoring";

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
    imageUrl:
      raw.imageUrl ||
      `https://picsum.photos/seed/${encodeURIComponent(raw.title.slice(0, 20))}/600/400`,
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
  const normalized = text
    .replace(/[\s,.\-–—·:;'"!?()[\]{}]+/g, "")
    .toLowerCase();
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

async function main() {
  console.log("[fetch-news] RSS/API 소스에서 기사 수집 중...");

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
      console.error("[fetch-news] Source failed:", result.reason);
    }
  }

  if (rawArticles.length === 0) {
    console.error("[fetch-news] 모든 소스에서 기사를 가져오지 못했습니다.");
    process.exit(1);
  }

  console.log(`[fetch-news] 수집된 raw 기사: ${rawArticles.length}개`);

  // Normalize → URL dedup → sort by date → title dedup → score
  let articles = rawArticles.map(normalize);
  articles = deduplicateByUrl(articles);
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  articles = deduplicateByTitle(articles);
  articles = await scoreArticles(articles);

  console.log(`[fetch-news] 중복 제거 후: ${articles.length}개`);

  // Check existing news.json for already-summarized URLs
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const newsJsonPath = path.join(dataDir, "news.json");
  const summarizedUrls = new Set<string>();

  if (fs.existsSync(newsJsonPath)) {
    try {
      const existing: Article[] = JSON.parse(
        fs.readFileSync(newsJsonPath, "utf-8")
      );
      for (const a of existing) {
        if (a.summary) {
          summarizedUrls.add(a.url.replace(/\/+$/, "").toLowerCase());
        }
      }
      console.log(
        `[fetch-news] 기존 요약 완료 기사: ${summarizedUrls.size}개`
      );
    } catch {
      console.warn("[fetch-news] 기존 news.json 읽기 실패, 무시합니다.");
    }
  }

  // Filter to only new (unsummarized) articles
  const newArticles = articles.filter(
    (a) => !summarizedUrls.has(a.url.replace(/\/+$/, "").toLowerCase())
  );

  // Save new articles to raw-news.json
  const rawPath = path.join(dataDir, "raw-news.json");
  fs.writeFileSync(rawPath, JSON.stringify(newArticles, null, 2), "utf-8");

  console.log(`\n[fetch-news] ✅ ${newArticles.length}개 새 기사 분석 필요`);
  console.log(`[fetch-news] 저장: ${rawPath}`);
}

main().catch((err) => {
  console.error("[fetch-news] Error:", err);
  process.exit(1);
});

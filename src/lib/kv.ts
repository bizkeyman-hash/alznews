import { kv } from "@vercel/kv";
import { Article } from "@/types/news";

const ARTICLES_KEY = "articles";

export async function kvGetAllArticles(): Promise<Map<string, Article>> {
  const raw = await kv.hgetall<Record<string, Article>>(ARTICLES_KEY);
  if (!raw) return new Map();
  return new Map(Object.entries(raw));
}

export async function kvHasArticle(normalizedUrl: string): Promise<boolean> {
  const val = await kv.hexists(ARTICLES_KEY, normalizedUrl);
  return val === 1;
}

export async function kvSetArticles(
  articles: Map<string, Article>
): Promise<void> {
  if (articles.size === 0) return;
  const obj: Record<string, Article> = {};
  for (const [key, val] of articles) {
    obj[key] = val;
  }
  await kv.hset(ARTICLES_KEY, obj);
}

export async function kvClearArticles(): Promise<void> {
  await kv.del(ARTICLES_KEY);
}

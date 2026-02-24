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

// ── Favorites (Redis set) ──

const FAVORITES_KEY = "favorites";

export async function kvAddFavorite(articleId: string): Promise<void> {
  await kv.sadd(FAVORITES_KEY, articleId);
}

export async function kvRemoveFavorite(articleId: string): Promise<void> {
  await kv.srem(FAVORITES_KEY, articleId);
}

export async function kvGetFavorites(): Promise<Set<string>> {
  const members = await kv.smembers(FAVORITES_KEY);
  return new Set(members ?? []);
}

// ── Single article deletion ──

export async function kvDeleteArticle(normalizedUrl: string): Promise<void> {
  await kv.hdel(ARTICLES_KEY, normalizedUrl);
}

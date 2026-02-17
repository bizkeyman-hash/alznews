interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "900", 10) * 1000;

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs?: number): void {
  store.set(key, {
    data,
    expiresAt: Date.now() + (ttlMs ?? DEFAULT_TTL),
  });
}

export function clearCache(): void {
  store.clear();
}

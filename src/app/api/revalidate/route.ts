import { NextRequest, NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";
import { getArticles, getAggregationStats, cleanupArticleStore } from "@/lib/aggregator";
import { kvGetFavorites } from "@/lib/kv";

export const maxDuration = 60;

async function revalidate(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // If an Authorization header is present, validate it (external cron).
  // Browser refresh button sends no auth header, so it passes through.
  const auth = request.headers.get("authorization");
  if (auth && secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clear RSS source cache then fetch fresh articles on THIS instance
  clearCache();
  await getArticles();
  const stats = getAggregationStats();
  console.log(
    `[Revalidate] Fetched ${stats.newCount} new articles, ${stats.totalCount} total`
  );

  // Cleanup articles older than 30 days (exclude favorites)
  const favoriteIds = await kvGetFavorites();
  const removed = await cleanupArticleStore(favoriteIds);

  return NextResponse.json({
    revalidated: true,
    newCount: stats.newCount,
    totalCount: stats.totalCount,
    cleanedUp: removed,
    timestamp: new Date().toISOString(),
  });
}

// POST: browser refresh button / external cron
export async function POST(request: NextRequest) {
  return revalidate(request);
}

// GET: Vercel Cron
export async function GET(request: NextRequest) {
  return revalidate(request);
}

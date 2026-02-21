import { NextRequest, NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";
import { getArticles, getAggregationStats } from "@/lib/aggregator";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
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

  return NextResponse.json({
    revalidated: true,
    newCount: stats.newCount,
    totalCount: stats.totalCount,
    timestamp: new Date().toISOString(),
  });
}

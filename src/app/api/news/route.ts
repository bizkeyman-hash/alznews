import { NextRequest, NextResponse } from "next/server";
import { getArticles, getAggregationStats } from "@/lib/aggregator";
import { kvGetFavorites } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const favoritesOnly = searchParams.get("favorites") === "true";

  let favoriteIds: Set<string> | undefined;
  if (favoritesOnly) {
    favoriteIds = await kvGetFavorites();
  }

  const { articles, total } = await getArticles({
    category,
    limit,
    offset,
    favoriteIds,
  });
  const stats = getAggregationStats();
  console.log(
    `[Aggregator] ${stats.newCount} new articles, ${stats.totalCount} total in store → returning ${articles.length}`
  );

  return NextResponse.json({
    count: articles.length,
    total,
    articles,
  });
}

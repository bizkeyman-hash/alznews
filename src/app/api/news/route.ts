import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") || undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : undefined;

  const articles = await getArticles({ category, limit });

  return NextResponse.json({
    count: articles.length,
    articles,
  });
}

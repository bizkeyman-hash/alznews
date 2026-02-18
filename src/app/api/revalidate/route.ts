import { NextRequest, NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";
import { clearScoreCache } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // If an Authorization header is present, validate it (external cron).
  // Browser refresh button sends no auth header, so it passes through.
  const auth = request.headers.get("authorization");
  if (auth && secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearCache();
  clearScoreCache();

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

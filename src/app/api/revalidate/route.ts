import { NextRequest, NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // If an Authorization header is present, validate it (external cron).
  // Browser refresh button sends no auth header, so it passes through.
  const auth = request.headers.get("authorization");
  if (auth && secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only clear RSS source cache — score cache and article store are preserved
  // so that only new articles are processed on the next fetch
  clearCache();
  console.log("[Revalidate] Source cache cleared, new articles will be fetched on next request");

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

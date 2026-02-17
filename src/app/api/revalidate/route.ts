import { NextRequest, NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";
import { clearScoreCache } from "@/lib/scoring";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  clearCache();
  clearScoreCache();

  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

import { NextRequest, NextResponse } from "next/server";
import { kvAddFavorite, kvRemoveFavorite } from "@/lib/kv";

export async function POST(request: NextRequest) {
  const { articleId } = await request.json();
  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }
  await kvAddFavorite(articleId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { articleId } = await request.json();
  if (!articleId) {
    return NextResponse.json({ error: "articleId required" }, { status: 400 });
  }
  await kvRemoveFavorite(articleId);
  return NextResponse.json({ ok: true });
}

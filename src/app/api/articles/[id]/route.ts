import { NextRequest, NextResponse } from "next/server";
import { deleteArticleById } from "@/lib/aggregator";
import { kvRemoveFavorite } from "@/lib/kv";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Also remove from favorites if it was there
  await kvRemoveFavorite(id);
  const deleted = await deleteArticleById(id);
  if (!deleted) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/types/news";
import NewsTile from "./NewsTile";
import NewsList from "./NewsList";

interface NewsGridProps {
  articles: Article[];
  initialFavoriteIds?: string[];
  category?: string;
  totalCount: number;
}

export default function NewsGrid({
  articles: initialArticles,
  initialFavoriteIds = [],
  category,
  totalCount,
}: NewsGridProps) {
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");
  const [isRefreshing, startTransition] = useTransition();
  const router = useRouter();

  // Articles loaded so far
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [hasMore, setHasMore] = useState(initialArticles.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(initialFavoriteIds)
  );

  // Removed IDs (optimistic UI)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset state when initialArticles change (e.g., page navigation)
  useEffect(() => {
    setArticles(initialArticles);
    setHasMore(initialArticles.length < totalCount);
    setRemovedIds(new Set());
  }, [initialArticles, totalCount]);

  useEffect(() => {
    setFavorites(new Set(initialFavoriteIds));
  }, [initialFavoriteIds]);

  // Build query string for fetching more
  const buildUrl = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set("offset", String(offset));
      params.set("limit", "20");
      if (category === "favorites") {
        params.set("favorites", "true");
      } else if (category) {
        params.set("category", category);
      }
      return `/api/news?${params.toString()}`;
    },
    [category]
  );

  // Infinite scroll: load more
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(buildUrl(articles.length));
      const data = await res.json();
      if (data.articles.length === 0) {
        setHasMore(false);
      } else {
        setArticles((prev) => [...prev, ...data.articles]);
        setHasMore(articles.length + data.articles.length < data.total);
      }
    } catch (err) {
      console.error("[NewsGrid] Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, articles.length, buildUrl]);

  // IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(async (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const wasFavorited = next.has(id);
      if (wasFavorited) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Fire API call (optimistic, no await)
      fetch("/api/favorites", {
        method: wasFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id }),
      }).catch(console.error);
      return next;
    });
  }, []);

  // Delete article
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("이 기사를 영구적으로 삭제하시겠습니까?")) return;
    // Optimistic removal
    setRemovedIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        // Revert on failure
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  function handleRefresh() {
    startTransition(async () => {
      await fetch("/api/revalidate", { method: "POST" });
      router.refresh();
    });
  }

  // Filter out removed articles
  const visibleArticles = articles.filter((a) => !removedIds.has(a.id));

  return (
    <div>
      {/* Control bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#2A2D45]/50 bg-[#181B2E]/60 p-3 backdrop-blur">
        <p className="text-sm text-[#636789]">전체 {totalCount - removedIds.size}건</p>

        <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D45] bg-[#181B2E] px-3 py-1.5 text-sm text-[#9094B0] transition-all hover:border-[#3D4163] hover:text-slate-200 active:scale-95 disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isRefreshing ? "animate-spin" : ""}`}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          {isRefreshing ? "갱신 중..." : "새로고침"}
        </button>
        <button
          onClick={() => setViewMode(viewMode === "tile" ? "list" : "tile")}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A2D45] bg-[#181B2E] px-3 py-1.5 text-sm text-[#9094B0] transition-all hover:border-[#3D4163] hover:text-slate-200 active:scale-95"
        >
          {viewMode === "tile" ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              리스트 보기
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              타일 보기
            </>
          )}
        </button>
        </div>
      </div>

      {viewMode === "tile" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article) => (
            <NewsTile
              key={article.id}
              article={article}
              isFavorited={favorites.has(article.id)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <NewsList
          articles={visibleArticles}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2D45] border-t-indigo-400" />
        </div>
      )}
      {!hasMore && visibleArticles.length > 0 && (
        <p className="py-6 text-center text-sm text-[#636789]">
          모든 기사를 불러왔습니다
        </p>
      )}
    </div>
  );
}

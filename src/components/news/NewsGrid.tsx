"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/types/news";
import NewsTile from "./NewsTile";
import NewsList from "./NewsList";

interface NewsGridProps {
  articles: Article[];
}

export default function NewsGrid({ articles }: NewsGridProps) {
  const [viewMode, setViewMode] = useState<"tile" | "list">("tile");
  const [isRefreshing, startTransition] = useTransition();
  const router = useRouter();

  function handleRefresh() {
    startTransition(async () => {
      await fetch("/api/revalidate", { method: "POST" });
      router.refresh();
    });
  }

  return (
    <div>
      {/* Control bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#2A2D45]/50 bg-[#181B2E]/60 p-3 backdrop-blur">
        <p className="text-sm text-[#636789]">전체 {articles.length}건</p>

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
          {articles.map((article) => (
            <NewsTile key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <NewsList articles={articles} />
      )}
    </div>
  );
}

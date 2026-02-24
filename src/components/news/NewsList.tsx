import { Article } from "@/types/news";
import { CATEGORY_NAME_MAP, CATEGORY_COLORS } from "@/lib/constants";
import ImportanceBar from "./ImportanceBar";

interface NewsListProps {
  articles: Article[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function NewsList({ articles, favorites, onToggleFavorite, onDelete }: NewsListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#2A2D45] bg-[#181B2E]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2A2D45] bg-[#12141F] text-left text-sm text-[#9094B0]">
            <th className="px-4 py-3 font-medium">카테고리</th>
            <th className="px-4 py-3 font-medium">제목</th>
            <th className="hidden w-32 px-4 py-3 font-medium md:table-cell">중요도</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">출처</th>
            <th className="px-4 py-3 text-right font-medium whitespace-nowrap">날짜</th>
            <th className="w-20 px-4 py-3 text-center font-medium">액션</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#23263B]">
          {articles.map((article, index) => {
            const categoryName =
              CATEGORY_NAME_MAP[article.category] ?? article.category;
            const badgeClass = CATEGORY_COLORS[article.category] ?? "bg-[#23263B] text-[#9094B0] ring-1 ring-[#2A2D45]";
            const isFav = favorites.has(article.id);
            return (
              <tr
                key={article.id}
                className={`border-l-2 border-l-transparent transition-all duration-200 hover:border-l-indigo-500 hover:bg-[#1E2240] ${
                  index % 2 === 1 ? "bg-[#14162380]" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${badgeClass}`}>
                    {categoryName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {isFav && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className="shrink-0 text-rose-400">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    )}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-100 transition-colors hover:text-indigo-400"
                    >
                      {article.title}
                    </a>
                  </div>
                  {article.summary && (
                    <p className="mt-1 inline-block rounded border border-indigo-800/30 bg-indigo-950/30 px-1.5 py-0.5 text-xs text-indigo-200/90">
                      <span className="mr-1 font-semibold text-amber-400">AI요약</span>{article.summary}
                    </p>
                  )}
                </td>
                <td className="hidden w-32 px-4 py-3 md:table-cell">
                  <ImportanceBar score={article.importance} />
                </td>
                <td className="hidden px-4 py-3 text-xs text-[#636789] sm:table-cell whitespace-nowrap">
                  {article.source}
                </td>
                <td className="px-4 py-3 text-right text-xs text-[#636789] whitespace-nowrap">
                  {new Date(article.publishedAt).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(article.id)}
                      className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                        isFav
                          ? "text-rose-400 hover:text-rose-300"
                          : "text-[#636789] hover:text-rose-400"
                      }`}
                      title={isFav ? "관심기사 해제" : "관심기사 등록"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(article.id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-[#636789] transition-colors hover:text-red-400"
                      title="기사 삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

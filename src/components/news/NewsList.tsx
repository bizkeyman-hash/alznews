import { Article } from "@/types/news";
import { CATEGORY_NAME_MAP, CATEGORY_COLORS } from "@/lib/constants";
import ImportanceBar from "./ImportanceBar";

interface NewsListProps {
  articles: Article[];
}

export default function NewsList({ articles }: NewsListProps) {
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
          </tr>
        </thead>
        <tbody className="divide-y divide-[#23263B]">
          {articles.map((article, index) => {
            const categoryName =
              CATEGORY_NAME_MAP[article.category] ?? article.category;
            const badgeClass = CATEGORY_COLORS[article.category] ?? "bg-[#23263B] text-[#9094B0] ring-1 ring-[#2A2D45]";
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
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-100 transition-colors hover:text-indigo-400"
                  >
                    {article.title}
                  </a>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

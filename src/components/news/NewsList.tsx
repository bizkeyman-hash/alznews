import { Article } from "@/types/news";
import { CATEGORY_NAME_MAP } from "@/lib/constants";
import ImportanceBar from "./ImportanceBar";

interface NewsListProps {
  articles: Article[];
}

export default function NewsList({ articles }: NewsListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-500">
            <th className="px-4 py-3 font-medium">카테고리</th>
            <th className="px-4 py-3 font-medium">제목</th>
            <th className="hidden w-32 px-4 py-3 font-medium md:table-cell">중요도</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">출처</th>
            <th className="px-4 py-3 text-right font-medium whitespace-nowrap">날짜</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {articles.map((article) => {
            const categoryName =
              CATEGORY_NAME_MAP[article.category] ?? article.category;
            return (
              <tr
                key={article.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 whitespace-nowrap">
                    {categoryName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {article.title}
                  </a>
                  {article.summary && (
                    <p className="mt-1 text-xs text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-block">
                      <span className="font-semibold mr-1">AI요약</span>{article.summary}
                    </p>
                  )}
                </td>
                <td className="hidden w-32 px-4 py-3 md:table-cell">
                  <ImportanceBar score={article.importance} />
                </td>
                <td className="hidden px-4 py-3 text-xs text-gray-400 sm:table-cell whitespace-nowrap">
                  {article.source}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
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

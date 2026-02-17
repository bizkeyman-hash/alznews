import Link from "next/link";
import { Article } from "@/types/news";
import { CATEGORY_NAME_MAP } from "@/lib/constants";
import ImportanceBar from "./ImportanceBar";

interface NewsTileProps {
  article: Article;
}

export default function NewsTile({ article }: NewsTileProps) {
  const categoryName = CATEGORY_NAME_MAP[article.category] ?? article.category;

  return (
    <Link
      href={`/article/${article.id}`}
      className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-4">
        {article.importance != null && (
          <div className="mb-3">
            <ImportanceBar score={article.importance} />
          </div>
        )}
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
            {categoryName}
          </span>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
          {article.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {article.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{article.source}</span>
          <time>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</time>
        </div>
      </div>
    </Link>
  );
}

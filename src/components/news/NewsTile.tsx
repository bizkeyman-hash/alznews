import { Article } from "@/types/news";
import { CATEGORY_NAME_MAP, CATEGORY_COLORS } from "@/lib/constants";
import ImportanceBar from "./ImportanceBar";

const ACCENT_COLORS: Record<string, string> = {
  aribio: "from-violet-500 to-purple-400",
  competition: "from-blue-500 to-indigo-400",
  research: "from-emerald-500 to-teal-400",
  regulation: "from-amber-500 to-orange-400",
  market: "from-fuchsia-500 to-pink-400",
};

interface NewsTileProps {
  article: Article;
}

export default function NewsTile({ article }: NewsTileProps) {
  const categoryName = CATEGORY_NAME_MAP[article.category] ?? article.category;
  const badgeClass = CATEGORY_COLORS[article.category] ?? "bg-[#23263B] text-[#9094B0] ring-1 ring-[#2A2D45]";
  const accentGradient = ACCENT_COLORS[article.category] ?? "from-indigo-500 to-violet-400";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-glow group flex flex-col overflow-hidden rounded-lg border border-[#2A2D45] bg-[#181B2E] transition-all duration-300 hover:-translate-y-1 hover:border-[#3D4163]"
    >
      {/* Category accent bar */}
      <div className={`h-[2px] bg-gradient-to-r ${accentGradient}`} />

      <div className="flex flex-1 flex-col p-4">
        {article.importance != null && (
          <div className="mb-3">
            <ImportanceBar score={article.importance} />
          </div>
        )}
        <div className="mb-2 flex items-center gap-2">
          <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
            {categoryName}
          </span>
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-100 transition-colors group-hover:text-indigo-400">
          {article.title}
        </h3>
        {article.summary && (
          <p className="mb-2 rounded-md border border-indigo-800/30 bg-indigo-950/30 px-2 py-1.5 text-sm text-indigo-200/90 backdrop-blur-sm">
            <span className="mr-1 font-semibold text-amber-400">AI요약</span>{article.summary}
          </p>
        )}
        <p className="mb-3 line-clamp-2 text-sm text-[#9094B0]">
          {article.description}
        </p>
        {/* Metadata footer */}
        <div className="mt-auto flex items-center justify-between border-t border-[#23263B] pt-3 text-xs text-[#636789]">
          <span>{article.source}</span>
          <time>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</time>
        </div>
      </div>
    </a>
  );
}

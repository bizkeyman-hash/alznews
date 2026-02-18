import Link from "next/link";
import { getArticleById } from "@/lib/aggregator";
import { extractArticleContent } from "@/lib/extract";
import { CATEGORY_NAME_MAP, CATEGORY_COLORS } from "@/lib/constants";
import ImportanceBar from "@/components/news/ImportanceBar";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  // Try to extract full content from original URL
  const extracted = await extractArticleContent(article.url);
  const bodyText = extracted || article.fullContent || article.description;
  const categoryName = CATEGORY_NAME_MAP[article.category] ?? article.category;
  const badgeClass = CATEGORY_COLORS[article.category] ?? "bg-[#23263B] text-[#9094B0] ring-1 ring-[#2A2D45]";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[#636789] transition-colors hover:text-indigo-400"
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
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        뉴스 목록으로
      </Link>

      {/* Article card */}
      <div className="rounded-2xl border border-[#2A2D45] bg-[#181B2E] p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
            {categoryName}
          </span>
          {article.importance != null && (
            <div className="w-32">
              <ImportanceBar score={article.importance} />
            </div>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-bold text-slate-100">
          {article.title}
        </h1>

        {/* Metadata with divider */}
        <div className="mb-6 flex items-center gap-4 border-b border-[#23263B] pb-4 text-sm text-[#636789]">
          <span>{article.source}</span>
          <span className="h-3 w-px bg-[#2A2D45]" />
          <time>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</time>
        </div>

        <div className="prose prose-lg prose-invert max-w-none text-[#B0B3C8]">
          {bodyText.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {!extracted && (
          <p className="mt-4 text-sm text-[#636789]">
            원문 전체를 가져올 수 없어 요약만 표시됩니다.
          </p>
        )}

        {article.url && article.url !== "#" && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 active:scale-95"
          >
            원문 기사 읽기 &rarr;
          </a>
        )}
      </div>
    </div>
  );
}

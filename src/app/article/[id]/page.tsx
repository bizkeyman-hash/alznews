import Link from "next/link";
import { getArticleById } from "@/lib/aggregator";
import { extractArticleContent } from "@/lib/extract";
import { CATEGORY_NAME_MAP } from "@/lib/constants";
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        &larr; 뉴스 목록으로
      </Link>

      <div className="mb-4 flex items-center gap-3">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
          {categoryName}
        </span>
        {article.importance != null && (
          <div className="w-32">
            <ImportanceBar score={article.importance} />
          </div>
        )}
      </div>

      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        {article.title}
      </h1>

      <div className="mb-6 flex items-center gap-4 text-sm text-gray-500">
        <span>{article.source}</span>
        <time>{new Date(article.publishedAt).toLocaleDateString("ko-KR")}</time>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700">
        {bodyText.split("\n\n").map((paragraph, i) => (
          <p key={i} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {!extracted && (
        <p className="mt-4 text-sm text-gray-400">
          원문 전체를 가져올 수 없어 요약만 표시됩니다.
        </p>
      )}

      {article.url && article.url !== "#" && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          원문 기사 읽기 &rarr;
        </a>
      )}
    </div>
  );
}

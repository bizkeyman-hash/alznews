import NewsGrid from "@/components/news/NewsGrid";
import { getArticles } from "@/lib/aggregator";
import { CATEGORIES } from "@/lib/constants";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const filtered = await getArticles({ category: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        {category.name} 뉴스
      </h1>
      {filtered.length > 0 ? (
        <NewsGrid articles={filtered} />
      ) : (
        <p className="text-gray-500">해당 카테고리의 뉴스가 없습니다.</p>
      )}
    </div>
  );
}

import NewsGrid from "@/components/news/NewsGrid";
import { getArticles } from "@/lib/aggregator";
import { CATEGORIES, FAVORITES_NAV } from "@/lib/constants";
import { kvGetFavorites } from "@/lib/kv";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const favoriteIds = await kvGetFavorites();

  // Special handling for favorites page
  if (slug === FAVORITES_NAV.slug) {
    const { articles, total } = await getArticles({
      limit: 20,
      favoriteIds,
    });

    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-100">
          <span className="mr-2 text-rose-400">♥</span>
          {FAVORITES_NAV.name}
        </h1>
        {articles.length > 0 ? (
          <NewsGrid
            articles={articles}
            initialFavoriteIds={Array.from(favoriteIds)}
            category="favorites"
            totalCount={total}
          />
        ) : (
          <p className="text-slate-500">관심기사가 없습니다. 기사에서 ♥ 버튼을 눌러 추가하세요.</p>
        )}
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    notFound();
  }

  const { articles, total } = await getArticles({
    category: slug,
    limit: 20,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-100">
        {category.name} 뉴스
      </h1>
      {articles.length > 0 ? (
        <NewsGrid
          articles={articles}
          initialFavoriteIds={Array.from(favoriteIds)}
          category={slug}
          totalCount={total}
        />
      ) : (
        <p className="text-slate-500">해당 카테고리의 뉴스가 없습니다.</p>
      )}
    </div>
  );
}

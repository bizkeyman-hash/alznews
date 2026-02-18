import NewsGrid from "@/components/news/NewsGrid";
import { getArticles } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-slate-100">알츠하이머 치료제 최신 뉴스</h1>
      <p className="mb-6 text-slate-400">신약 개발, 임상시험, FDA 승인 등 알츠하이머병 치료제의 최신 소식</p>
      <NewsGrid articles={articles} />
    </div>
  );
}

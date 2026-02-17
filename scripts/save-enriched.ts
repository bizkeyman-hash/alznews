import fs from "fs";
import path from "path";
import { Article } from "@/types/news";

/**
 * Merges enriched articles (with summary + importance) into data/news.json.
 *
 * Usage: npx tsx scripts/save-enriched.ts
 * Expects: data/enriched-news.json (Claude Code writes this)
 * Output:  data/news.json (merged, deduped, 30-day pruned)
 */
async function main() {
  const dataDir = path.join(process.cwd(), "data");
  const newsJsonPath = path.join(dataDir, "news.json");
  const enrichedPath = path.join(dataDir, "enriched-news.json");

  if (!fs.existsSync(enrichedPath)) {
    console.error(
      "[save-enriched] data/enriched-news.json 파일을 찾을 수 없습니다."
    );
    process.exit(1);
  }

  const enrichedArticles: Article[] = JSON.parse(
    fs.readFileSync(enrichedPath, "utf-8")
  );
  console.log(
    `[save-enriched] enriched 기사 로드: ${enrichedArticles.length}개`
  );

  // Read existing news.json
  let existing: Article[] = [];
  if (fs.existsSync(newsJsonPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(newsJsonPath, "utf-8"));
      console.log(`[save-enriched] 기존 news.json 기사: ${existing.length}개`);
    } catch {
      console.warn("[save-enriched] 기존 news.json 읽기 실패, 새로 생성합니다.");
    }
  }

  // Merge: enriched articles override existing by URL
  const urlMap = new Map<string, Article>();
  for (const a of existing) {
    urlMap.set(a.url.replace(/\/+$/, "").toLowerCase(), a);
  }
  for (const a of enrichedArticles) {
    urlMap.set(a.url.replace(/\/+$/, "").toLowerCase(), a);
  }

  // Remove articles older than 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let merged = Array.from(urlMap.values()).filter(
    (a) => new Date(a.publishedAt).getTime() > thirtyDaysAgo
  );

  // Sort by date desc
  merged.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Save
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(newsJsonPath, JSON.stringify(merged, null, 2), "utf-8");

  console.log(
    `[save-enriched] ✅ ${merged.length}개 기사 저장 완료 → data/news.json`
  );

  // Clean up enriched temp file
  fs.unlinkSync(enrichedPath);
  console.log("[save-enriched] data/enriched-news.json 삭제 완료");
}

main().catch((err) => {
  console.error("[save-enriched] Error:", err);
  process.exit(1);
});

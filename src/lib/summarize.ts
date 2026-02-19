import Anthropic from "@anthropic-ai/sdk";
import { Article } from "@/types/news";

const BATCH_SIZE = 10;

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("[Summarize] ANTHROPIC_API_KEY not set, skipping summaries");
    return null;
  }
  return new Anthropic({ apiKey });
}

async function summarizeBatch(
  client: Anthropic,
  articles: Article[]
): Promise<Map<string, string>> {
  const articlesText = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title}\n${a.description?.slice(0, 200) || ""}`
    )
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `아래 뉴스 기사들을 각각 100~120자 한국어로 요약해주세요.
아리바이오(AriBio) 투자자 관점에서 핵심 포인트를 간결하게 작성하세요.
영어 기사도 한국어로 요약하세요.

각 기사 번호에 맞춰 한 줄씩 출력하세요.
형식: [번호] 요약내용

${articlesText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const summaryMap = new Map<string, string>();

  for (const line of text.split("\n")) {
    const match = line.match(/^\[(\d+)\]\s*(.+)$/);
    if (match) {
      const idx = parseInt(match[1], 10) - 1;
      if (idx >= 0 && idx < articles.length) {
        summaryMap.set(articles[idx].id, match[2].trim());
      }
    }
  }

  return summaryMap;
}

export async function summarizeArticles(
  articles: Article[]
): Promise<Article[]> {
  // Skip articles that already have summaries
  const needsSummary = articles.filter((a) => !a.summary);
  if (needsSummary.length === 0) return articles;

  const client = getClient();
  if (!client) return articles;

  // Split into batches of BATCH_SIZE
  const batches: Article[][] = [];
  for (let i = 0; i < needsSummary.length; i += BATCH_SIZE) {
    batches.push(needsSummary.slice(i, i + BATCH_SIZE));
  }

  // Process batches in parallel
  const allSummaries = new Map<string, string>();
  try {
    const results = await Promise.allSettled(
      batches.map((batch) => summarizeBatch(client, batch))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const [id, summary] of result.value) {
          allSummaries.set(id, summary);
        }
      } else {
        console.error("[Summarize] Batch failed:", result.reason);
      }
    }
  } catch (err) {
    console.error("[Summarize] Unexpected error:", err);
    return articles;
  }

  console.log(
    `[Summarize] Generated ${allSummaries.size}/${needsSummary.length} summaries`
  );

  return articles.map((a) => {
    const summary = allSummaries.get(a.id);
    return summary ? { ...a, summary } : a;
  });
}

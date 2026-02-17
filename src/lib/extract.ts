import { extract } from "@extractus/article-extractor";
import { getCached, setCache } from "@/lib/cache";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/** Resolve Google News redirect URL to actual article URL */
async function resolveGoogleNewsUrl(gnUrl: string): Promise<string | null> {
  try {
    const { default: GoogleNewsDecoder } = await import("google-news-decoder");
    const decoder = new GoogleNewsDecoder();
    const result = await decoder.decodeGoogleNewsUrl(gnUrl);
    if (result?.status && result.decodedUrl) {
      return result.decodedUrl;
    }
  } catch {
    // Could not resolve
  }
  return null;
}

export async function extractArticleContent(url: string): Promise<string | null> {
  if (!url || url === "#") return null;

  const cacheKey = `extract:${url}`;
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  // Resolve Google News redirect URLs to actual article URLs
  let targetUrl = url;
  if (url.includes("news.google.com")) {
    const resolved = await resolveGoogleNewsUrl(url);
    if (!resolved) return null;
    targetUrl = resolved;

    // Check cache for resolved URL too
    const resolvedCache = getCached<string>(`extract:${targetUrl}`);
    if (resolvedCache) return resolvedCache;
  }

  // Try @extractus/article-extractor first
  try {
    const article = await extract(targetUrl, {}, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (article?.content) {
      const text = stripHtml(article.content);
      if (text.length > 100) {
        setCache(cacheKey, text, CACHE_TTL);
        return text;
      }
    }
  } catch {
    // Fall through to manual extraction
  }

  // Fallback: manual HTML extraction
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const html = await res.text();
    const content = extractMainContent(html);

    if (content && content.length > 100) {
      setCache(cacheKey, content, CACHE_TTL);
      return content;
    }

    return null;
  } catch {
    return null;
  }
}

function extractMainContent(html: string): string | null {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const articleMatch =
    cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    cleaned.match(/<div[^>]*class="[^"]*(?:article|content|post|entry|story|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  const contentHtml = articleMatch ? articleMatch[1] : cleaned;

  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = pRegex.exec(contentHtml)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text.length > 30) {
      paragraphs.push(text);
    }
  }

  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n");
  }

  const allText = stripHtml(contentHtml);
  if (allText.length > 200) {
    return allText;
  }

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

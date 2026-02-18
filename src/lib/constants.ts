import { Category } from "@/types/news";

export const CATEGORIES: Category[] = [
  { slug: "aribio", name: "아리바이오" },
  { slug: "competition", name: "경쟁동향" },
  { slug: "research", name: "최신연구" },
  { slug: "regulation", name: "규제정책" },
  { slug: "market", name: "시장투자" },
];

export const CATEGORY_NAME_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name])
);

export interface RSSFeedConfig {
  url: string;
  source: string;
  alzSpecific: boolean; // true = all articles are relevant; false = needs keyword filtering
}

// Google News RSS helper — `when:30d` fetches last 30 days
function gn(q: string, lang: "ko" | "en" = "en"): string {
  const encoded = encodeURIComponent(`${q} when:30d`);
  if (lang === "ko")
    return `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;
  return `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en`;
}

export const RSS_FEEDS: RSSFeedConfig[] = [
  // ── 아리바이오 ──
  { url: gn("아리바이오", "ko"), source: "Google News", alzSpecific: true },
  { url: gn("아리바이오 AR1001", "ko"), source: "Google News", alzSpecific: true },

  // ── 경쟁동향: 승인 약물 ──
  { url: gn("lecanemab OR Leqembi Alzheimer"), source: "Google News", alzSpecific: true },
  { url: gn("donanemab OR Kisunla Alzheimer"), source: "Google News", alzSpecific: true },
  { url: gn("레카네맙 OR 레켐비", "ko"), source: "Google News", alzSpecific: true },
  { url: gn("도나네맙 OR 키선라", "ko"), source: "Google News", alzSpecific: true },

  // ── 경쟁동향: FDA 임상 후보물질 ──
  { url: gn("remternetug Alzheimer Lilly"), source: "Google News", alzSpecific: true },
  { url: gn("trontinemab Roche Alzheimer"), source: "Google News", alzSpecific: true },
  { url: gn("simufilam Cassava Sciences"), source: "Google News", alzSpecific: true },
  { url: gn("ALZ-801 Alzheon Alzheimer"), source: "Google News", alzSpecific: true },
  { url: gn("buntanetap Annovis Bio"), source: "Google News", alzSpecific: true },
  { url: gn("semaglutide Alzheimer"), source: "Google News", alzSpecific: true },
  { url: gn("masitinib Alzheimer"), source: "Google News", alzSpecific: true },

  // ── 규제정책 ──
  { url: gn("Alzheimer FDA approval OR guidance"), source: "Google News", alzSpecific: true },
  { url: gn("알츠하이머 FDA OR 승인 OR 보험급여", "ko"), source: "Google News", alzSpecific: true },

  // ── 시장투자 ──
  { url: gn("Alzheimer drug market OR investment OR M&A"), source: "Google News", alzSpecific: true },
  { url: gn("알츠하이머 치료제 시장 OR 투자", "ko"), source: "Google News", alzSpecific: true },

  // ── 전문 사이트 RSS ──
  { url: "https://www.alz.org/news/feed", source: "Alzheimer's Association", alzSpecific: true },
  { url: "https://www.alzforum.org/rss.xml", source: "Alzforum", alzSpecific: true },
  { url: "https://www.nia.nih.gov/news/alzheimers/rss.xml", source: "NIA (NIH)", alzSpecific: true },
  { url: "https://www.biospace.com/rss/news", source: "BioSpace", alzSpecific: false },
  { url: "https://www.fiercepharma.com/rss/xml", source: "Fierce Pharma", alzSpecific: false },
  { url: "https://www.statnews.com/feed/", source: "STAT News", alzSpecific: false },
  { url: "https://www.thelancet.com/rssfeed/lancet_neurology.xml", source: "The Lancet Neurology", alzSpecific: true },
  { url: "https://blog.alz.org/feed/", source: "ALZ Blog", alzSpecific: true },
];

export const CATEGORY_COLORS: Record<string, string> = {
  aribio: "bg-violet-950/60 text-violet-300 ring-1 ring-violet-500/20",
  competition: "bg-blue-950/60 text-blue-300 ring-1 ring-blue-500/20",
  research: "bg-emerald-950/60 text-emerald-300 ring-1 ring-emerald-500/20",
  regulation: "bg-amber-950/60 text-amber-300 ring-1 ring-amber-500/20",
  market: "bg-fuchsia-950/60 text-fuchsia-300 ring-1 ring-fuchsia-500/20",
};

export const ALZ_KEYWORDS = [
  "alzheimer",
  "dementia",
  "amyloid",
  "tau protein",
  "lecanemab",
  "donanemab",
  "aducanumab",
  "cognitive decline",
  "neurodegeneration",
  "brain plaque",
  "알츠하이머",
  "치매",
  "아밀로이드",
  "타우",
  "레카네맙",
  "도나네맙",
  "인지기능",
  "신경퇴행",
];

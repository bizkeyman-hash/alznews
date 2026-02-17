export interface Article {
  id: string;
  title: string;
  description: string;
  fullContent?: string;
  source: string;
  category: string;
  imageUrl: string;
  url: string;
  publishedAt: string;
  language?: "ko" | "en";
  importance?: number; // 1-10, AI-scored
  summary?: string; // AI-generated summary (100-120 chars)
}

export interface RawArticle {
  title: string;
  description: string;
  fullContent?: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  language?: "ko" | "en";
}

export interface Category {
  slug: string;
  name: string;
}

// 核心类型定义

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  region: string;
  source: string;
  publishDate: string;
  link: string;
}

export interface Keyword {
  word: string;
  frequency: number;
  tfidf: number;
  trend?: 'up' | 'down' | 'stable';
  changeRate?: number;
}

export interface SEOSuggestion {
  titles: string[];
  metaDescriptions: string[];
  keywords: Keyword[];
}

export interface RSSSource {
  name: string;
  url: string;
  region: string;
}

export type Region = 'singapore' | 'shanghai' | 'all';

export type Language = 'en' | 'zh';

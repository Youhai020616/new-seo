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

export interface TrendingKeyword extends Keyword {
  // 热度分析字段
  trendingScore: number;      // 热度评分 (0-10)
  rank: number;               // 排名

  // 统计字段
  newsCount: number;          // 出现的新闻数量
  regions: string[];          // 出现的地区列表
  sources: string[];          // 出现的新闻源列表

  // 时间字段
  firstSeen: string;          // 首次出现时间 (ISO 8601)
  lastSeen: string;           // 最后出现时间
  avgAge: number;             // 平均新闻年龄（小时）

  // 关联数据
  relatedNews: {
    id: string;
    title: string;
    link: string;
    source: string;
    region: string;
    publishDate: string;
  }[];                        // 最相关的新闻（最多5条）
}

export interface TrendingKeywordsResponse {
  success: boolean;
  keywords: TrendingKeyword[];
  metadata: {
    totalNews: number;
    analyzedRegions: string[];
    timeRange: {
      from: string;
      to: string;
    };
    generatedAt: string;
  };
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

export interface RegionMetadata {
  id: string;
  nameEn: string;
  nameZh: string;
  timezone: string;
  languages: string[];
  flag: string;
  enabled: boolean;
  order: number;
}

export type Region = 'singapore' | 'shanghai' | 'hongkong' | 'all';

export type Language = 'en' | 'zh';

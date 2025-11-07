import type { NewsItem, TrendingKeyword, Keyword } from '@/types';
import { KeywordExtractor } from './keyword-extractor';

interface KeywordStats {
  word: string;
  frequency: number;
  maxTfidf: number;
  newsIds: Set<string>;
  regions: Set<string>;
  sources: Set<string>;
  timestamps: number[];
  relatedNews: {
    id: string;
    title: string;
    link: string;
    source: string;
    region: string;
    publishDate: string;
    tfidf: number;
  }[];
}

/**
 * 热点关键词分析器
 * 基于新闻数据分析热门关键词
 */
export class TrendingKeywordsAnalyzer {
  private news: NewsItem[];
  private extractor: KeywordExtractor;

  constructor(news: NewsItem[]) {
    this.news = news;
    this.extractor = new KeywordExtractor();
  }

  /**
   * 分析热点关键词
   */
  public analyze(options?: {
    limit?: number;           // 返回数量，默认20
    minNewsCount?: number;    // 最小新闻数，默认2
    hours?: number;           // 时间范围（小时），默认24
  }): TrendingKeyword[] {
    const { limit = 20, minNewsCount = 2, hours = 24 } = options || {};

    // 1. 过滤时间范围内的新闻
    const recentNews = this.filterRecentNews(hours);

    if (recentNews.length === 0) {
      return [];
    }

    // 2. 提取每篇新闻的关键词
    const newsKeywords = this.extractNewsKeywords(recentNews);

    // 3. 按关键词分组并计算统计信息
    const keywordStats = this.groupKeywordsByWord(newsKeywords, recentNews);

    // 4. 计算热度分数
    const scored = this.calculateTrendingScores(keywordStats, recentNews);

    // 5. 过滤、排序并返回
    return scored
      .filter(kw => kw.newsCount >= minNewsCount)
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit)
      .map((kw, index) => ({ ...kw, rank: index + 1 }));
  }

  /**
   * 过滤最近N小时的新闻
   */
  private filterRecentNews(hours: number): NewsItem[] {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return this.news.filter(n => {
      const publishTime = new Date(n.publishDate).getTime();
      return publishTime > cutoffTime && !isNaN(publishTime);
    });
  }

  /**
   * 提取每篇新闻的关键词
   */
  private extractNewsKeywords(news: NewsItem[]): Map<string, Keyword[]> {
    const newsKeywords = new Map<string, Keyword[]>();

    news.forEach(item => {
      const text = `${item.title} ${item.summary}`;
      const keywords = this.extractor.extract([text]);
      newsKeywords.set(item.id, keywords);
    });

    return newsKeywords;
  }

  /**
   * 按关键词分组
   */
  private groupKeywordsByWord(
    newsKeywords: Map<string, Keyword[]>,
    news: NewsItem[]
  ): Map<string, KeywordStats> {
    const grouped = new Map<string, KeywordStats>();

    // 创建新闻ID到新闻对象的映射
    const newsMap = new Map(news.map(n => [n.id, n]));

    newsKeywords.forEach((keywords, newsId) => {
      const newsItem = newsMap.get(newsId);
      if (!newsItem) return;

      const publishTime = new Date(newsItem.publishDate).getTime();

      keywords.forEach(kw => {
        if (!grouped.has(kw.word)) {
          grouped.set(kw.word, {
            word: kw.word,
            frequency: 0,
            maxTfidf: 0,
            newsIds: new Set(),
            regions: new Set(),
            sources: new Set(),
            timestamps: [],
            relatedNews: []
          });
        }

        const stats = grouped.get(kw.word)!;
        stats.frequency += kw.frequency;
        stats.maxTfidf = Math.max(stats.maxTfidf, kw.tfidf);
        stats.newsIds.add(newsId);
        stats.regions.add(newsItem.region);
        stats.sources.add(newsItem.source);
        stats.timestamps.push(publishTime);
        stats.relatedNews.push({
          id: newsItem.id,
          title: newsItem.title,
          link: newsItem.link,
          source: newsItem.source,
          region: newsItem.region,
          publishDate: newsItem.publishDate,
          tfidf: kw.tfidf
        });
      });
    });

    return grouped;
  }

  /**
   * 计算热度分数
   */
  private calculateTrendingScores(
    keywordStats: Map<string, KeywordStats>,
    allNews: NewsItem[]
  ): TrendingKeyword[] {
    const totalRegions = new Set(allNews.map(n => n.region)).size;
    const now = Date.now();
    const results: TrendingKeyword[] = [];

    keywordStats.forEach((stats) => {
      // 计算平均年龄（小时）
      const avgTimestamp =
        stats.timestamps.reduce((sum, t) => sum + t, 0) / stats.timestamps.length;
      const avgAgeMs = now - avgTimestamp;
      const avgAgeHours = avgAgeMs / (1000 * 60 * 60);

      // 计算各个因子
      const baseScore = stats.maxTfidf;
      const timeDecay = this.calculateTimeDecay(avgAgeHours);
      const diversityBonus = this.calculateDiversityBonus(
        stats.regions.size,
        totalRegions
      );
      const popularityFactor = this.calculatePopularityFactor(
        stats.newsIds.size
      );

      // 综合评分
      const trendingScore =
        baseScore * timeDecay * diversityBonus * popularityFactor;

      // 按TF-IDF排序关联新闻，取前5条
      const topRelatedNews = stats.relatedNews
        .sort((a, b) => b.tfidf - a.tfidf)
        .slice(0, 5)
        .map(({ tfidf, ...rest }) => rest); // 移除tfidf字段

      // 时间戳排序
      const sortedTimestamps = [...stats.timestamps].sort((a, b) => a - b);

      results.push({
        word: stats.word,
        frequency: stats.frequency,
        tfidf: stats.maxTfidf,
        trendingScore: Math.min(trendingScore, 10), // 限制0-10
        rank: 0, // 稍后设置
        newsCount: stats.newsIds.size,
        regions: Array.from(stats.regions).sort(),
        sources: Array.from(stats.sources).sort(),
        firstSeen: new Date(sortedTimestamps[0]).toISOString(),
        lastSeen: new Date(sortedTimestamps[sortedTimestamps.length - 1]).toISOString(),
        avgAge: avgAgeHours,
        relatedNews: topRelatedNews
      });
    });

    return results;
  }

  /**
   * 计算时间衰减因子
   * 使用指数衰减：e^(-λ * age_hours)
   * λ = 0.01，约24小时衰减到50%
   */
  private calculateTimeDecay(ageHours: number): number {
    const lambda = 0.01;
    return Math.exp(-lambda * ageHours);
  }

  /**
   * 计算地区多样性加成
   * 跨地区出现的关键词获得额外权重
   */
  private calculateDiversityBonus(
    regionCount: number,
    totalRegions: number
  ): number {
    if (totalRegions === 0) return 1;
    return 1 + (regionCount / totalRegions) * 0.5;
  }

  /**
   * 计算流行度因子
   * 使用对数增长避免过度放大
   */
  private calculatePopularityFactor(newsCount: number): number {
    return Math.log(1 + newsCount);
  }
}

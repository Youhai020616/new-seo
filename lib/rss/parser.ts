import Parser from 'rss-parser';
import type { NewsItem, RSSSource } from '@/types';
import { generateId } from '@/lib/utils';

/**
 * RSS解析器接口
 */
export interface RSSNewsItem {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  source: string;
  region: string;
}

/**
 * 从单个RSS源获取新闻
 */
export async function fetchNewsFromRSS(
  rssUrl: string,
  region: string,
  sourceName: string
): Promise<NewsItem[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsSEOBot/1.0)',
    },
  });

  try {
    const feed = await parser.parseURL(rssUrl);

    // 每个源获取50条新闻（之前是20条）
    return feed.items.slice(0, 50).map(item => ({
      id: generateId(),
      title: item.title || 'Untitled',
      summary: item.contentSnippet || item.content || item.description || '',
      link: item.link || '#',
      publishDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: sourceName || feed.title || 'Unknown',
      region,
    }));
  } catch (error) {
    console.error(`RSS fetch error for ${sourceName} (${rssUrl}):`, error);
    return [];
  }
}

/**
 * 从多个RSS源并行获取新闻
 */
export async function fetchMultipleRSS(sources: RSSSource[]): Promise<NewsItem[]> {
  if (!sources || sources.length === 0) {
    return [];
  }

  // 并行请求所有RSS源
  const results = await Promise.allSettled(
    sources.map(s => fetchNewsFromRSS(s.url, s.region, s.name))
  );

  // 提取成功的结果
  const allNews = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);

  // 按发布时间排序（最新的在前）
  return allNews.sort((a, b) => {
    const dateA = new Date(a.publishDate).getTime();
    const dateB = new Date(b.publishDate).getTime();
    return dateB - dateA;
  });
}

/**
 * 根据地区过滤新闻源
 */
export function filterSourcesByRegion(
  sources: RSSSource[],
  region?: string
): RSSSource[] {
  if (!region || region === 'all') {
    return sources;
  }

  return sources.filter(s => s.region === region);
}

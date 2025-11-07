import { NextRequest, NextResponse } from 'next/server';
import { TrendingKeywordsAnalyzer } from '@/lib/nlp/trending-analyzer';
import rssSources from '@/config/rss-sources.json';
import { fetchMultipleRSS, filterSourcesByRegion } from '@/lib/rss/parser';

export const dynamic = 'force-dynamic'; // 禁用缓存

/**
 * GET /api/keywords/trending?region=all&limit=20&hours=24
 * 获取热点关键词
 *
 * Query参数:
 * - region: 地区过滤 ('all' | 'singapore' | 'shanghai' | 'hongkong')
 * - limit: 返回数量 (默认20)
 * - hours: 时间范围（小时） (默认24)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // 最多50个
    const hours = parseInt(searchParams.get('hours') || '24');

    console.log(`[Trending API] Fetching for region=${region}, limit=${limit}, hours=${hours}`);

    // 获取新闻数据
    const filteredSources = filterSourcesByRegion(
      rssSources.sources,
      region === 'all' ? undefined : region
    );

    const news = await fetchMultipleRSS(filteredSources);

    if (news.length === 0) {
      return NextResponse.json({
        success: true,
        keywords: [],
        metadata: {
          totalNews: 0,
          analyzedRegions: [],
          timeRange: { from: '', to: '' },
          generatedAt: new Date().toISOString()
        }
      });
    }

    console.log(`[Trending API] Fetched ${news.length} news items`);

    // 分析热点关键词
    const analyzer = new TrendingKeywordsAnalyzer(news);
    const keywords = analyzer.analyze({
      limit,
      hours,
      minNewsCount: 2
    });

    console.log(`[Trending API] Analyzed ${keywords.length} trending keywords`);

    // 构建响应
    const regions = Array.from(new Set(news.map(n => n.region)));
    const sortedDates = news
      .map(n => new Date(n.publishDate))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    return NextResponse.json({
      success: true,
      keywords,
      metadata: {
        totalNews: news.length,
        analyzedRegions: regions,
        timeRange: {
          from: sortedDates[0]?.toISOString() || '',
          to: sortedDates[sortedDates.length - 1]?.toISOString() || ''
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Trending API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze trending keywords',
        keywords: [],
        metadata: {
          totalNews: 0,
          analyzedRegions: [],
          timeRange: { from: '', to: '' },
          generatedAt: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchMultipleRSS, filterSourcesByRegion } from '@/lib/rss/parser';
import { generateId } from '@/lib/utils';
import type { NewsItem } from '@/types';
import rssSources from '@/config/rss-sources.json';

/**
 * GET /api/news?region=singapore
 * 获取RSS新闻列表
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region');

    // 过滤RSS源
    const filteredSources = filterSourcesByRegion(rssSources.sources, region || undefined);

    // 获取新闻
    const news = await fetchMultipleRSS(filteredSources);

    return NextResponse.json({
      success: true,
      news,
      count: news.length,
      region: region || 'all',
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        news: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/news
 * 手动添加新闻
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, region, source, link } = body;

    // 验证必填字段
    if (!title || !summary) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and summary are required',
        },
        { status: 400 }
      );
    }

    // 创建新闻项
    const newItem: NewsItem = {
      id: generateId(),
      title,
      summary,
      region: region || 'other',
      source: source || 'Manual Input',
      publishDate: new Date().toISOString(),
      link: link || '#',
    };

    return NextResponse.json(
      {
        success: true,
        news: newItem,
        message: 'News added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('News POST API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add news',
      },
      { status: 500 }
    );
  }
}

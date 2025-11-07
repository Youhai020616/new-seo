import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyzeTrends, getTrendStats } from '@/lib/ai/services/trend-service';
import type { NewsItem } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { news_items, time_range, focus_area, language } = body as {
      news_items: NewsItem[];
      time_range?: 'day' | 'week' | 'month';
      focus_area?: string;
      language?: 'en' | 'zh';
    };

    // Validation
    if (!news_items || !Array.isArray(news_items)) {
      return NextResponse.json(
        {
          success: false,
          error: 'News items array is required',
        },
        { status: 400 }
      );
    }

    if (news_items.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 3 news items are required for trend analysis',
        },
        { status: 400 }
      );
    }

    if (news_items.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 100 news items allowed per request',
        },
        { status: 400 }
      );
    }

    // Analyze trends
    const result = await analyzeTrends(news_items, {
      timeRange: time_range,
      focusArea: focus_area,
      language,
      useCache: true,
    });

    // Get trend statistics
    const stats = getTrendStats(result);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    console.error('Trend analysis API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze trends',
      },
      { status: 500 }
    );
  }
}

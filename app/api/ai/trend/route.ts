import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyzeTrends, getTrendStats } from '@/lib/ai/services/trend-service';
import type { NewsItem } from '@/types';

// Configure API route
// Note: Vercel Free/Hobby plans have 10s timeout, Pro has 60s
export const maxDuration = 10; // Maximum execution time: 10 seconds (aligned with Vercel limits)
export const dynamic = 'force-dynamic'; // Disable static optimization

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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

    // Create a timeout promise (8 seconds to leave buffer for response)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('ANALYSIS_TIMEOUT'));
      }, 8000);
    });

    // Race between analysis and timeout
    const result = await Promise.race([
      analyzeTrends(news_items, {
        timeRange: time_range,
        focusArea: focus_area,
        language,
        useCache: true,
      }),
      timeoutPromise,
    ]);

    // Get trend statistics
    const stats = getTrendStats(result);

    const duration = Date.now() - startTime;
    console.log(`[TrendAnalysis] Completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[TrendAnalysis] Error after ${duration}ms:`, error);

    // Always return JSON, never throw or return non-JSON responses
    let errorMessage = 'Failed to analyze trends';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message === 'ANALYSIS_TIMEOUT') {
        errorMessage = 'Analysis took too long. Please try with fewer news items or try again later.';
        statusCode = 408; // Request Timeout
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

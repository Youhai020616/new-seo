import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { analyzeSentiment } from '@/lib/ai/services/sentiment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, language } = body as {
      content: string;
      language?: 'en' | 'zh';
    };

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is too short to analyze (minimum 10 characters)',
        },
        { status: 400 }
      );
    }

    // Analyze sentiment
    const result = await analyzeSentiment(content, {
      language,
      useCache: true,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
      },
      { status: 500 }
    );
  }
}

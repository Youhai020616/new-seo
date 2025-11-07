import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateAISummary, type SummaryLength } from '@/lib/ai/services/summary-service';

// Configure API route
export const maxDuration = 30; // Maximum execution time: 30 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, language, lengths } = body as {
      content: string;
      language?: 'en' | 'zh';
      lengths?: SummaryLength[];
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

    if (content.length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content is too short to summarize (minimum 50 characters)',
        },
        { status: 400 }
      );
    }

    // Generate summaries
    const result = await generateAISummary(content, {
      language,
      lengths,
      useCache: true,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 }
    );
  }
}

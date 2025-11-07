import { NextRequest, NextResponse } from 'next/server';
import { KeywordExtractor } from '@/lib/nlp/keyword-extractor';

/**
 * POST /api/keywords
 * 提取关键词
 *
 * Body:
 * {
 *   "texts": ["text1", "text2", ...],
 *   "source": "titles" | "summaries" | "both" (optional, default: "both")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, titles, summaries, source } = body;

    // 验证输入
    if (!texts && !titles && !summaries) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one of texts, titles, or summaries is required',
        },
        { status: 400 }
      );
    }

    const extractor = new KeywordExtractor();
    let keywords;

    // 根据来源选择提取方法
    if (titles && summaries) {
      keywords = extractor.extractFromTitlesAndSummaries(titles, summaries);
    } else if (titles) {
      keywords = extractor.extractFromTitles(titles);
    } else if (summaries) {
      keywords = extractor.extractFromSummaries(summaries);
    } else {
      keywords = extractor.extract(texts);
    }

    return NextResponse.json({
      success: true,
      keywords,
      count: keywords.length,
      totalTexts: texts?.length || titles?.length || summaries?.length || 0,
    });
  } catch (error) {
    console.error('Keywords API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract keywords',
        keywords: [],
      },
      { status: 500 }
    );
  }
}

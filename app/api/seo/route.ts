import { NextRequest, NextResponse } from 'next/server';
import { generateSEOTitle, scoreSEOTitle } from '@/lib/seo/title-generator';
import { generateMetaDescription, scoreMetaDescription, generateMetaTags } from '@/lib/seo/meta-generator';
import type { Keyword } from '@/types';

/**
 * POST /api/seo
 * 生成SEO建议
 *
 * Body:
 * {
 *   "keywords": Keyword[],
 *   "summary": string (optional),
 *   "context": string (optional)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, summary, context } = body;

    // 验证输入
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keywords array is required',
        },
        { status: 400 }
      );
    }

    // 生成SEO标题建议
    const titleSuggestions = generateSEOTitle(keywords, context);

    // 生成Meta描述建议
    const metaSuggestions = summary
      ? generateMetaDescription(summary, keywords)
      : [];

    // 计算质量分数
    const titleScores = titleSuggestions.map(title => ({
      title,
      score: scoreSEOTitle(title, keywords),
    }));

    const metaScores = metaSuggestions.map(meta => ({
      description: meta,
      score: scoreMetaDescription(meta, keywords),
    }));

    // 生成完整的Meta标签（使用最佳建议）
    const bestTitle = titleScores.length > 0 ? titleScores[0].title : '';
    const bestMeta = metaScores.length > 0 ? metaScores[0].description : '';
    const metaTags = generateMetaTags(bestTitle, bestMeta, keywords);

    return NextResponse.json({
      success: true,
      titles: titleScores,
      metaDescriptions: metaScores,
      keywords: keywords.slice(0, 10),
      metaTags,
      summary: {
        bestTitle,
        bestMeta,
        averageTitleScore: titleScores.length > 0
          ? titleScores.reduce((sum, t) => sum + t.score, 0) / titleScores.length
          : 0,
        averageMetaScore: metaScores.length > 0
          ? metaScores.reduce((sum, m) => sum + m.score, 0) / metaScores.length
          : 0,
      },
    });
  } catch (error) {
    console.error('SEO API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate SEO suggestions',
      },
      { status: 500 }
    );
  }
}

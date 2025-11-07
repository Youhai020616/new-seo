import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateAITitles } from '@/lib/ai/services/title-service';
import { generateAIMeta } from '@/lib/ai/services/meta-service';
import type { Keyword } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, summary, content } = body as { keywords: Keyword[]; summary?: string; content?: string };

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ success: false, error: 'Keywords are required' }, { status: 400 });
    }

    const [titlesResult, metaResult] = await Promise.all([
      generateAITitles(keywords, summary || content || ''),
      generateAIMeta(keywords, content || summary || ''),
    ]);

    const totalTokens = (titlesResult.usage.total_tokens || 0) + (metaResult.usage.total_tokens || 0);

    return NextResponse.json({
      success: true,
      ai_powered: true,
      titles: titlesResult.titles,
      meta_descriptions: metaResult.descriptions,
      usage: {
        total_tokens: totalTokens,
        prompt_tokens: (titlesResult.usage.prompt_tokens || 0) + (metaResult.usage.prompt_tokens || 0),
        completion_tokens: (titlesResult.usage.completion_tokens || 0) + (metaResult.usage.completion_tokens || 0),
      },
    });
  } catch (error) {
    console.error('AI SEO API error:', error);
    return NextResponse.json({ success: false, error: 'AI generation failed' }, { status: 500 });
  }
}

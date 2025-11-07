import deepseek, { deepseek as ds, DEEPSEEK_MODEL } from '../deepseek-client';
import { SEO_TITLE_PROMPT } from '../prompts/seo-title';
import { estimateTokensForPrompt } from '../utils/token-counter';
import type { Keyword } from '@/types';

type AITitle = {
  text: string;
  reasoning?: string;
  keywords_used?: string[];
  estimated_ctr?: 'high' | 'medium' | 'low';
  score?: number;
};

export async function generateAITitles(
  keywords: Keyword[],
  summary: string
): Promise<{ titles: AITitle[]; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  if (!keywords || keywords.length === 0) {
    return { titles: [{ text: 'No keywords provided' }], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
  }

  const topKeywords = keywords.slice(0, 3).map(k => k.word).join(', ');
  const prompt = SEO_TITLE_PROMPT.replace('{keywords}', topKeywords).replace('{summary}', summary || '');

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert SEO specialist. Respond in valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const raw = response.choices?.[0]?.message?.content || '{}';
    let parsed = {} as any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // 일부 응답이 JSON이 아닐 경우, 시도하여 추출
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const titles: AITitle[] = (parsed.titles || []).map((t: any) => ({
      text: t.text || t.title || '',
      reasoning: t.reasoning || t.explanation || '',
      keywords_used: t.keywords_used || [],
      estimated_ctr: t.estimated_ctr || 'medium',
    }));

    // Add simple scoring
    const scored = titles.map(t => ({ ...t, score: calculateTitleScore(t.text, keywords) }));

    return {
      titles: scored,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || estimateTokensForPrompt(prompt, JSON.stringify(summary || '')),
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('generateAITitles error:', error);
    throw error;
  }
}

function calculateTitleScore(title: string, keywords: Keyword[]): number {
  let score = 0;
  if (!title) return 0;
  // length
  if (title.length >= 50 && title.length <= 60) score += 30;
  else if (title.length >= 40 && title.length < 70) score += 20;

  const tl = title.toLowerCase();
  keywords.slice(0, 3).forEach(k => {
    if (tl.includes(k.word.toLowerCase())) score += 25;
  });

  if (/\d/.test(title)) score += 10;
  return Math.min(score, 100);
}

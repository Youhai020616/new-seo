import deepseek, { DEEPSEEK_MODEL } from '../deepseek-client';
import { META_DESCRIPTION_PROMPT } from '../prompts/meta-description';
import { estimateTokensForPrompt } from '../utils/token-counter';
import type { Keyword } from '@/types';

type AIMeta = {
  text: string;
  keywords_count?: number;
  has_cta?: boolean;
  tone?: string;
};

export async function generateAIMeta(
  keywords: Keyword[],
  content: string
): Promise<{ descriptions: AIMeta[]; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const topKeywords = (keywords || []).slice(0, 3).map(k => k.word).join(', ');
  const prompt = META_DESCRIPTION_PROMPT.replace('{keywords}', topKeywords).replace('{content}', content || '');

  try {
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: 'You are an expert SEO copywriter. Respond in valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
    });

    const raw = response.choices?.[0]?.message?.content || '{}';
    let parsed = {} as any;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const descriptions: AIMeta[] = (parsed.descriptions || []).map((d: any) => ({
      text: d.text || '',
      keywords_count: d.keywords_count || 0,
      has_cta: !!d.has_cta,
      tone: d.tone || 'informative',
    }));

    return {
      descriptions,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || estimateTokensForPrompt(prompt, content),
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('generateAIMeta error:', error);
    throw error;
  }
}

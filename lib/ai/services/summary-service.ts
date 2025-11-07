import deepseek, { DEEPSEEK_MODEL } from '../deepseek-client';
import { SUMMARY_PROMPT, SUMMARY_PROMPT_EN } from '../prompts/summary';
import { estimateTokensForPrompt } from '../utils/token-counter';
import { withRetry, RetryPresets } from '../utils/retry-handler';
import { withFallback } from '../middleware/fallback';
import { AIErrorHandler } from '../middleware/error-handler';
import { GlobalCacheManager, generateCacheKey } from '../utils/cache-manager';
import { globalCostTracker, type TokenUsage } from '../utils/cost-tracker';

export type SummaryLength = 'short' | 'medium' | 'long';

export interface Summary {
  type: SummaryLength;
  text: string;
  char_count: number;
  key_points: string[];
}

export interface SummaryResult {
  summaries: Summary[];
  main_topic: string;
  entities: string[];
  language: 'en' | 'zh';
  usage: TokenUsage;
  cached: boolean;
}

/**
 * Detect language from content
 */
function detectLanguage(content: string): 'en' | 'zh' {
  // Simple heuristic: check for Chinese characters
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
  return chineseChars && chineseChars.length > 20 ? 'zh' : 'en';
}

/**
 * Generate rule-based fallback summary
 */
function generateFallbackSummary(content: string, language: 'en' | 'zh'): Summary[] {
  const sentences = content.split(/[.!?。！？]/).filter((s) => s.trim().length > 0);

  // Short summary: first sentence
  const shortText = sentences[0]?.trim().slice(0, 80) || content.slice(0, 80);

  // Medium summary: first 2-3 sentences
  const mediumText = sentences.slice(0, 3).join('. ').trim().slice(0, 200);

  // Long summary: first 5-7 sentences
  const longText = sentences.slice(0, 7).join('. ').trim().slice(0, 400);

  return [
    {
      type: 'short',
      text: shortText,
      char_count: shortText.length,
      key_points: [],
    },
    {
      type: 'medium',
      text: mediumText,
      char_count: mediumText.length,
      key_points: [],
    },
    {
      type: 'long',
      text: longText,
      char_count: longText.length,
      key_points: [],
    },
  ];
}

/**
 * Generate AI summaries with caching and error handling
 */
export async function generateAISummary(
  content: string,
  options: {
    language?: 'en' | 'zh';
    lengths?: SummaryLength[];
    useCache?: boolean;
  } = {}
): Promise<SummaryResult> {
  const language = options.language || detectLanguage(content);
  const lengths = options.lengths || ['short', 'medium', 'long'];
  const useCache = options.useCache !== false;

  // Check cache first
  const cacheManager = GlobalCacheManager.getInstance<SummaryResult>('summary');
  const cacheKey = generateCacheKey('summary', { content, language, lengths });

  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.info('[Summary] Using cached result');
      return { ...cached, cached: true };
    }
  }

  // Prepare prompt
  const prompt = (language === 'zh' ? SUMMARY_PROMPT : SUMMARY_PROMPT_EN)
    .replace('{content}', content.slice(0, 2000)) // Limit content length
    .replace('{language}', language);

  // AI function with retry
  const aiFunction = () =>
    withRetry(
      async () => {
        const response = await deepseek.chat.completions.create({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: 'You are an expert content summarization assistant. Respond in valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 1200,
        });

        const raw = response.choices?.[0]?.message?.content || '{}';
        let parsed: any;

        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          // Try to extract JSON from response
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : {};
        }

        // Filter requested lengths
        const filteredSummaries = (parsed.summaries || []).filter((s: any) =>
          lengths.includes(s.type)
        );

        return {
          summaries: filteredSummaries.map((s: any) => ({
            type: s.type,
            text: s.text || '',
            char_count: s.char_count || s.text?.length || 0,
            key_points: s.key_points || [],
          })),
          main_topic: parsed.main_topic || '',
          entities: parsed.entities || [],
          language: parsed.language || language,
          usage: {
            prompt_tokens: response.usage?.prompt_tokens || estimateTokensForPrompt(prompt),
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
          },
        };
      },
      RetryPresets.standard
    );

  // Fallback function
  const fallbackFunction = () => {
    console.warn('[Summary] AI failed, using fallback summary generation');
    return {
      summaries: generateFallbackSummary(content, language),
      main_topic: 'Summary generated using fallback method',
      entities: [],
      language,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  };

  // Execute with fallback
  const result = await withFallback(aiFunction, fallbackFunction);

  // Track usage
  if (result.data.usage.total_tokens > 0 && !result.usedFallback) {
    globalCostTracker.trackUsage('summary', 'generate', result.data.usage, {
      success: true,
      cacheHit: false,
    });
  }

  // Cache result
  if (useCache && !result.usedFallback) {
    cacheManager.set(cacheKey, { ...result.data, cached: false });
  }

  return {
    ...result.data,
    cached: false,
  };
}

/**
 * Batch generate summaries for multiple contents
 */
export async function generateBatchSummaries(
  contents: { id: string; content: string; language?: 'en' | 'zh' }[]
): Promise<Map<string, SummaryResult>> {
  const results = new Map<string, SummaryResult>();

  // Process in parallel with limit
  const batchSize = 3;
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((item) =>
        generateAISummary(item.content, { language: item.language }).then((result) => ({
          id: item.id,
          result,
        }))
      )
    );

    for (const promiseResult of batchResults) {
      if (promiseResult.status === 'fulfilled') {
        results.set(promiseResult.value.id, promiseResult.value.result);
      }
    }
  }

  return results;
}

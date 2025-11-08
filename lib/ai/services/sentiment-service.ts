import deepseek, { DEEPSEEK_MODEL } from '../deepseek-client';
import { SENTIMENT_PROMPT, SENTIMENT_PROMPT_EN } from '../prompts/sentiment';
import { estimateTokensForPrompt } from '../utils/token-counter';
import { withRetry, RetryPresets } from '../utils/retry-handler';
import { withFallback } from '../middleware/fallback';
import { GlobalCacheManager, generateCacheKey } from '../utils/cache-manager';
import { globalCostTracker, type TokenUsage } from '../utils/cost-tracker';

export type SentimentType = 'positive' | 'neutral' | 'negative';
export type IntensityType = 'strong' | 'moderate' | 'mild';

export interface SentimentScores {
  positive: number;
  neutral: number;
  negative: number;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: SentimentType;
  confidence: number;
}

export interface SentimentResult {
  sentiment: SentimentType;
  confidence: number;
  scores: SentimentScores;
  keywords: string[];
  reasoning: string;
  intensity: IntensityType;
  aspects?: AspectSentiment[];
  usage: TokenUsage;
  cached: boolean;
}

/**
 * Rule-based fallback sentiment analysis
 */
function analyzeSentimentFallback(content: string): Omit<SentimentResult, 'usage' | 'cached'> {
  const text = content.toLowerCase();

  // Simple keyword-based sentiment analysis
  const positiveKeywords = [
    'good',
    'great',
    'excellent',
    'success',
    'win',
    'gain',
    'improve',
    'growth',
    'positive',
    '好',
    '优秀',
    '成功',
    '增长',
    '提升',
    '积极',
  ];

  const negativeKeywords = [
    'bad',
    'poor',
    'fail',
    'loss',
    'decline',
    'crisis',
    'problem',
    'negative',
    '坏',
    '差',
    '失败',
    '下降',
    '危机',
    '问题',
    '消极',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) positiveCount++;
  }

  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) negativeCount++;
  }

  // Determine sentiment
  let sentiment: SentimentType = 'neutral';
  let intensity: IntensityType = 'mild';

  const diff = Math.abs(positiveCount - negativeCount);

  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    intensity = diff >= 3 ? 'strong' : diff >= 2 ? 'moderate' : 'mild';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    intensity = diff >= 3 ? 'strong' : diff >= 2 ? 'moderate' : 'mild';
  }

  // Calculate scores
  const total = positiveCount + negativeCount + 1; // +1 to avoid division by zero
  const scores: SentimentScores = {
    positive: positiveCount / total,
    negative: negativeCount / total,
    neutral: 1 / total,
  };

  return {
    sentiment,
    confidence: Math.min((diff + 1) / (total + 1), 0.9),
    scores,
    keywords: [],
    reasoning: 'Sentiment analyzed using rule-based fallback method',
    intensity,
    aspects: [],
  };
}

/**
 * Detect language from content
 */
function detectLanguage(content: string): 'en' | 'zh' {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g);
  return chineseChars && chineseChars.length > 20 ? 'zh' : 'en';
}

/**
 * Analyze sentiment using AI with caching and error handling
 */
export async function analyzeSentiment(
  content: string,
  options: {
    language?: 'en' | 'zh';
    useCache?: boolean;
  } = {}
): Promise<SentimentResult> {
  const language = options.language || detectLanguage(content);
  const useCache = options.useCache !== false;

  // Check cache first
  const cacheManager = GlobalCacheManager.getInstance<SentimentResult>('sentiment', {
    ttl: 21600, // 6 hours
    maxSize: 500,
    strategy: 'lru',
  });
  const cacheKey = generateCacheKey('sentiment', { content, language });

  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.info('[Sentiment] Using cached result');
      return { ...cached, cached: true };
    }
  }

  // Prepare prompt
  const prompt = (language === 'zh' ? SENTIMENT_PROMPT : SENTIMENT_PROMPT_EN)
    .replace('{content}', content.slice(0, 2000)) // Limit content length
    .replace('{language}', language);

  // AI function with retry
  const aiFunction = (): Promise<Omit<SentimentResult, 'cached'>> =>
    withRetry(
      async () => {
        const response = await deepseek.chat.completions.create({
          model: DEEPSEEK_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert sentiment analysis assistant. Respond in valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3, // Lower temperature for more consistent results
          max_tokens: 800,
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

        return {
          sentiment: parsed.sentiment || 'neutral',
          confidence: parsed.confidence || 0.5,
          scores: parsed.scores || { positive: 0.33, neutral: 0.34, negative: 0.33 },
          keywords: parsed.keywords || [],
          reasoning: parsed.reasoning || '',
          intensity: parsed.intensity || 'moderate',
          aspects: parsed.aspects || [],
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
  const fallbackFunction = (): Omit<SentimentResult, 'cached'> => {
    console.warn('[Sentiment] AI failed, using rule-based fallback');
    return {
      ...analyzeSentimentFallback(content),
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  };

  // Execute with fallback
  const result = await withFallback(aiFunction, fallbackFunction);

  // Track usage
  if (result.data.usage.total_tokens > 0 && !result.usedFallback) {
    globalCostTracker.trackUsage('sentiment', 'analyze', result.data.usage, {
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
 * Batch sentiment analysis for multiple contents
 */
export async function analyzeBatchSentiment(
  contents: { id: string; content: string; language?: 'en' | 'zh' }[]
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>();

  // Process in parallel with limit
  const batchSize = 3;
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map((item) =>
        analyzeSentiment(item.content, { language: item.language }).then((result) => ({
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

/**
 * Get sentiment color for UI display
 */
export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'positive':
      return 'green';
    case 'negative':
      return 'red';
    case 'neutral':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Get sentiment emoji
 */
export function getSentimentEmoji(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    case 'neutral':
      return '😐';
    default:
      return '😐';
  }
}

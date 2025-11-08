import deepseek, { DEEPSEEK_MODEL } from '../deepseek-client';
import { TREND_ANALYSIS_PROMPT, TREND_ANALYSIS_PROMPT_EN } from '../prompts/trend-analysis';
import { estimateTokensForPrompt } from '../utils/token-counter';
import { withRetry, RetryPresets } from '../utils/retry-handler';
import { withFallback } from '../middleware/fallback';
import { GlobalCacheManager, generateCacheKey } from '../utils/cache-manager';
import { globalCostTracker, type TokenUsage } from '../utils/cost-tracker';
import type { NewsItem } from '@/types';

export type TrendPrediction = 'rising' | 'stable' | 'declining';
export type TrendPotential = 'high' | 'medium' | 'low';
export type TrendVelocity = 'fast' | 'moderate' | 'slow';
export type TopicRelationship = 'causes' | 'related_to' | 'opposes';

export interface TrendingTopic {
  id: string;
  topic: string;
  topic_en?: string;
  description: string;
  prediction: TrendPrediction;
  growth_rate: number;
  confidence: number;
  related_news_count: number;
  first_seen: string;
  peak_date?: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  impact_score: number;
  category: string;
}

export interface EmergingTopic {
  topic: string;
  first_appeared: string;
  initial_mentions: number;
  potential: TrendPotential;
  reasoning: string;
}

export interface TrendInsights {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  risk_alerts: string[];
}

export interface TopicConnection {
  from: string;
  to: string;
  relationship: TopicRelationship;
  strength: number;
}

export interface TopicNetwork {
  connections: TopicConnection[];
}

export interface TimeAnalysis {
  current_period: string;
  most_active_day: string;
  trend_velocity: TrendVelocity;
}

export interface TrendAnalysisResult {
  trending_topics: TrendingTopic[];
  emerging_topics: EmergingTopic[];
  insights: TrendInsights;
  topic_network: TopicNetwork;
  time_analysis: TimeAnalysis;
  usage: TokenUsage;
  cached: boolean;
}

/**
 * Simple rule-based trend analysis fallback
 */
function analyzeTrendsFallback(newsItems: NewsItem[]): Omit<TrendAnalysisResult, 'usage' | 'cached'> {
  // Extract common words from titles
  const wordFrequency: Map<string, number> = new Map();

  newsItems.forEach(item => {
    const words = item.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) { // Filter short words
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });
  });

  // Get top topics
  const sortedTopics = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const trendingTopics: TrendingTopic[] = sortedTopics.map(([ word, count], index) => ({
    id: `topic_${index + 1}`,
    topic: word.charAt(0).toUpperCase() + word.slice(1),
    topic_en: word.charAt(0).toUpperCase() + word.slice(1),
    description: `Topic based on keyword: ${word}`,
    prediction: 'stable' as TrendPrediction,
    growth_rate: 0,
    confidence: 0.5,
    related_news_count: count,
    first_seen: newsItems[0]?.publishDate || new Date().toISOString().split('T')[0],
    keywords: [word],
    sentiment: 'neutral' as const,
    impact_score: count / newsItems.length,
    category: 'general',
  }));

  return {
    trending_topics: trendingTopics,
    emerging_topics: [],
    insights: {
      summary: 'Trend analysis using rule-based fallback method',
      key_findings: [`Analyzed ${newsItems.length} news articles`, `Found ${trendingTopics.length} topics`],
      recommendations: ['Collect more data for better analysis'],
      risk_alerts: [],
    },
    topic_network: {
      connections: [],
    },
    time_analysis: {
      current_period: 'N/A',
      most_active_day: newsItems[0]?.publishDate || new Date().toISOString().split('T')[0],
      trend_velocity: 'moderate' as TrendVelocity,
    },
  };
}

/**
 * Detect language from news items
 */
function detectLanguageFromNews(newsItems: NewsItem[]): 'en' | 'zh' {
  const allText = newsItems.map(n => n.title + ' ' + n.summary).join(' ');
  const chineseChars = allText.match(/[\u4e00-\u9fa5]/g);
  return chineseChars && chineseChars.length > 50 ? 'zh' : 'en';
}

/**
 * Analyze trends from news items
 */
export async function analyzeTrends(
  newsItems: NewsItem[],
  options: {
    timeRange?: 'day' | 'week' | 'month';
    focusArea?: string;
    language?: 'en' | 'zh';
    useCache?: boolean;
  } = {}
): Promise<TrendAnalysisResult> {
  const timeRange = options.timeRange || 'week';
  const focusArea = options.focusArea || 'all';
  const language = options.language || detectLanguageFromNews(newsItems);
  const useCache = options.useCache !== false;

  // Validation
  if (!newsItems || newsItems.length === 0) {
    throw new Error('News items array is empty');
  }

  if (newsItems.length < 3) {
    throw new Error('At least 3 news items are required for trend analysis');
  }

  // Check cache
  const cacheManager = GlobalCacheManager.getInstance<TrendAnalysisResult>('trend-analysis', {
    ttl: 3600, // 1 hour
    maxSize: 100,
    strategy: 'lru',
  });

  const newsIds = newsItems.map(n => n.id).join(',');
  const cacheKey = generateCacheKey('trend', { newsIds, timeRange, focusArea, language });

  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.info('[TrendAnalysis] Using cached result');
      return { ...cached, cached: true };
    }
  }

  // Prepare news summary for prompt (optimized for speed)
  // Reduce to 15 items for faster processing while maintaining quality
  const maxNewsItems = newsItems.length > 20 ? 15 : Math.min(newsItems.length, 20);
  const newsSummary = newsItems
    .slice(0, maxNewsItems)
    .map((item, index) => `${index + 1}. [${item.publishDate}] ${item.title} - ${item.summary?.slice(0, 80) || ''}`)
    .join('\n');

  // Prepare prompt
  const prompt = (language === 'zh' ? TREND_ANALYSIS_PROMPT : TREND_ANALYSIS_PROMPT_EN)
    .replace('{news_items}', newsSummary)
    .replace('{time_range}', timeRange)
    .replace('{focus_area}', focusArea)
    .replace('{language}', language);

  // AI function with retry
  const aiFunction = () =>
    withRetry(
      async () => {
        const response = await deepseek.chat.completions.create({
          model: DEEPSEEK_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert trend analyst and data scientist. Respond in valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500, // Reduced from 2000 for faster response
        });

        const raw = response.choices?.[0]?.message?.content || '{}';
        let parsed: any;

        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : {};
        }

        return {
          trending_topics: parsed.trending_topics || [],
          emerging_topics: parsed.emerging_topics || [],
          insights: parsed.insights || {
            summary: '',
            key_findings: [],
            recommendations: [],
            risk_alerts: [],
          },
          topic_network: parsed.topic_network || { connections: [] },
          time_analysis: parsed.time_analysis || {
            current_period: 'N/A',
            most_active_day: 'N/A',
            trend_velocity: 'moderate',
          },
          usage: {
            prompt_tokens: response.usage?.prompt_tokens || estimateTokensForPrompt(prompt),
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
          },
        };
      },
      // Custom fast retry for trend analysis: 6s timeout, 1 retry max
      {
        maxRetries: 1,
        backoff: 'linear' as const,
        timeout: 6000,
      }
    );

  // Fallback function
  const fallbackFunction = () => {
    console.warn('[TrendAnalysis] AI failed, using rule-based analysis');
    return {
      ...analyzeTrendsFallback(newsItems),
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  };

  // Execute with fallback
  const result = await withFallback(aiFunction, fallbackFunction);

  // Track usage
  if (result.data.usage.total_tokens > 0 && !result.usedFallback) {
    globalCostTracker.trackUsage('trend-analysis', 'analyze', result.data.usage, {
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
 * Get trend statistics
 */
export function getTrendStats(result: TrendAnalysisResult): {
  totalTopics: number;
  risingTopics: number;
  decliningTopics: number;
  emergingTopics: number;
  averageGrowthRate: number;
  highImpactTopics: number;
} {
  const trending = result.trending_topics;

  return {
    totalTopics: trending.length,
    risingTopics: trending.filter(t => t.prediction === 'rising').length,
    decliningTopics: trending.filter(t => t.prediction === 'declining').length,
    emergingTopics: result.emerging_topics.length,
    averageGrowthRate: Number(
      (trending.reduce((sum, t) => sum + t.growth_rate, 0) / (trending.length || 1)).toFixed(3)
    ),
    highImpactTopics: trending.filter(t => t.impact_score > 0.7).length,
  };
}

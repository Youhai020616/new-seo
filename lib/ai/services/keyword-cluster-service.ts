import deepseek, { DEEPSEEK_MODEL } from '../deepseek-client';
import { KEYWORD_CLUSTER_PROMPT, KEYWORD_CLUSTER_PROMPT_EN } from '../prompts/keyword-cluster';
import { estimateTokensForPrompt } from '../utils/token-counter';
import { withRetry, RetryPresets } from '../utils/retry-handler';
import { withFallback } from '../middleware/fallback';
import { GlobalCacheManager, generateCacheKey } from '../utils/cache-manager';
import { globalCostTracker, type TokenUsage } from '../utils/cost-tracker';
import type { Keyword } from '@/types';

export interface ClusterKeyword extends Keyword {
  relevance_to_theme?: number;
}

export interface KeywordCluster {
  id: string;
  theme: string;
  theme_en?: string;
  keywords: ClusterKeyword[];
  size: number;
  cohesion_score: number;
  description: string;
}

export interface TopicRelationship {
  from: string;
  to: string;
  relationship: 'related' | 'opposed' | 'contains';
  strength: number;
}

export interface ClusterInsights {
  main_topics: string[];
  topic_relationships: TopicRelationship[];
  summary: string;
}

export interface QualityMetrics {
  avg_cohesion: number;
  separation_score: number;
  coverage: number;
}

export interface KeywordClusterResult {
  clusters: KeywordCluster[];
  insights: ClusterInsights;
  quality_metrics: QualityMetrics;
  usage: TokenUsage;
  cached: boolean;
}

/**
 * Simple rule-based keyword clustering fallback
 */
function clusterKeywordsFallback(keywords: Keyword[], numClusters: number): Omit<KeywordClusterResult, 'usage' | 'cached'> {
  // Simple clustering by TF-IDF score ranges
  const sortedKeywords = [...keywords].sort((a, b) => b.tfidf - a.tfidf);

  const clustersPerGroup = Math.ceil(keywords.length / numClusters);
  const clusters: KeywordCluster[] = [];

  for (let i = 0; i < numClusters && i * clustersPerGroup < keywords.length; i++) {
    const start = i * clustersPerGroup;
    const end = Math.min(start + clustersPerGroup, keywords.length);
    const clusterKeywords = sortedKeywords.slice(start, end);

    clusters.push({
      id: `cluster_${i + 1}`,
      theme: `Topic ${i + 1}`,
      theme_en: `Topic ${i + 1}`,
      keywords: clusterKeywords,
      size: clusterKeywords.length,
      cohesion_score: 0.5,
      description: `Cluster ${i + 1} based on keyword importance`,
    });
  }

  return {
    clusters,
    insights: {
      main_topics: clusters.map(c => c.theme),
      topic_relationships: [],
      summary: 'Keywords clustered using rule-based fallback method',
    },
    quality_metrics: {
      avg_cohesion: 0.5,
      separation_score: 0.5,
      coverage: 1.0,
    },
  };
}

/**
 * Detect language from keywords
 */
function detectLanguageFromKeywords(keywords: Keyword[]): 'en' | 'zh' {
  const allText = keywords.map(k => k.word).join(' ');
  const chineseChars = allText.match(/[\u4e00-\u9fa5]/g);
  return chineseChars && chineseChars.length > 10 ? 'zh' : 'en';
}

/**
 * Cluster keywords using AI
 */
export async function clusterKeywords(
  keywords: Keyword[],
  options: {
    numClusters?: number;
    language?: 'en' | 'zh';
    useCache?: boolean;
  } = {}
): Promise<KeywordClusterResult> {
  const numClusters = options.numClusters || Math.min(Math.max(3, Math.ceil(keywords.length / 5)), 8);
  const language = options.language || detectLanguageFromKeywords(keywords);
  const useCache = options.useCache !== false;

  // Validation
  if (!keywords || keywords.length === 0) {
    throw new Error('Keywords array is empty');
  }

  if (keywords.length < 3) {
    throw new Error('At least 3 keywords are required for clustering');
  }

  // Check cache
  const cacheManager = GlobalCacheManager.getInstance<KeywordClusterResult>('keyword-cluster', {
    ttl: 3600, // 1 hour
    maxSize: 200,
    strategy: 'lru',
  });
  const cacheKey = generateCacheKey('cluster', { keywords: keywords.map(k => k.word), numClusters, language });

  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.info('[KeywordCluster] Using cached result');
      return { ...cached, cached: true };
    }
  }

  // Prepare keyword list for prompt
  const keywordList = keywords
    .slice(0, 50) // Limit to top 50 keywords
    .map(k => `${k.word} (freq: ${k.frequency ?? 0}, tfidf: ${(k.tfidf ?? 0).toFixed(2)})`)
    .join(', ');

  // Prepare prompt
  const prompt = (language === 'zh' ? KEYWORD_CLUSTER_PROMPT : KEYWORD_CLUSTER_PROMPT_EN)
    .replace('{keywords}', keywordList)
    .replace('{num_clusters}', numClusters.toString())
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
              content: 'You are an expert in NLP and topic modeling. Respond in valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        });

        const raw = response.choices?.[0]?.message?.content || '{}';
        let parsed: any;

        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          const match = raw.match(/\{[\s\S]*\}/);
          parsed = match ? JSON.parse(match[0]) : {};
        }

        // Process clusters
        const clusters: KeywordCluster[] = (parsed.clusters || []).map((c: any) => ({
          id: c.id || `cluster_${Math.random().toString(36).substr(2, 9)}`,
          theme: c.theme || 'Unnamed Theme',
          theme_en: c.theme_en || c.theme || 'Unnamed Theme',
          keywords: (c.keywords || []).map((kw: any) => ({
            word: kw.word,
            frequency: kw.frequency || 0,
            tfidf: kw.tfidf || 0,
            relevance_to_theme: kw.relevance_to_theme || 0.5,
          })),
          size: c.size || (c.keywords || []).length,
          cohesion_score: c.cohesion_score || 0.5,
          description: c.description || '',
        }));

        return {
          clusters,
          insights: {
            main_topics: parsed.insights?.main_topics || clusters.map(c => c.theme),
            topic_relationships: parsed.insights?.topic_relationships || [],
            summary: parsed.insights?.summary || 'Keywords clustered by semantic similarity',
          },
          quality_metrics: {
            avg_cohesion: parsed.quality_metrics?.avg_cohesion || 0.5,
            separation_score: parsed.quality_metrics?.separation_score || 0.5,
            coverage: parsed.quality_metrics?.coverage || 1.0,
          },
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
    console.warn('[KeywordCluster] AI failed, using rule-based clustering');
    return {
      ...clusterKeywordsFallback(keywords, numClusters),
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  };

  // Execute with fallback
  const result = await withFallback(aiFunction, fallbackFunction);

  // Track usage
  if (result.data.usage.total_tokens > 0 && !result.usedFallback) {
    globalCostTracker.trackUsage('keyword-cluster', 'cluster', result.data.usage, {
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
 * Get cluster statistics
 */
export function getClusterStats(result: KeywordClusterResult): {
  totalKeywords: number;
  averageClusterSize: number;
  largestCluster: KeywordCluster | null;
  smallestCluster: KeywordCluster | null;
} {
  const clusters = result.clusters;
  const totalKeywords = clusters.reduce((sum, c) => sum + c.size, 0);
  const averageClusterSize = clusters.length > 0 ? totalKeywords / clusters.length : 0;

  const largestCluster = clusters.reduce(
    (largest, c) => (!largest || c.size > largest.size ? c : largest),
    null as KeywordCluster | null
  );

  const smallestCluster = clusters.reduce(
    (smallest, c) => (!smallest || c.size < smallest.size ? c : smallest),
    null as KeywordCluster | null
  );

  return {
    totalKeywords,
    averageClusterSize: Number(averageClusterSize.toFixed(2)),
    largestCluster,
    smallestCluster,
  };
}

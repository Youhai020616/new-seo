/**
 * AI Components Shared Types
 * Type definitions for AI-powered React components
 */

// ============================================================================
// Summary Types
// ============================================================================

export type SummaryLength = 'short' | 'medium' | 'long';

export interface Summary {
  short: string;
  medium: string;
  long: string;
}

export interface SummaryResult {
  summary: Summary;
  usage: TokenUsage;
  cached: boolean;
}

// ============================================================================
// Sentiment Types
// ============================================================================

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface Emotion {
  emotion: string;
  intensity: number;
}

export interface SentimentAspect {
  aspect: string;
  sentiment: SentimentLabel;
  confidence: number;
}

export interface SentimentResult {
  sentiment: SentimentLabel;
  confidence: number;
  score: number;
  emotions: Emotion[];
  keywords: string[];
  aspects: SentimentAspect[];
  usage: TokenUsage;
  cached: boolean;
}

// ============================================================================
// Keyword Cluster Types
// ============================================================================

export interface Keyword {
  keyword: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
}

export interface KeywordCluster {
  id: string;
  theme: string;
  theme_en?: string;
  keywords: Keyword[];
  avg_difficulty: number;
  total_volume: number;
  recommended_content: string;
}

export interface ClusterRelationship {
  from: string;
  to: string;
  strength: number;
  relationship_type: 'complementary' | 'competitive' | 'hierarchical';
}

export interface ClusterQualityMetrics {
  silhouette_score: number;
  avg_cluster_coherence: number;
  keyword_coverage: number;
}

export interface KeywordClusterResult {
  clusters: KeywordCluster[];
  relationships: ClusterRelationship[];
  quality_metrics: ClusterQualityMetrics;
  recommendations: string[];
  usage: TokenUsage;
  cached: boolean;
}

// ============================================================================
// Trend Analysis Types
// ============================================================================

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

export interface TrendStats {
  totalTopics: number;
  risingTopics: number;
  decliningTopics: number;
  emergingTopics: number;
  averageGrowthRate: number;
  highImpactTopics: number;
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

// ============================================================================
// Shared Types
// ============================================================================

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AISummaryCardProps {
  content: string;
  language?: 'en' | 'zh';
  defaultLength?: SummaryLength;
  onError?: (error: string) => void;
}

export interface SentimentBadgeProps {
  content: string;
  language?: 'en' | 'zh';
  showDetails?: boolean;
  onError?: (error: string) => void;
}

export interface KeywordClusterViewProps {
  keywords: Keyword[];
  numClusters?: number;
  language?: 'en' | 'zh';
  onError?: (error: string) => void;
}

export interface TrendChartProps {
  newsItems: any[];
  timeRange?: 'day' | 'week' | 'month';
  focusArea?: string;
  language?: 'en' | 'zh';
  onError?: (error: string) => void;
}

export interface AIUsageDashboardProps {
  refreshInterval?: number;
}

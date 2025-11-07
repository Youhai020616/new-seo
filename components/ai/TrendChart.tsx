/**
 * TrendChart Component
 * Displays AI-powered trend analysis with visualizations
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  Clock,
  Network,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import type { TrendChartProps, TrendAnalysisResult, TrendingTopic } from './types';

export function TrendChart({
  newsItems,
  timeRange = 'week',
  focusArea,
  language = 'zh',
  onError,
}: TrendChartProps) {
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState<TrendAnalysisResult | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['trending', 'insights'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const fetchTrends = async () => {
    if (!newsItems || newsItems.length < 3) {
      const errorMsg = language === 'zh' ? '至少需要3条新闻' : 'At least 3 news items required';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          news_items: newsItems,
          time_range: timeRange,
          focus_area: focusArea,
          language
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze trends');
      }

      setTrendData(result.data);
      // Auto-select first trending topic
      if (result.data?.trending_topics?.length > 0) {
        setSelectedTopic(result.data.trending_topics[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [newsItems, timeRange, focusArea]);

  const getPredictionConfig = (prediction: string) => {
    const configs = {
      rising: {
        icon: TrendingUp,
        label: language === 'zh' ? '上升' : 'Rising',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
      },
      stable: {
        icon: Minus,
        label: language === 'zh' ? '稳定' : 'Stable',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      },
      declining: {
        icon: TrendingDown,
        label: language === 'zh' ? '下降' : 'Declining',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
      },
    };
    return configs[prediction as keyof typeof configs] || configs.stable;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <BarChart3 className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-500">
            {language === 'zh' ? 'AI 正在分析趋势...' : 'Analyzing trends...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              {language === 'zh' ? '分析失败' : 'Analysis Failed'}
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchTrends}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
            >
              {language === 'zh' ? '重试' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trendData) return null;

  const stats = {
    totalTopics: trendData.trending_topics.length,
    risingTopics: trendData.trending_topics.filter((t) => t.prediction === 'rising').length,
    decliningTopics: trendData.trending_topics.filter((t) => t.prediction === 'declining').length,
    emergingTopics: trendData.emerging_topics.length,
    averageGrowthRate:
      trendData.trending_topics.reduce((sum, t) => sum + t.growth_rate, 0) /
      trendData.trending_topics.length,
    highImpactTopics: trendData.trending_topics.filter((t) => t.impact_score >= 8).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '趋势分析' : 'Trend Analysis'}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{trendData.time_analysis.current_period}</span>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{stats.totalTopics}</div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '热门话题' : 'Hot Topics'}
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.risingTopics}</div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '上升趋势' : 'Rising'}
          </div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.emergingTopics}</div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '新兴话题' : 'Emerging'}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.highImpactTopics}</div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '高影响力' : 'High Impact'}
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div>
        <button
          onClick={() => toggleSection('trending')}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h4 className="text-sm font-semibold text-gray-700">
            {language === 'zh' ? '热门话题' : 'Trending Topics'}
          </h4>
          {expandedSections.has('trending') ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('trending') && (
          <div className="mt-3 space-y-3">
            {trendData.trending_topics.map((topic) => {
              const config = getPredictionConfig(topic.prediction);
              const Icon = config.icon;
              const isSelected = topic.id === selectedTopic;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{topic.topic}</h5>
                      <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded ${config.bg} ${config.border} border`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                    <span>
                      {language === 'zh' ? '增长率' : 'Growth'}: {(topic.growth_rate * 100).toFixed(1)}%
                    </span>
                    <span>
                      {language === 'zh' ? '置信度' : 'Confidence'}: {(topic.confidence * 100).toFixed(0)}%
                    </span>
                    <span>
                      {language === 'zh' ? '影响力' : 'Impact'}: {topic.impact_score}/10
                    </span>
                    <span>
                      {language === 'zh' ? '相关新闻' : 'News'}: {topic.related_news_count}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {topic.keywords.slice(0, 8).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-white border border-blue-200 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {language === 'zh' ? '类别' : 'Category'}: {topic.category}
                        </span>
                        <span>
                          {language === 'zh' ? '首次出现' : 'First seen'}: {topic.first_seen}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Emerging Topics */}
      {trendData.emerging_topics.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('emerging')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-gray-700">
                {language === 'zh' ? '新兴话题' : 'Emerging Topics'}
              </h4>
            </div>
            {expandedSections.has('emerging') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has('emerging') && (
            <div className="mt-3 space-y-2">
              {trendData.emerging_topics.map((topic, idx) => (
                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-gray-900">{topic.topic}</h5>
                    <span className="text-xs px-2 py-1 bg-yellow-100 rounded">
                      {topic.potential === 'high'
                        ? language === 'zh'
                          ? '高潜力'
                          : 'High'
                        : topic.potential === 'medium'
                        ? language === 'zh'
                          ? '中潜力'
                          : 'Medium'
                        : language === 'zh'
                        ? '低潜力'
                        : 'Low'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{topic.reasoning}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {language === 'zh' ? '首次出现' : 'First appeared'}: {topic.first_appeared}
                    </span>
                    <span>
                      {language === 'zh' ? '初始提及' : 'Initial mentions'}: {topic.initial_mentions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      <div>
        <button
          onClick={() => toggleSection('insights')}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h4 className="text-sm font-semibold text-gray-700">
            {language === 'zh' ? 'AI 洞察' : 'AI Insights'}
          </h4>
          {expandedSections.has('insights') ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('insights') && (
          <div className="mt-3 space-y-4">
            {/* Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">{trendData.insights.summary}</p>
            </div>

            {/* Key Findings */}
            {trendData.insights.key_findings.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'zh' ? '关键发现' : 'Key Findings'}
                </h5>
                <ul className="space-y-2">
                  {trendData.insights.key_findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Alerts */}
            {trendData.insights.risk_alerts.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  {language === 'zh' ? '风险警报' : 'Risk Alerts'}
                </h5>
                <div className="space-y-2">
                  {trendData.insights.risk_alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {trendData.insights.recommendations.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {language === 'zh' ? '建议' : 'Recommendations'}
                </h5>
                <ul className="space-y-2">
                  {trendData.insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time Analysis */}
      <div className="pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">
              {language === 'zh' ? '最活跃日期' : 'Most Active'}:
            </span>
            <span className="ml-2 font-medium text-gray-700">
              {trendData.time_analysis.most_active_day}
            </span>
          </div>
          <div>
            <span className="text-gray-500">
              {language === 'zh' ? '趋势速度' : 'Trend Velocity'}:
            </span>
            <span className="ml-2 font-medium text-gray-700">
              {trendData.time_analysis.trend_velocity === 'fast'
                ? language === 'zh'
                  ? '快速'
                  : 'Fast'
                : trendData.time_analysis.trend_velocity === 'moderate'
                ? language === 'zh'
                  ? '中等'
                  : 'Moderate'
                : language === 'zh'
                ? '缓慢'
                : 'Slow'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          {trendData.cached
            ? language === 'zh'
              ? '已缓存结果'
              : 'Cached result'
            : language === 'zh'
            ? '实时分析'
            : 'Real-time analysis'}
        </span>
        <span>{trendData.usage.total_tokens} tokens</span>
      </div>
    </div>
  );
}

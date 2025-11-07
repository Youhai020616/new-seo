/**
 * SentimentBadge Component
 * Displays AI sentiment analysis with emotion details
 */

'use client';

import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, ChevronDown, ChevronUp, TrendingUp, AlertCircle } from 'lucide-react';
import type { SentimentBadgeProps, SentimentResult, SentimentLabel } from './types';

export function SentimentBadge({
  content,
  language = 'zh',
  showDetails = true,
  onError,
}: SentimentBadgeProps) {
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState<SentimentResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = async () => {
    if (!content?.trim()) {
      const errorMsg = language === 'zh' ? '内容不能为空' : 'Content cannot be empty';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze sentiment');
      }

      setSentimentData(result.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch only if showDetails is true and we don't have data yet
    if (showDetails && !sentimentData && !loading && !error) {
      fetchSentiment();
    }
  }, [content, showDetails]);

  // Handle click to fetch data when showDetails is false
  const handleClick = () => {
    if (showDetails) {
      setExpanded(!expanded);
    } else {
      // If showDetails is false and we don't have data, fetch it first
      if (!sentimentData && !loading) {
        fetchSentiment().then(() => setExpanded(true));
      } else {
        setExpanded(!expanded);
      }
    }
  };

  const getSentimentConfig = (sentiment: SentimentLabel) => {
    const configs = {
      positive: {
        icon: Smile,
        label: language === 'zh' ? '正面' : 'Positive',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-500',
      },
      neutral: {
        icon: Meh,
        label: language === 'zh' ? '中性' : 'Neutral',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-500',
      },
      negative: {
        icon: Frown,
        label: language === 'zh' ? '负面' : 'Negative',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-500',
      },
    };
    return configs[sentiment] || configs.neutral;
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-600">
          {language === 'zh' ? '分析中...' : 'Analyzing...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">
          {language === 'zh' ? '分析失败' : 'Analysis failed'}
        </span>
      </div>
    );
  }

  // If no data yet, show a "Click to analyze" button when showDetails is false
  if (!sentimentData && !showDetails) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
      >
        <span className="text-sm text-blue-700">
          {language === 'zh' ? '情感分析' : 'Analyze'}
        </span>
      </button>
    );
  }

  if (!sentimentData) return null;

  const config = getSentimentConfig(sentimentData.sentiment);
  const Icon = config.icon;
  const confidencePercent = Math.round(sentimentData.confidence * 100);

  return (
    <div className="inline-block">
      {/* Main Badge */}
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${config.bg} ${config.border} ${
          showDetails || !sentimentData ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'
        }`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div className="flex flex-col items-start">
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          <span className="text-xs text-gray-500">{confidencePercent}% {language === 'zh' ? '置信度' : 'confidence'}</span>
        </div>
        {showDetails && (
          <div className="ml-1">
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
      </button>

      {/* Detailed Panel */}
      {showDetails && expanded && sentimentData && (
        <div className={`mt-2 p-4 rounded-lg border ${config.bg} ${config.border} space-y-4`}>
          {/* Sentiment Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {language === 'zh' ? '情感得分' : 'Sentiment Score'}
              </span>
              <span className={`text-sm font-bold ${config.color}`}>
                {sentimentData.score.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${config.badge}`}
                style={{ width: `${((sentimentData.score + 1) / 2) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{language === 'zh' ? '负面' : 'Negative'} (-1)</span>
              <span>{language === 'zh' ? '中性' : 'Neutral'} (0)</span>
              <span>{language === 'zh' ? '正面' : 'Positive'} (+1)</span>
            </div>
          </div>

          {/* Emotions */}
          {sentimentData.emotions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {language === 'zh' ? '检测到的情感' : 'Detected Emotions'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {sentimentData.emotions.map((emotion, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full"
                  >
                    <span className="text-sm text-gray-700">{emotion.emotion}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-gray-500">{Math.round(emotion.intensity * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {sentimentData.keywords.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {language === 'zh' ? '关键词' : 'Keywords'}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {sentimentData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-white border border-gray-200 rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aspects */}
          {sentimentData.aspects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {language === 'zh' ? '方面分析' : 'Aspect Analysis'}
              </h4>
              <div className="space-y-2">
                {sentimentData.aspects.map((aspect, index) => {
                  const aspectConfig = getSentimentConfig(aspect.sentiment);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-700">{aspect.aspect}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${aspectConfig.color}`}>
                          {aspectConfig.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(aspect.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              {sentimentData.cached
                ? language === 'zh'
                  ? '已缓存结果'
                  : 'Cached result'
                : language === 'zh'
                ? '实时分析'
                : 'Real-time analysis'}
            </span>
            <span>{sentimentData.usage.total_tokens} tokens</span>
          </div>
        </div>
      )}
    </div>
  );
}

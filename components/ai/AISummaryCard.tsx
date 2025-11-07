/**
 * AISummaryCard Component
 * Displays AI-generated summaries with multiple length options
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AISummaryCardProps, SummaryLength, SummaryResult } from './types';

export function AISummaryCard({
  content,
  language = 'zh',
  defaultLength = 'medium',
  onError,
}: AISummaryCardProps) {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [selectedLength, setSelectedLength] = useState<SummaryLength>(defaultLength);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false); // Track if summary has been generated

  const lengthOptions: { value: SummaryLength; label: string; labelEn: string }[] = [
    { value: 'short', label: '简短', labelEn: 'Short' },
    { value: 'medium', label: '中等', labelEn: 'Medium' },
    { value: 'long', label: '详细', labelEn: 'Long' },
  ];

  const fetchSummary = async () => {
    if (!content?.trim()) {
      const errorMsg = language === 'zh' ? '内容不能为空' : 'Content cannot be empty';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    setHasGenerated(true); // Mark as generated

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate summary');
      }

      setSummaryData(result.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Remove auto-fetch on content change - now requires manual trigger
  // useEffect(() => {
  //   fetchSummary();
  // }, [content]);

  // Find the summary with the selected length from the summary object
  const currentSummary = summaryData?.summary?.[selectedLength] || '';
  const tokenCount = summaryData?.usage?.total_tokens || 0;
  const isCached = summaryData?.cached || false;

  // Show initial state with generate button
  if (!hasGenerated && !loading && !summaryData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'zh' ? 'AI 智能摘要' : 'AI Summary'}
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              {language === 'zh' 
                ? '点击按钮使用 AI 生成简短/中等/详细三种长度的内容摘要' 
                : 'Click to generate short, medium, and long summaries'}
            </p>
            <div className="pt-2">
              <span className="text-xs text-gray-500">
                {language === 'zh' 
                  ? `内容长度: ${content?.length || 0} 字符` 
                  : `Content length: ${content?.length || 0} characters`}
              </span>
            </div>
          </div>
          <button
            onClick={fetchSummary}
            disabled={!content?.trim() || content.length < 100}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {language === 'zh' ? '生成摘要' : 'Generate Summary'}
          </button>
          {content && content.length < 100 && (
            <p className="text-xs text-red-500">
              {language === 'zh' 
                ? '至少需要 100 个字符才能生成摘要' 
                : 'At least 100 characters required'}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? 'AI 智能摘要' : 'AI Summary'}
          </h3>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-sm">
          {isCached && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'zh' ? '已缓存' : 'Cached'}</span>
            </div>
          )}
          {tokenCount > 0 && (
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{tokenCount} tokens</span>
            </div>
          )}
        </div>
      </div>

      {/* Length Selection */}
      {!loading && summaryData && (
        <div className="flex gap-2 mb-4">
          {lengthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedLength(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLength === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'zh' ? option.label : option.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="min-h-[120px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              <Sparkles className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-500">
              {language === 'zh' ? 'AI 正在生成摘要...' : 'Generating AI summary...'}
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {language === 'zh' ? '生成失败' : 'Generation Failed'}
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchSummary}
                className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
              >
                {language === 'zh' ? '重试' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && summaryData && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentSummary}
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {summaryData && !error && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {language === 'zh'
                ? `当前显示: ${lengthOptions.find((o) => o.value === selectedLength)?.label}`
                : `Current: ${lengthOptions.find((o) => o.value === selectedLength)?.labelEn}`}
            </span>
            <span>
              {language === 'zh'
                ? `${currentSummary.length} 字符`
                : `${currentSummary.length} characters`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

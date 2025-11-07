/**
 * KeywordClusterView Component
 * Displays AI-powered keyword clustering with relationships
 */

'use client';

import { useState, useEffect } from 'react';
import { Network, TrendingUp, Lightbulb, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { KeywordClusterViewProps, KeywordClusterResult } from './types';

export function KeywordClusterView({
  keywords,
  numClusters = 3,
  language = 'zh',
  onError,
}: KeywordClusterViewProps) {
  const [loading, setLoading] = useState(false);
  const [clusterData, setClusterData] = useState<KeywordClusterResult | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['clusters']));
  const [hasAnalyzed, setHasAnalyzed] = useState(false); // Track if analysis has been triggered

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

  const fetchClusters = async () => {
    if (!keywords || keywords.length < 3) {
      const errorMsg = language === 'zh' ? '至少需要3个关键词' : 'At least 3 keywords required';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    setHasAnalyzed(true); // Mark as analyzed

    try {
      const response = await fetch('/api/ai/keywords/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          num_clusters: numClusters,
          language
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cluster keywords');
      }

      setClusterData(result.data);
      // Auto-select first cluster
      if (result.data?.clusters?.length > 0) {
        setSelectedCluster(result.data.clusters[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Remove auto-fetch on mount - now requires manual trigger
  // useEffect(() => {
  //   fetchClusters();
  // }, [keywords, numClusters]);

  // Show initial state with analyze button
  if (!hasAnalyzed && !loading && !clusterData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
            <Network className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'zh' ? 'AI 关键词聚类分析' : 'AI Keyword Clustering'}
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              {language === 'zh' 
                ? '点击按钮使用 AI 进行语义聚类分析，识别关键词主题和关系' 
                : 'Click to perform AI-powered semantic clustering'}
            </p>
            <div className="pt-2">
              <span className="text-xs text-gray-500">
                {language === 'zh' 
                  ? `已提取 ${keywords?.length || 0} 个关键词` 
                  : `${keywords?.length || 0} keywords extracted`}
              </span>
            </div>
          </div>
          <button
            onClick={fetchClusters}
            disabled={!keywords || keywords.length < 3}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Network className="w-5 h-5" />
            {language === 'zh' ? '开始聚类分析' : 'Start Clustering'}
          </button>
          {keywords && keywords.length < 3 && (
            <p className="text-xs text-red-500">
              {language === 'zh' 
                ? '至少需要 3 个关键词才能进行聚类分析' 
                : 'At least 3 keywords required'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
            <Network className="w-5 h-5 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-gray-500">
            {language === 'zh' ? 'AI 正在分析关键词聚类...' : 'Analyzing keyword clusters...'}
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
              {language === 'zh' ? '聚类失败' : 'Clustering Failed'}
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchClusters}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
            >
              {language === 'zh' ? '重试' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!clusterData) return null;

  const selectedClusterData = clusterData.clusters.find((c) => c.id === selectedCluster);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === 'zh' ? '关键词聚类分析' : 'Keyword Cluster Analysis'}
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {clusterData.clusters.length} {language === 'zh' ? '个聚类' : 'clusters'}
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(clusterData.quality_metrics.silhouette_score * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '聚类质量' : 'Cluster Quality'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(clusterData.quality_metrics.avg_cluster_coherence * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '平均一致性' : 'Avg Coherence'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {(clusterData.quality_metrics.keyword_coverage * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {language === 'zh' ? '关键词覆盖' : 'Coverage'}
          </div>
        </div>
      </div>

      {/* Clusters Section */}
      <div>
        <button
          onClick={() => toggleSection('clusters')}
          className="flex items-center justify-between w-full py-2 text-left"
        >
          <h4 className="text-sm font-semibold text-gray-700">
            {language === 'zh' ? '关键词聚类' : 'Keyword Clusters'}
          </h4>
          {expandedSections.has('clusters') ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.has('clusters') && (
          <div className="mt-3 space-y-3">
            {clusterData.clusters.map((cluster) => {
              const isSelected = cluster.id === selectedCluster;
              return (
                <button
                  key={cluster.id}
                  onClick={() => setSelectedCluster(cluster.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{cluster.theme}</h5>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {cluster.keywords.length} {language === 'zh' ? '词' : 'words'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>
                        {language === 'zh' ? '搜索量' : 'Volume'}: {(cluster.total_volume ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      {language === 'zh' ? '难度' : 'Difficulty'}: {(cluster.avg_difficulty ?? 0).toFixed(1)}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">{cluster.recommended_content}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-white border border-purple-200 rounded"
                          >
                            {kw.keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Relationships Section */}
      {(clusterData.relationships?.length ?? 0) > 0 && (
        <div>
          <button
            onClick={() => toggleSection('relationships')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h4 className="text-sm font-semibold text-gray-700">
              {language === 'zh' ? '聚类关系' : 'Cluster Relationships'}
            </h4>
            {expandedSections.has('relationships') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has('relationships') && (
            <div className="mt-3 space-y-2">
              {clusterData.relationships?.map((rel, idx) => {
                const fromCluster = clusterData.clusters.find((c) => c.id === rel.from);
                const toCluster = clusterData.clusters.find((c) => c.id === rel.to);
                const relationshipLabels = {
                  complementary: language === 'zh' ? '互补' : 'Complementary',
                  competitive: language === 'zh' ? '竞争' : 'Competitive',
                  hierarchical: language === 'zh' ? '层级' : 'Hierarchical',
                };
                return (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{fromCluster?.theme}</span>
                    <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded">
                      {relationshipLabels[rel.relationship_type]}
                    </span>
                    <span className="text-sm text-gray-400">→</span>
                    <span className="text-sm text-gray-700">{toCluster?.theme}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {Math.round(rel.strength * 100)}% {language === 'zh' ? '强度' : 'strength'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Section */}
      {(clusterData.recommendations?.length ?? 0) > 0 && (
        <div>
          <button
            onClick={() => toggleSection('recommendations')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <h4 className="text-sm font-semibold text-gray-700">
                {language === 'zh' ? 'AI 建议' : 'AI Recommendations'}
              </h4>
            </div>
            {expandedSections.has('recommendations') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has('recommendations') && (
            <div className="mt-3 space-y-2">
              {clusterData.recommendations?.map((recommendation, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          {clusterData.cached
            ? language === 'zh'
              ? '已缓存结果'
              : 'Cached result'
            : language === 'zh'
            ? '实时分析'
            : 'Real-time analysis'}
        </span>
        <span>{clusterData.usage.total_tokens} tokens</span>
      </div>
    </div>
  );
}

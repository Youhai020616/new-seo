/**
 * AIUsageDashboard Component
 * Displays AI usage statistics, costs, and cache performance
 */

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  Database,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import type { AIUsageDashboardProps } from './types';

interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  cacheHitRate: number;
  services: {
    [key: string]: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
  budget: {
    limit: number;
    remaining: number;
    warningThreshold: number;
    isWarning: boolean;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  };
}

export function AIUsageDashboard({ refreshInterval = 30000 }: AIUsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/stats');
      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch AI stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh interval
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  if (loading && !stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Safe access with defaults - deep check for nested properties
  const totalCost = stats.totalCost ?? 0;
  const totalTokens = stats.totalTokens ?? 0;
  const totalRequests = stats.totalRequests ?? 0;
  const cacheHitRate = stats.cacheHitRate ?? 0;

  // Deep check for budget object
  const budgetData = stats.budget ?? {};
  const budget = {
    limit: budgetData.limit ?? 100,
    remaining: budgetData.remaining ?? 100,
    warningThreshold: budgetData.warningThreshold ?? 0.8,
    isWarning: budgetData.isWarning ?? false,
  };

  const services = stats.services ?? {};

  // Deep check for cache object
  const cacheData = stats.cache ?? {};
  const cache = {
    hits: cacheData.hits ?? 0,
    misses: cacheData.misses ?? 0,
    hitRate: cacheData.hitRate ?? 0,
    size: cacheData.size ?? 0,
    maxSize: cacheData.maxSize ?? 100,
  };

  const budgetPercentage = budget.limit > 0 ? ((budget.limit - budget.remaining) / budget.limit) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI 使用统计</h3>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* Last Refresh */}
      <div className="text-xs text-gray-500">
        最后更新: {lastRefresh.toLocaleString('zh-CN')}
      </div>

      {/* Budget Warning */}
      {budget.isWarning && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800">预算警告</p>
            <p className="text-sm text-orange-600 mt-1">
              已使用 {budgetPercentage.toFixed(1)}% 的预算，剩余 ${budget.remaining.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Requests */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">总请求数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
        </div>

        {/* Total Tokens */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">总 Token 数</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(totalTokens / 1000).toFixed(1)}K
          </div>
        </div>

        {/* Total Cost */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">总费用</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${totalCost.toFixed(4)}
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-600">缓存命中率</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(cacheHitRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">预算使用情况</span>
          <span className="text-sm text-gray-600">
            ${(budget.limit - budget.remaining).toFixed(4)} / ${budget.limit.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              budget.isWarning ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>剩余: ${budget.remaining.toFixed(4)}</span>
          <span>{budgetPercentage.toFixed(1)}% 已使用</span>
        </div>
      </div>

      {/* Service Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">服务使用详情</h4>
        <div className="space-y-2">
          {Object.entries(services).map(([service, data]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{service}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {data.requests} 次请求 · {(data.tokens / 1000).toFixed(1)}K tokens
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">${data.cost.toFixed(4)}</div>
                <div className="text-xs text-gray-500">
                  {totalCost > 0 ? ((data.cost / totalCost) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Statistics */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">缓存性能</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">缓存命中</div>
            <div className="text-xl font-bold text-green-600">{cache.hits}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">缓存未命中</div>
            <div className="text-xl font-bold text-red-600">{cache.misses}</div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">缓存使用率</span>
            <span className="text-sm font-medium text-gray-700">
              {cache.size} / {cache.maxSize}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${cache.maxSize > 0 ? (cache.size / cache.maxSize) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Cost Savings from Cache */}
      {cache.hits > 0 && cache.hitRate < 1 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">缓存节省费用</span>
          </div>
          <p className="text-sm text-green-700">
            通过缓存节省了约{' '}
            <span className="font-semibold">
              ${((totalCost * cache.hitRate) / (1 - cache.hitRate)).toFixed(4)}
            </span>
            ，相当于 {((cache.hitRate / (1 - cache.hitRate)) * 100).toFixed(1)}% 的成本优化
          </p>
        </div>
      )}
    </div>
  );
}

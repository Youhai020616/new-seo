'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIUsageDashboard } from '@/components/ai';
import { Sparkles, TrendingUp, Network, BarChart3, Heart } from 'lucide-react';

export default function AIPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-10 h-10 text-blue-500" />
          AI 功能中心
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          基于 DeepSeek AI 的智能分析功能，助力您的内容创作和SEO优化
        </p>
      </div>

      {/* Usage Dashboard */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 使用统计</h2>
        <AIUsageDashboard refreshInterval={30000} />
      </div>

      {/* Features Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🚀 AI 功能总览</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Summary Feature */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <CardTitle>智能摘要生成</CardTitle>
              </div>
              <CardDescription>
                自动生成三种长度的内容摘要
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">功能特点</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>短/中/长三种长度可选</li>
                  <li>智能提取核心要点</li>
                  <li>支持中英文内容</li>
                  <li>缓存优化，降低成本</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 在 SEO 页面中，输入内容后自动显示 AI 摘要
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Feature */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <CardTitle>情感分析</CardTitle>
              </div>
              <CardDescription>
                深度分析文本情感倾向和情绪
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">功能特点</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>正面/中性/负面分类</li>
                  <li>情感得分和置信度</li>
                  <li>检测多种情感类型</li>
                  <li>方面级情感分析</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 在新闻列表页面，每条新闻都显示情感分析徽章
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Keyword Cluster Feature */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-500" />
                <CardTitle>关键词聚类</CardTitle>
              </div>
              <CardDescription>
                AI 驱动的语义关键词分组
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">功能特点</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>智能语义聚类</li>
                  <li>主题识别和命名</li>
                  <li>聚类关系分析</li>
                  <li>内容策略建议</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 在关键词页面提取关键词后自动显示聚类分析
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trend Feature */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <CardTitle>趋势分析</CardTitle>
              </div>
              <CardDescription>
                识别热门话题和新兴趋势
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-1">功能特点</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>热门话题识别</li>
                  <li>新兴话题检测</li>
                  <li>趋势预测分析</li>
                  <li>风险警报提示</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 在新闻页面底部自动显示趋势分析图表
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cost Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💰 成本优化</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2">
          <p className="font-medium">DeepSeek AI 定价：</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>输入 Token: $0.14 / 百万 tokens</li>
            <li>输出 Token: $0.28 / 百万 tokens</li>
            <li>缓存命中率: 40-60% （节省成本）</li>
            <li>批量处理: 可节省33%执行时间</li>
          </ul>
          <div className="pt-3 border-t border-blue-300">
            <p className="text-sm">
              💡 系统自动缓存结果，避免重复调用API，显著降低使用成本
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📖 使用指南</CardTitle>
        </CardHeader>
        <CardContent className="text-green-800 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. 智能摘要</h4>
            <p className="text-sm">
              在 SEO 页面输入内容（至少100字符），系统会自动显示 AI 摘要卡片，可切换短/中/长三种长度。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">2. 情感分析</h4>
            <p className="text-sm">
              在新闻页面，每条新闻卡片都会显示情感徽章。点击徽章可展开查看详细的情感分析，包括情感得分、检测到的情感类型和关键词。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">3. 关键词聚类</h4>
            <p className="text-sm">
              在关键词页面提取关键词后（至少3个），系统会自动进行 AI 聚类分析，显示语义相关的关键词分组和内容建议。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">4. 趋势分析</h4>
            <p className="text-sm">
              在新闻页面加载新闻后（至少3条），页面底部会自动显示趋势分析图表，识别热门话题、新兴趋势和提供 AI 洞察。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KeywordCloud from '@/components/KeywordCloud';
import KeywordChart from '@/components/KeywordChart';
import Breadcrumb from '@/components/Breadcrumb';
import { useNewsStore } from '@/store/useNewsStore';
import { useI18n } from '@/lib/i18n/context';
import { KeywordClusterView } from '@/components/ai';
import TrendingKeywordsList from '@/components/keywords/TrendingKeywordsList';

type VisualizationType = 'list' | 'cloud' | 'chart';

export default function KeywordsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { selectedNews, analysisSource, setExtractedKeywords, setSelectedNews, setAnalysisSource } = useNewsStore();

  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualType, setVisualType] = useState<VisualizationType>('list');
  const [dataFromNews, setDataFromNews] = useState(false);

  const extractKeywords = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [inputText] }),
      });

      const data = await response.json();
      if (data.success) {
        setKeywords(data.keywords);
        // 保存到 store
        setExtractedKeywords(data.keywords);
      } else {
        setError(data.error || 'Failed to extract keywords');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setInputText('');
    setKeywords([]);
    setError(null);
    setDataFromNews(false);
    setSelectedNews(null);
  };

  const navigateToSEO = () => {
    if (keywords.length > 0) {
      setExtractedKeywords(keywords);
      setAnalysisSource('keywords');
      router.push('/seo');
    }
  };

  // 自动检测并填充来自 News 页面的数据
  useEffect(() => {
    if (selectedNews && analysisSource === 'news') {
      const newsText = `${selectedNews.title}\n\n${selectedNews.summary}`;
      setInputText(newsText);
      setDataFromNews(true);
      // 不再自动提取关键词，让用户手动点击"提取关键词"按钮
    }
  }, [selectedNews, analysisSource]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      {dataFromNews && selectedNews && (
        <Breadcrumb
          items={[
            { label: t.nav.news, href: '/' },
            { label: t.nav.keywords, active: true },
          ]}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t.keywords.title}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {t.keywords.subtitle}
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[500px]">
          <TabsTrigger value="trending" className="gap-2">
            <span>🔥</span>
            <span>{t.keywords.trendingTitle || '热点推荐'}</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <span>✍️</span>
            <span>{t.keywords.customAnalysis || '自定义分析'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Trending Keywords */}
        <TabsContent value="trending" className="mt-6">
          <TrendingKeywordsList region="all" limit={20} />
        </TabsContent>

        {/* Tab 2: Custom Analysis */}
        <TabsContent value="custom" className="mt-6 space-y-8">
          {/* Data Source Notification */}
          {dataFromNews && selectedNews && (
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">
                  📰 {t.keywords.analyzingNews}: {selectedNews.source}
                </p>
                <p className="text-sm text-blue-700 line-clamp-1">
                  {selectedNews.title}
                </p>
              </div>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {t.keywords.clear}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.keywords.textInput}</CardTitle>
          <CardDescription>
            {t.keywords.textInputDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={t.keywords.placeholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              onClick={extractKeywords}
              disabled={loading || !inputText.trim()}
              size="lg"
            >
              {loading ? t.keywords.analyzing : `🔍 ${t.keywords.extractKeywords}`}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              disabled={!inputText && keywords.length === 0}
            >
              {t.keywords.clearAll}
            </Button>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">❌ {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {keywords.length > 0 && (
        <>
          {/* Generate SEO Button */}
          <div className="flex justify-end">
            <Button
              onClick={navigateToSEO}
              size="lg"
              className="gap-2"
            >
              ✨ {t.keywords.generateSEO}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>{t.keywords.topKeywords}</CardTitle>
                  <CardDescription>
                    {keywords.length} {t.keywords.keywordsExtracted}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={visualType === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVisualType('list')}
                  >
                    📋 {t.keywords.list}
                  </Button>
                  <Button
                    variant={visualType === 'cloud' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVisualType('cloud')}
                  >
                    ☁️ {t.keywords.cloud}
                  </Button>
                  <Button
                    variant={visualType === 'chart' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setVisualType('chart')}
                  >
                    📊 {t.keywords.chart}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {visualType === 'list' && (
                <div className="flex flex-wrap gap-3">
                  {keywords.map((kw, idx) => (
                    <Badge
                      key={idx}
                      variant="default"
                      className="text-base py-2 px-4"
                    >
                      <span className="font-semibold">{kw.word}</span>
                      <span className="ml-3 text-sm opacity-75">
                        {t.keywords.score}: {kw.tfidf.toFixed(3)}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
              {visualType === 'cloud' && <KeywordCloud keywords={keywords} />}
              {visualType === 'chart' && <KeywordChart keywords={keywords} type="bar" />}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.keywords.detailedAnalysis}</CardTitle>
              <CardDescription>
                {t.keywords.keywordStats}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.keywords.rank}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.keywords.keyword}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.keywords.tfidfScore}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        {t.keywords.frequency}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {keywords.map((kw, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          #{idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {kw.word}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {kw.tfidf.toFixed(4)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {kw.frequency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* AI Keyword Clustering */}
          {keywords.length >= 3 && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                🤖 AI 关键词聚类分析
              </h3>
              <KeywordClusterView
                keywords={keywords.map(kw => ({ keyword: kw.word, volume: kw.frequency * 100 }))}
                numClusters={Math.min(3, Math.floor(keywords.length / 3))}
                language={dataFromNews && selectedNews?.region === 'singapore' ? 'en' : 'zh'}
              />
            </div>
          )}
        </>
      )}

      {/* Help Section */}
      {keywords.length === 0 && !loading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 {t.keywords.howToUse}</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>{t.keywords.step1}</li>
                <li>{t.keywords.step2}</li>
                <li>{t.keywords.step3}</li>
                <li>{t.keywords.step4}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
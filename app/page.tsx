'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsItem, Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import KeywordCloud from '@/components/KeywordCloud';
import KeywordChart from '@/components/KeywordChart';
import { useNewsStore } from '@/store/useNewsStore';
import { useI18n } from '@/lib/i18n/context';
import { SentimentBadge, TrendChart } from '@/components/ai';

type Region = 'all' | 'singapore' | 'shanghai' | 'hongkong';
type VisualizationType = 'list' | 'cloud' | 'chart';

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  
  // 使用 store 中的状态
  const {
    news,
    selectedRegion,
    loading,
    error,
    keywords,
    keywordsLoading,
    seoTitles,
    seoMeta,
    seoLoading,
    setNews,
    setSelectedRegion: setStoreRegion,
    setLoading,
    setError,
    setKeywords,
    setKeywordsLoading,
    setSeoTitles,
    setSeoMeta,
    setSeoLoading,
    setSelectedNews,
    setAnalysisSource,
  } = useNewsStore();

  const [displayCount, setDisplayCount] = useState(40); // 默认显示40篇
  const [visualType, setVisualType] = useState<VisualizationType>('list');

  // 组装 SEO 数据用于显示
  const seoData = seoTitles.length > 0 || seoMeta.length > 0 
    ? { titles: seoTitles, metaDescriptions: seoMeta }
    : null;

  // Fetch news
  const fetchNews = async (region: Region) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/news${region !== 'all' ? `?region=${region}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNews(data.news);
      } else {
        setError(data.error || 'Failed to fetch news');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract keywords
  const extractKeywords = async () => {
    if (news.length === 0) return;

    setKeywordsLoading(true);
    try {
      const titles = news.map(n => n.title);
      const summaries = news.map(n => n.summary);

      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles, summaries }),
      });

      const data = await response.json();
      if (data.success) {
        setKeywords(data.keywords);

        // Auto-generate SEO after keywords
        generateSEO(data.keywords, news[0]?.summary || '');
      }
    } catch (err) {
      console.error('Keywords error:', err);
    } finally {
      setKeywordsLoading(false);
    }
  };

  // Generate SEO
  const generateSEO = async (kw: Keyword[], summary: string) => {
    setSeoLoading(true);
    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kw, summary }),
      });

      const data = await response.json();
      if (data.success) {
        setSeoTitles(data.titles || []);
        setSeoMeta(data.metaDescriptions || []);
      }
    } catch (err) {
      console.error('SEO error:', err);
    } finally {
      setSeoLoading(false);
    }
  };

  // 清除关键词和SEO结果
  const clearResults = () => {
    setKeywords([]);
    setSeoTitles([]);
    setSeoMeta([]);
  };

  // 加载更多新闻
  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 20, news.length));
  };

  // 分析单篇新闻
  const analyzeNews = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setAnalysisSource('news');
    router.push('/keywords');
  };

  // 切换地区的处理函数
  const handleRegionChange = (region: Region) => {
    setStoreRegion(region);
    setDisplayCount(40);
    clearResults();
    // 切换地区时立即加载新闻
    fetchNews(region);
  };

  // 只在首次加载且新闻为空时才加载
  useEffect(() => {
    if (news.length === 0 && !loading) {
      fetchNews(selectedRegion);
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t.news.title}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {t.news.subtitle}
        </p>
      </div>

      {/* Region Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{t.news.selectRegion}</CardTitle>
          <CardDescription>{t.news.filterDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedRegion === 'all' ? 'default' : 'outline'}
              onClick={() => handleRegionChange('all')}
            >
              {t.news.allRegions}
            </Button>
            <Button
              variant={selectedRegion === 'singapore' ? 'default' : 'outline'}
              onClick={() => handleRegionChange('singapore')}
            >
              {t.news.singapore}
            </Button>
            <Button
              variant={selectedRegion === 'shanghai' ? 'default' : 'outline'}
              onClick={() => handleRegionChange('shanghai')}
            >
              {t.news.shanghai}
            </Button>
            <Button
              variant={selectedRegion === 'hongkong' ? 'default' : 'outline'}
              onClick={() => handleRegionChange('hongkong')}
            >
              {t.news.hongkong}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {news.length > 0 && (
        <div className="flex gap-3 flex-wrap items-center">
          <Button
            onClick={extractKeywords}
            disabled={keywordsLoading || keywords.length > 0}
            size="lg"
          >
            {keywordsLoading ? t.news.extracting : `🔍 ${t.news.extractKeywords}`}
          </Button>
          {keywords.length > 0 && (
            <>
              <Badge variant="success" className="text-sm py-2 px-3">
                ✓ {keywords.length} {t.news.keywordsFound}
              </Badge>
              <Button
                onClick={clearResults}
                variant="outline"
                size="lg"
              >
                🗑️ {t.news.clearResults}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">{t.news.loadingNews}</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Keywords Section */}
      {keywords.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.news.topKeywords}</CardTitle>
                <CardDescription>{t.news.keywordsDesc}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={visualType === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualType('list')}
                >
                  📋 {t.news.list}
                </Button>
                <Button
                  variant={visualType === 'cloud' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualType('cloud')}
                >
                  ☁️ {t.news.cloud}
                </Button>
                <Button
                  variant={visualType === 'chart' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVisualType('chart')}
                >
                  📊 {t.news.chart}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {visualType === 'list' && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <Badge key={idx} variant="default" className="text-sm py-1 px-3">
                    {kw.word}
                    <span className="ml-2 text-xs opacity-75">
                      ({kw.tfidf.toFixed(2)})
                    </span>
                  </Badge>
                ))}
              </div>
            )}
            {visualType === 'cloud' && <KeywordCloud keywords={keywords} />}
            {visualType === 'chart' && <KeywordChart keywords={keywords} type="bar" />}
          </CardContent>
        </Card>
      )}

      {/* SEO Suggestions */}
      {seoData && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.news.seoTitles}</CardTitle>
              <CardDescription>{t.news.seoTitlesDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData.titles.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{item.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={item.score >= 70 ? 'success' : 'warning'}>
                        {t.news.score}: {item.score}/100
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.news.metaDescriptions}</CardTitle>
              <CardDescription>{t.news.metaDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData.metaDescriptions.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={item.score >= 70 ? 'success' : 'warning'}>
                        {t.news.score}: {item.score}/100
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* News List */}
      {!loading && !error && news.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {t.news.latestNews} ({t.news.showing} {Math.min(displayCount, news.length)} {t.news.of} {news.length} {t.news.articles})
            </h2>
          </div>
          <div className="grid gap-4">
            {news.slice(0, displayCount).map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {item.title}
                        </a>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {item.summary}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => analyzeNews(item)}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      🔍 {t.news.analyze}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="secondary">{item.source}</Badge>
                    <Badge variant="default">{item.region}</Badge>
                    <SentimentBadge content={item.summary} language={selectedRegion === 'singapore' ? 'en' : 'zh'} showDetails={false} />
                    <span className="text-sm text-gray-500">
                      {formatDate(item.publishDate)}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < news.length && (
            <div className="mt-6 text-center">
              <Button
                onClick={loadMore}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                📰 {t.news.loadMore} ({news.length - displayCount} {t.news.remaining})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && news.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 text-lg">
              {t.news.noNews}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Trend Analysis */}
      {!loading && !error && news.length >= 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            📈 AI 趋势分析
          </h2>
          <TrendChart
            newsItems={news.slice(0, 50)}
            timeRange="week"
            language={selectedRegion === 'singapore' ? 'en' : 'zh'}
          />
        </div>
      )}
    </div>
  );
}

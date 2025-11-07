'use client';

import { useState, useEffect } from 'react';
import type { Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/Breadcrumb';
import { useNewsStore } from '@/store/useNewsStore';
import { useI18n } from '@/lib/i18n/context';

export default function SEOPage() {
  const { t } = useI18n();
  const { extractedKeywords, selectedNews, analysisSource, setExtractedKeywords } = useNewsStore();

  const [keywordInput, setKeywordInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFromKeywords, setDataFromKeywords] = useState(false);

  const generateSEO = async () => {
    if (!keywordInput.trim()) {
      setError('Please enter at least one keyword');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse keywords from comma-separated input
      const keywordList: Keyword[] = keywordInput
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .map((word, idx) => ({
          word,
          frequency: 1,
          tfidf: 10 - idx * 0.5, // Mock TF-IDF scores
        }));

      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywordList,
          summary: summaryInput || 'Generate SEO content based on keywords',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSeoData(data);
      } else {
        setError(data.error || 'Failed to generate SEO suggestions');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setKeywordInput('');
    setSummaryInput('');
    setSeoData(null);
    setError(null);
    setDataFromKeywords(false);
    setExtractedKeywords([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 自动检测并填充来自 Keywords 页面的数据
  useEffect(() => {
    if (extractedKeywords.length > 0 && analysisSource === 'keywords') {
      // 转换关键词为逗号分隔字符串
      const keywordsString = extractedKeywords.map(kw => kw.word).join(', ');
      setKeywordInput(keywordsString);
      setDataFromKeywords(true);

      // 如果有选中的新闻，使用其摘要
      if (selectedNews) {
        setSummaryInput(selectedNews.summary);
      }

      // 自动触发 SEO 生成
      setTimeout(() => {
        const autoGenerate = async () => {
          setLoading(true);
          setError(null);

          try {
            const response = await fetch('/api/seo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keywords: extractedKeywords,
                summary: selectedNews?.summary || 'Generate SEO content based on keywords',
              }),
            });

            const data = await response.json();
            if (data.success) {
              setSeoData(data);
            }
          } catch (err) {
            console.error('Auto-generate SEO error:', err);
          } finally {
            setLoading(false);
          }
        };
        autoGenerate();
      }, 100);
    }
  }, [extractedKeywords, analysisSource, selectedNews]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      {dataFromKeywords && extractedKeywords.length > 0 && (
        <Breadcrumb
          items={
            selectedNews
              ? [
                  { label: t.nav.news, href: '/' },
                  { label: t.nav.keywords, href: '/keywords' },
                  { label: t.nav.seo, active: true },
                ]
              : [
                  { label: t.nav.keywords, href: '/keywords' },
                  { label: t.nav.seo, active: true },
                ]
          }
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{t.seo.title}</h1>
        <p className="mt-2 text-lg text-gray-600">
          {t.seo.subtitle}
        </p>
      </div>

      {/* Data Source Notification */}
      {dataFromKeywords && extractedKeywords.length > 0 && (
        <Card className="bg-purple-50 border-purple-300">
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-purple-900 mb-1">
                  🔑 {t.seo.usingKeywords} {extractedKeywords.length} {t.seo.extractedKeywords}
                </p>
                <p className="text-sm text-purple-700">
                  {t.seo.keywordsLabel}: {extractedKeywords.slice(0, 5).map(kw => kw.word).join(', ')}
                  {extractedKeywords.length > 5 && '...'}
                </p>
              </div>
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {t.seo.clear}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.seo.seoInput}</CardTitle>
          <CardDescription>
            {t.seo.seoInputDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.seo.keywordsRequired}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t.seo.keywordsPlaceholder}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.seo.summaryLabel}
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={t.seo.summaryPlaceholder}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateSEO}
              disabled={loading || !keywordInput.trim()}
              size="lg"
            >
              {loading ? t.seo.generating : `✨ ${t.seo.generateSEO}`}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              disabled={!keywordInput && !summaryInput && !seoData}
            >
              {t.seo.clearAll}
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
      {seoData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* SEO Titles */}
          <Card>
            <CardHeader>
              <CardTitle>{t.seo.seoTitles}</CardTitle>
              <CardDescription>
                {t.seo.optimizedTitles}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData.titles.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 flex-1">
                        {item.title}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(item.title)}
                      >
                        📋 {t.seo.copy}
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
                      >
                        {t.seo.score}: {item.score}/100
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {t.seo.length}: {item.title.length} {t.seo.chars}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meta Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>{t.seo.metaDescriptions}</CardTitle>
              <CardDescription>
                {t.seo.optimizedDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoData.metaDescriptions.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-700 flex-1">
                        {item.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(item.description)}
                      >
                        📋 {t.seo.copy}
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
                      >
                        {t.seo.score}: {item.score}/100
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {t.seo.length}: {item.description.length} {t.seo.chars}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Best Practices */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📖 {t.seo.bestPractices}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-green-800">
            <div>
              <h4 className="font-semibold mb-2">{t.seo.titleOptimization}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t.seo.titleTip1}</li>
                <li>{t.seo.titleTip2}</li>
                <li>{t.seo.titleTip3}</li>
                <li>{t.seo.titleTip4}</li>
                <li>{t.seo.titleTip5}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t.seo.metaTips}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t.seo.metaTip1}</li>
                <li>{t.seo.metaTip2}</li>
                <li>{t.seo.metaTip3}</li>
                <li>{t.seo.metaTip4}</li>
                <li>{t.seo.metaTip5}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      {!seoData && !loading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 {t.seo.howToUse}</h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>{t.seo.step1}</li>
                <li>{t.seo.step2}</li>
                <li>{t.seo.step3}</li>
                <li>{t.seo.step4}</li>
                <li>{t.seo.step5}</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

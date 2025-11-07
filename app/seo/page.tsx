'use client';

import { useState, useEffect } from 'react';
import type { Keyword } from '@/types';
import { GlassCard, GlassButton, GlassBadge } from '@/components/ui/glass-card';
import { SEOBestPractices } from '@/components/ui/seo-best-practices';
import Breadcrumb from '@/components/Breadcrumb';
import { useNewsStore } from '@/store/useNewsStore';
import { useI18n } from '@/lib/i18n/context';
import { AISummaryCard } from '@/components/ai';
import { Sparkles, Copy, Trash2, AlertCircle } from 'lucide-react';

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

      // 不再自动生成 SEO，让用户手动点击"生成 SEO 建议"按钮
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
        <GlassCard className="bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="py-4 px-6">
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
              <GlassButton
                onClick={clearAll}
                variant="secondary"
                className="shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.seo.clear}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Input Section */}
      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.seo.seoInput}</h2>
          <p className="text-gray-600">{t.seo.seoInputDesc}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.seo.keywordsRequired}
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/40 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full h-32 px-4 py-3 bg-white/40 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              placeholder={t.seo.summaryPlaceholder}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <GlassButton
              onClick={generateSEO}
              disabled={loading || !keywordInput.trim()}
              variant="primary"
              className="px-6 py-3"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {loading ? t.seo.generating : t.seo.generateSEO}
            </GlassButton>
            <GlassButton
              onClick={clearAll}
              variant="secondary"
              className="px-6 py-3"
              disabled={!keywordInput && !summaryInput && !seoData}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {t.seo.clearAll}
            </GlassButton>
          </div>

          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Results Section */}
      {seoData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* SEO Titles */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.seo.seoTitles}</h2>
              <p className="text-gray-600">{t.seo.optimizedTitles}</p>
            </div>
            
            <div className="space-y-4">
              {seoData.titles.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/40 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 flex-1">
                      {item.title}
                    </p>
                    <GlassButton
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(item.title)}
                    >
                      <Copy className="w-4 h-4" />
                    </GlassButton>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <GlassBadge
                      variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'default'}
                    >
                      {t.seo.score}: {item.score}/100
                    </GlassBadge>
                    <span className="text-sm text-gray-500">
                      {t.seo.length}: {item.title.length} {t.seo.chars}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Meta Descriptions */}
          <GlassCard className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.seo.metaDescriptions}</h2>
              <p className="text-gray-600">{t.seo.optimizedDesc}</p>
            </div>
            
            <div className="space-y-4">
              {seoData.metaDescriptions.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/40 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 flex-1">
                      {item.description}
                    </p>
                    <GlassButton
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(item.description)}
                    >
                      <Copy className="w-4 h-4" />
                    </GlassButton>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <GlassBadge
                      variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'default'}
                    >
                      {t.seo.score}: {item.score}/100
                    </GlassBadge>
                    <span className="text-sm text-gray-500">
                      {t.seo.length}: {item.description.length} {t.seo.chars}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* AI Content Summary */}
      {summaryInput && (
        <div>
          <h3 className="text-xl font-bold mb-4">
            ✨ AI 内容摘要
          </h3>
          <AISummaryCard
            content={summaryInput}
            language={selectedNews?.region === 'singapore' ? 'en' : 'zh'}
            defaultLength="medium"
          />
        </div>
      )}

      {/* Best Practices */}
      <SEOBestPractices language={selectedNews?.region === 'singapore' ? 'en' : 'zh'} />

      {/* Help Section */}
      {!seoData && !loading && (
        <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900 text-lg flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                💡
              </div>
              {t.seo.howToUse}
            </h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-2 ml-4">
              <li className="pl-2">{t.seo.step1}</li>
              <li className="pl-2">{t.seo.step2}</li>
              <li className="pl-2">{t.seo.step3}</li>
              <li className="pl-2">{t.seo.step4}</li>
              <li className="pl-2">{t.seo.step5}</li>
            </ol>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

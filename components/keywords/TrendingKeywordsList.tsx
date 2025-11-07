'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Download, RefreshCw, Clock, Globe, FileText } from 'lucide-react';
import type { TrendingKeyword, TrendingKeywordsResponse } from '@/types';
import { exportToJSON, exportToCSV } from '@/lib/export/exporters';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  region?: string;
  limit?: number;
}

export default function TrendingKeywordsList({ region = 'all', limit = 20 }: Props) {
  const { t } = useI18n();
  const [data, setData] = useState<TrendingKeywordsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/keywords/trending?region=${region}&limit=${limit}`
      );
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch trending keywords');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingKeywords();
  }, [region]);

  const handleExportJSON = () => {
    if (data) {
      exportToJSON(data.keywords, data.metadata);
    }
  };

  const handleExportCSV = () => {
    if (data) {
      exportToCSV(data.keywords);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              {t.keywords.trendingTitle || '热点关键词推荐'}
            </CardTitle>
            <CardDescription>
              {t.keywords.trendingDesc || '基于最近24小时的新闻分析'}
              {data && ` • ${data.metadata.totalNews} ${t.news.articles || '篇新闻'}`}
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrendingKeywords}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t.keywords.refresh || '刷新'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              disabled={!data || loading}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data || loading}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin mb-3" />
            <p>{t.keywords.analyzing || '正在分析热点关键词...'}</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500">
            <p className="mb-2">❌ {error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrendingKeywords}
            >
              {t.keywords.retry || '重试'}
            </Button>
          </div>
        )}

        {data && !loading && data.keywords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>{t.keywords.noTrending || '暂无热点关键词数据'}</p>
          </div>
        )}

        {data && !loading && data.keywords.length > 0 && (
          <div className="space-y-3">
            {data.keywords.map((keyword) => (
              <div
                key={keyword.word}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Badge
                    variant={keyword.rank <= 3 ? 'default' : 'secondary'}
                    className="text-sm font-mono min-w-[2.5rem] justify-center"
                  >
                    #{keyword.rank}
                  </Badge>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg truncate">
                        {keyword.word}
                      </span>

                      <Badge
                        variant="warning"
                        className="font-mono"
                      >
                        {keyword.trendingScore.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {keyword.newsCount} {t.keywords.newsCount || '篇'}
                      </span>

                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" />
                        {keyword.regions.map(r => {
                          const regionName = t.news[r as keyof typeof t.news] || r;
                          return typeof regionName === 'string' ? regionName : r;
                        }).join(', ')}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {keyword.avgAge.toFixed(0)}h {t.keywords.ago || '前'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right hidden md:block">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    TF-IDF
                  </div>
                  <div className="text-sm font-mono">
                    {keyword.tfidf.toFixed(3)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {t.keywords.freq || '频率'}: {keyword.frequency}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

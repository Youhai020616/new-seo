'use client';

import { useEffect, useState } from 'react';
import type { NewsItem, Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

type Region = 'all' | 'singapore' | 'shanghai';

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keywords state
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  // SEO state
  const [seoData, setSeoData] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);

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
        setSeoData(data);
      }
    } catch (err) {
      console.error('SEO error:', err);
    } finally {
      setSeoLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews(selectedRegion);
  }, [selectedRegion]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">News SEO Assistant</h1>
        <p className="mt-2 text-lg text-gray-600">
          Aggregate news, extract keywords, and generate SEO suggestions
        </p>
      </div>

      {/* Region Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Select Region</CardTitle>
          <CardDescription>Filter news by geographic region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedRegion === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('all')}
            >
              All Regions
            </Button>
            <Button
              variant={selectedRegion === 'singapore' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('singapore')}
            >
              Singapore
            </Button>
            <Button
              variant={selectedRegion === 'shanghai' ? 'default' : 'outline'}
              onClick={() => setSelectedRegion('shanghai')}
            >
              Shanghai
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {news.length > 0 && (
        <div className="flex gap-3">
          <Button
            onClick={extractKeywords}
            disabled={keywordsLoading}
            size="lg"
          >
            {keywordsLoading ? 'Extracting...' : '🔍 Extract Keywords'}
          </Button>
          {keywords.length > 0 && (
            <Badge variant="success" className="text-sm py-2 px-3">
              ✓ {keywords.length} keywords found
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-600">Loading news...</p>
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
            <CardTitle>Top Keywords (TF-IDF)</CardTitle>
            <CardDescription>Most relevant keywords from news articles</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* SEO Suggestions */}
      {seoData && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Title Suggestions</CardTitle>
              <CardDescription>Optimized titles with quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData.titles.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{item.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={item.score >= 70 ? 'success' : 'warning'}>
                        Score: {item.score}/100
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Descriptions</CardTitle>
              <CardDescription>SEO-optimized descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seoData.metaDescriptions.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{item.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={item.score >= 70 ? 'success' : 'warning'}>
                        Score: {item.score}/100
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
          <h2 className="text-2xl font-bold mb-4">
            Latest News ({news.length} articles)
          </h2>
          <div className="grid gap-4">
            {news.slice(0, 10).map((item) => (
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
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="secondary">{item.source}</Badge>
                    <Badge variant="default">{item.region}</Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.publishDate)}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && news.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 text-lg">
              No news available. Try selecting a different region.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

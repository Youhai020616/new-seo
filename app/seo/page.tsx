'use client';

import { useState } from 'react';
import type { Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SEOPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">SEO Assistant</h1>
        <p className="mt-2 text-lg text-gray-600">
          Generate SEO-optimized titles and meta descriptions
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Input</CardTitle>
          <CardDescription>
            Enter keywords and optional summary for SEO generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated) *
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., technology, artificial intelligence, innovation, future"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary/Context (optional)
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter a brief summary or context to help generate more relevant SEO content..."
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
              {loading ? 'Generating...' : '✨ Generate SEO'}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              disabled={!keywordInput && !summaryInput && !seoData}
            >
              Clear All
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
              <CardTitle>SEO Title Suggestions</CardTitle>
              <CardDescription>
                Optimized titles (50-60 characters)
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
                        📋 Copy
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
                      >
                        Score: {item.score}/100
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Length: {item.title.length} chars
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
              <CardTitle>Meta Description Suggestions</CardTitle>
              <CardDescription>
                Optimized descriptions (150-160 characters)
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
                        📋 Copy
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
                      >
                        Score: {item.score}/100
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Length: {item.description.length} chars
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
          <CardTitle className="text-green-900">📖 SEO Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-green-800">
            <div>
              <h4 className="font-semibold mb-2">Title Optimization:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Keep titles between 50-60 characters</li>
                <li>Include primary keyword near the beginning</li>
                <li>Make it compelling and click-worthy</li>
                <li>Avoid keyword stuffing</li>
                <li>Use action words and numbers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Meta Description Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Aim for 150-160 characters</li>
                <li>Include target keywords naturally</li>
                <li>Write clear, compelling copy</li>
                <li>Add a call-to-action</li>
                <li>Make it unique for each page</li>
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
              <h3 className="font-semibold text-blue-900">💡 How to use:</h3>
              <ol className="list-decimal list-inside text-blue-800 space-y-1">
                <li>Enter your target keywords (separated by commas)</li>
                <li>Optionally add a summary or context</li>
                <li>Click "Generate SEO" to create optimized suggestions</li>
                <li>Review quality scores and copy the best options</li>
                <li>Use the suggestions for your web pages or blog posts</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

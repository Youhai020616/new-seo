'use client';

import { useState } from 'react';
import type { Keyword } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function KeywordsPage() {
  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Keyword Extractor</h1>
        <p className="mt-2 text-lg text-gray-600">
          Extract top keywords using TF-IDF algorithm
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
          <CardDescription>
            Enter your text content for keyword analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Paste your article, news content, or any text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              onClick={extractKeywords}
              disabled={loading || !inputText.trim()}
              size="lg"
            >
              {loading ? 'Analyzing...' : '🔍 Extract Keywords'}
            </Button>
            <Button
              onClick={clearAll}
              variant="outline"
              size="lg"
              disabled={!inputText && keywords.length === 0}
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
      {keywords.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Top Keywords (TF-IDF)</CardTitle>
              <CardDescription>
                {keywords.length} keywords extracted, sorted by relevance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {keywords.map((kw, idx) => (
                  <Badge
                    key={idx}
                    variant="default"
                    className="text-base py-2 px-4"
                  >
                    <span className="font-semibold">{kw.word}</span>
                    <span className="ml-3 text-sm opacity-75">
                      Score: {kw.tfidf.toFixed(3)}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>
                Keyword statistics and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Keyword
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        TF-IDF Score
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Frequency
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
        </>
      )}

      {/* Help Section */}
      {keywords.length === 0 && !loading && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">💡 How to use:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Paste your text content in the input area above</li>
                <li>Click "Extract Keywords" to analyze the text</li>
                <li>The algorithm will identify the top 10 most relevant keywords</li>
                <li>Results are sorted by TF-IDF score (higher = more relevant)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

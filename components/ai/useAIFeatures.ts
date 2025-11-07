/**
 * useAIFeatures Hook
 * Custom hook for managing AI features state and API calls
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  SummaryResult,
  SentimentResult,
  KeywordClusterResult,
  TrendAnalysisResult,
  Keyword,
} from './types';

export interface AIFeaturesState {
  summary: {
    data: SummaryResult | null;
    loading: boolean;
    error: string | null;
  };
  sentiment: {
    data: SentimentResult | null;
    loading: boolean;
    error: string | null;
  };
  keywordCluster: {
    data: KeywordClusterResult | null;
    loading: boolean;
    error: string | null;
  };
  trend: {
    data: TrendAnalysisResult | null;
    loading: boolean;
    error: string | null;
  };
}

export interface AIFeaturesActions {
  generateSummary: (content: string, language?: 'en' | 'zh') => Promise<void>;
  analyzeSentiment: (content: string, language?: 'en' | 'zh') => Promise<void>;
  clusterKeywords: (
    keywords: Keyword[],
    options?: { numClusters?: number; language?: 'en' | 'zh' }
  ) => Promise<void>;
  analyzeTrends: (
    newsItems: any[],
    options?: { timeRange?: 'day' | 'week' | 'month'; focusArea?: string; language?: 'en' | 'zh' }
  ) => Promise<void>;
  reset: () => void;
  resetFeature: (feature: keyof AIFeaturesState) => void;
}

const initialState: AIFeaturesState = {
  summary: { data: null, loading: false, error: null },
  sentiment: { data: null, loading: false, error: null },
  keywordCluster: { data: null, loading: false, error: null },
  trend: { data: null, loading: false, error: null },
};

/**
 * Custom hook for managing AI features
 * Provides state management and API calls for all AI features
 */
export function useAIFeatures(): AIFeaturesState & AIFeaturesActions {
  const [state, setState] = useState<AIFeaturesState>(initialState);

  // Generate AI Summary
  const generateSummary = useCallback(async (content: string, language: 'en' | 'zh' = 'zh') => {
    setState((prev) => ({
      ...prev,
      summary: { data: null, loading: true, error: null },
    }));

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate summary');
      }

      setState((prev) => ({
        ...prev,
        summary: { data: result.data, loading: false, error: null },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        summary: { data: null, loading: false, error: errorMessage },
      }));
      throw error;
    }
  }, []);

  // Analyze Sentiment
  const analyzeSentiment = useCallback(async (content: string, language: 'en' | 'zh' = 'zh') => {
    setState((prev) => ({
      ...prev,
      sentiment: { data: null, loading: true, error: null },
    }));

    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze sentiment');
      }

      setState((prev) => ({
        ...prev,
        sentiment: { data: result.data, loading: false, error: null },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        sentiment: { data: null, loading: false, error: errorMessage },
      }));
      throw error;
    }
  }, []);

  // Cluster Keywords
  const clusterKeywords = useCallback(
    async (
      keywords: Keyword[],
      options: { numClusters?: number; language?: 'en' | 'zh' } = {}
    ) => {
      setState((prev) => ({
        ...prev,
        keywordCluster: { data: null, loading: true, error: null },
      }));

      try {
        const response = await fetch('/api/ai/keywords/cluster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords,
            numClusters: options.numClusters || 3,
            language: options.language || 'zh',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to cluster keywords');
        }

        setState((prev) => ({
          ...prev,
          keywordCluster: { data: result.data, loading: false, error: null },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          keywordCluster: { data: null, loading: false, error: errorMessage },
        }));
        throw error;
      }
    },
    []
  );

  // Analyze Trends
  const analyzeTrends = useCallback(
    async (
      newsItems: any[],
      options: { timeRange?: 'day' | 'week' | 'month'; focusArea?: string; language?: 'en' | 'zh' } = {}
    ) => {
      setState((prev) => ({
        ...prev,
        trend: { data: null, loading: true, error: null },
      }));

      try {
        const response = await fetch('/api/ai/trend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newsItems,
            timeRange: options.timeRange || 'week',
            focusArea: options.focusArea,
            language: options.language || 'zh',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to analyze trends');
        }

        setState((prev) => ({
          ...prev,
          trend: { data: result.data, loading: false, error: null },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          trend: { data: null, loading: false, error: errorMessage },
        }));
        throw error;
      }
    },
    []
  );

  // Reset all features
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Reset specific feature
  const resetFeature = useCallback((feature: keyof AIFeaturesState) => {
    setState((prev) => ({
      ...prev,
      [feature]: { data: null, loading: false, error: null },
    }));
  }, []);

  return {
    ...state,
    generateSummary,
    analyzeSentiment,
    clusterKeywords,
    analyzeTrends,
    reset,
    resetFeature,
  };
}

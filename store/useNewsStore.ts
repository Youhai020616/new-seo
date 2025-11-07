import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NewsItem, Keyword, Region } from '@/types';

interface NewsStore {
  // 新闻数据
  news: NewsItem[];
  selectedRegion: Region;
  loading: boolean;
  error: string | null;

  // 关键词数据
  keywords: Keyword[];
  keywordsLoading: boolean;

  // SEO数据
  seoTitles: Array<{ title: string; score: number }>;
  seoMeta: Array<{ description: string; score: number }>;
  seoLoading: boolean;

  // 页面联动数据
  selectedNews: NewsItem | null;
  extractedKeywords: Keyword[];
  analysisSource: string; // 'news' | 'keywords' | 'direct'

  // Actions
  setNews: (news: NewsItem[]) => void;
  setSelectedRegion: (region: Region) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setKeywords: (keywords: Keyword[]) => void;
  setKeywordsLoading: (loading: boolean) => void;
  setSeoTitles: (titles: Array<{ title: string; score: number }>) => void;
  setSeoMeta: (meta: Array<{ description: string; score: number }>) => void;
  setSeoLoading: (loading: boolean) => void;
  setSelectedNews: (news: NewsItem | null) => void;
  setExtractedKeywords: (keywords: Keyword[]) => void;
  setAnalysisSource: (source: string) => void;
  clearAnalysis: () => void;
  reset: () => void;
}

export const useNewsStore = create<NewsStore>()(
  persist(
    (set) => ({
      // 初始状态
      news: [],
      selectedRegion: 'all',
      loading: false,
      error: null,
      keywords: [],
      keywordsLoading: false,
      seoTitles: [],
      seoMeta: [],
      seoLoading: false,
      selectedNews: null,
      extractedKeywords: [],
      analysisSource: 'direct',

      // Actions
      setNews: (news) => set({ news }),
      setSelectedRegion: (region) => set({ selectedRegion: region }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setKeywords: (keywords) => set({ keywords }),
      setKeywordsLoading: (loading) => set({ keywordsLoading: loading }),
      setSeoTitles: (titles) => set({ seoTitles: titles }),
      setSeoMeta: (meta) => set({ seoMeta: meta }),
      setSeoLoading: (loading) => set({ seoLoading: loading }),
      setSelectedNews: (news) => set({ selectedNews: news }),
      setExtractedKeywords: (keywords) => set({ extractedKeywords: keywords }),
      setAnalysisSource: (source) => set({ analysisSource: source }),
      clearAnalysis: () =>
        set({
          selectedNews: null,
          extractedKeywords: [],
          keywords: [],
          seoTitles: [],
          seoMeta: [],
        }),
      reset: () =>
        set({
          news: [],
          selectedRegion: 'all',
          loading: false,
          error: null,
          keywords: [],
          keywordsLoading: false,
          seoTitles: [],
          seoMeta: [],
          seoLoading: false,
          selectedNews: null,
          extractedKeywords: [],
          analysisSource: 'direct',
        }),
    }),
    {
      name: 'news-seo-storage',
      partialize: (state) => ({
        // 持久化新闻数据和所有分析结果
        news: state.news,
        selectedRegion: state.selectedRegion,
        keywords: state.keywords,
        seoTitles: state.seoTitles,
        seoMeta: state.seoMeta,
        selectedNews: state.selectedNews,
        extractedKeywords: state.extractedKeywords,
        analysisSource: state.analysisSource,
      }),
    }
  )
);

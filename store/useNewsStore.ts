import { create } from 'zustand';
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
  reset: () => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
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
    }),
}));

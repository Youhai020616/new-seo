import natural from 'natural';
import { getStopwords } from './stopwords';
import { detectLanguage } from './language-detector';
import type { Keyword } from '@/types';

/**
 * 关键词提取器类（使用TF-IDF算法）
 */
export class KeywordExtractor {
  private tfidf: natural.TfIdf;

  constructor() {
    this.tfidf = new natural.TfIdf();
  }

  /**
   * 提取英文关键词
   */
  private extractEnglish(texts: string[]): Keyword[] {
    const tokenizer = new natural.WordTokenizer();
    const stopwords = getStopwords('en');

    // 清空之前的文档
    this.tfidf = new natural.TfIdf();

    // 添加所有文档到TF-IDF
    texts.forEach(text => {
      const tokens = tokenizer
        .tokenize(text.toLowerCase())
        .filter(token =>
          token.length > 2 &&
          !stopwords.has(token) &&
          /^[a-z]+$/.test(token) // 只保留纯字母
        );

      this.tfidf.addDocument(tokens);
    });

    // 收集所有关键词及其TF-IDF分数
    const keywordMap = new Map<string, { freq: number; maxTfidf: number }>();

    this.tfidf.documents.forEach((doc, docIndex) => {
      const terms = this.tfidf.listTerms(docIndex);

      terms.forEach(term => {
        const current = keywordMap.get(term.term) || { freq: 0, maxTfidf: 0 };
        keywordMap.set(term.term, {
          freq: current.freq + 1,
          maxTfidf: Math.max(current.maxTfidf, term.tfidf),
        });
      });
    });

    // 转换为数组并排序
    return Array.from(keywordMap.entries())
      .map(([word, stats]) => ({
        word,
        frequency: stats.freq,
        tfidf: stats.maxTfidf,
      }))
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, 10);
  }

  /**
   * 提取中文关键词（简化实现）
   * 注意：完整的中文支持需要 node-jieba 分词库
   */
  private extractChinese(texts: string[]): Keyword[] {
    // 简化的中文处理：使用字符级别统计
    const stopwords = getStopwords('zh');
    const wordFreq = new Map<string, number>();

    texts.forEach(text => {
      // 简单按字符分割（实际应用应使用专业分词工具）
      const words = text.match(/[\u4e00-\u9fa5]+/g) || [];

      words.forEach(word => {
        if (word.length > 1 && !stopwords.has(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      });
    });

    // 转换为关键词数组
    return Array.from(wordFreq.entries())
      .map(([word, freq]) => ({
        word,
        frequency: freq,
        tfidf: freq / texts.length, // 简化的TF-IDF
      }))
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, 10);
  }

  /**
   * 自动检测语言并提取关键词
   */
  extract(texts: string[]): Keyword[] {
    if (!texts || texts.length === 0) {
      return [];
    }

    // 合并所有文本用于语言检测
    const combinedText = texts.join(' ');
    const language = detectLanguage(combinedText);

    // 根据语言选择提取方法
    if (language === 'zh') {
      return this.extractChinese(texts);
    }

    return this.extractEnglish(texts);
  }

  /**
   * 从新闻标题中提取关键词
   */
  extractFromTitles(titles: string[]): Keyword[] {
    return this.extract(titles);
  }

  /**
   * 从新闻摘要中提取关键词
   */
  extractFromSummaries(summaries: string[]): Keyword[] {
    return this.extract(summaries);
  }

  /**
   * 从标题和摘要中提取关键词
   */
  extractFromTitlesAndSummaries(titles: string[], summaries: string[]): Keyword[] {
    const combinedTexts = [...titles, ...summaries];
    return this.extract(combinedTexts);
  }
}

/**
 * 便捷函数：直接提取关键词
 */
export function extractKeywords(texts: string[]): Keyword[] {
  const extractor = new KeywordExtractor();
  return extractor.extract(texts);
}

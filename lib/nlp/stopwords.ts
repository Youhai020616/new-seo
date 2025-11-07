import type { Language } from '@/types';

/**
 * 英文停用词库
 */
const ENGLISH_STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are',
  'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do',
  'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'can', 'and', 'or', 'but', 'if', 'then', 'else',
  'when', 'where', 'how', 'what', 'who', 'whom', 'this',
  'that', 'these', 'those', 'to', 'of', 'in', 'for', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under',
  'again', 'further', 'once', 'here', 'there', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'out', 'off', 'over', 'also', 'back', 'even', 'well', 'down',
  'because', 'being', 'get', 'make', 'go', 'know', 'take', 'see',
  'come', 'think', 'look', 'want', 'give', 'use', 'find', 'tell',
  'ask', 'work', 'seem', 'feel', 'try', 'leave', 'call', 'us',
  'said', 'says', 'now', 'new', 'get', 'two', 'one', 'first',
]);

/**
 * 中文停用词库
 */
const CHINESE_STOPWORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人',
  '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去',
  '你', '会', '着', '没有', '看', '好', '自己', '这', '我们',
  '他', '她', '它', '们', '地', '得', '个', '为', '之', '来',
  '以', '时', '可以', '这个', '那个', '能', '对', '但', '因为',
  '所以', '如果', '还', '从', '把', '被', '让', '给', '用', '由',
]);

/**
 * 获取指定语言的停用词集合
 */
export function getStopwords(language: Language): Set<string> {
  return language === 'zh' ? CHINESE_STOPWORDS : ENGLISH_STOPWORDS;
}

/**
 * 检查单词是否为停用词
 */
export function isStopword(word: string, language: Language): boolean {
  const stopwords = getStopwords(language);
  return stopwords.has(word.toLowerCase());
}

/**
 * 过滤停用词
 */
export function filterStopwords(words: string[], language: Language): string[] {
  const stopwords = getStopwords(language);
  return words.filter(word => !stopwords.has(word.toLowerCase()));
}

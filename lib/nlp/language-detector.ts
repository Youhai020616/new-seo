import type { Language } from '@/types';

/**
 * 检测文本语言（基于Unicode范围）
 */
export function detectLanguage(text: string): Language {
  if (!text) return 'en';

  // 检测中文字符（CJK Unicode范围）
  const chineseRegex = /[\u4e00-\u9fa5]/;

  // 如果包含中文字符，判定为中文
  if (chineseRegex.test(text)) {
    return 'zh';
  }

  // 默认英文
  return 'en';
}

/**
 * 检测文本是否包含中文
 */
export function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 检测文本是否为纯英文
 */
export function isEnglish(text: string): boolean {
  return /^[a-zA-Z\s\d\W]+$/.test(text);
}

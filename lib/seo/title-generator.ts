import type { Keyword } from '@/types';
import { capitalize, truncate } from '@/lib/utils';

/**
 * 动作词库
 */
const ACTION_WORDS = [
  'Surge', 'Soar', 'Rise', 'Grow', 'Fall', 'Drop', 'Plunge',
  'Announce', 'Launch', 'Unveil', 'Reveal', 'Report', 'Show',
  'Hit', 'Reach', 'Break', 'Set', 'Achieve', 'Deliver',
];

/**
 * 强化词库
 */
const POWER_WORDS = [
  'Latest', 'Breaking', 'Exclusive', 'Top', 'Key', 'Major',
  'Critical', 'Essential', 'Important', 'Significant', 'Historic',
  'Unprecedented', 'Record', 'Massive', 'Stunning',
];

/**
 * 数字和百分比
 */
const NUMBERS = ['10%', '20%', '50%', '100', '2025', 'Q1', 'Q2'];

/**
 * 生成SEO标题建议
 */
export function generateSEOTitle(
  keywords: Keyword[],
  context?: string
): string[] {
  const suggestions: string[] = [];

  if (!keywords || keywords.length === 0) {
    return ['No Keywords Available for Title Generation'];
  }

  const topKeywords = keywords.slice(0, 3).map(k => k.word);
  const primaryKeyword = capitalize(topKeywords[0]);
  const secondaryKeyword = topKeywords[1] ? capitalize(topKeywords[1]) : '';

  // 模板1: [Power Word] + [Keyword] + [Action]
  const template1 = `${POWER_WORDS[0]} ${primaryKeyword} ${ACTION_WORDS[0]}s ${NUMBERS[0]} in ${NUMBERS[4]}`;
  suggestions.push(truncate(template1, 60));

  // 模板2: [Keyword] + [Action] + [Number]
  if (topKeywords.length >= 1) {
    const template2 = `${primaryKeyword} ${ACTION_WORDS[1]}s ${NUMBERS[1]}: ${POWER_WORDS[2]} Analysis`;
    suggestions.push(truncate(template2, 60));
  }

  // 模板3: [Keyword 1] and [Keyword 2]: [Context]
  if (topKeywords.length >= 2 && secondaryKeyword) {
    const template3 = `${primaryKeyword} and ${secondaryKeyword}: What You Need to Know`;
    suggestions.push(truncate(template3, 60));
  }

  // 模板4: How [Keyword] is [Action]ing [Context]
  const template4 = `How ${primaryKeyword} is ${ACTION_WORDS[3]}ing the Industry`;
  suggestions.push(truncate(template4, 60));

  // 模板5: [Number] [Power Word] [Keyword] Trends in [Year]
  const template5 = `${NUMBERS[5]} ${POWER_WORDS[5]} ${primaryKeyword} Trends in ${NUMBERS[4]}`;
  suggestions.push(truncate(template5, 60));

  return suggestions.slice(0, 3); // 返回前3个建议
}

/**
 * 评估SEO标题质量
 */
export function scoreSEOTitle(title: string, keywords: Keyword[]): number {
  let score = 0;

  // 长度检查（50-60字符最佳）
  if (title.length >= 50 && title.length <= 60) {
    score += 30;
  } else if (title.length >= 40 && title.length < 70) {
    score += 20;
  } else {
    score += 10;
  }

  // 关键词包含
  const titleLower = title.toLowerCase();
  keywords.slice(0, 3).forEach(keyword => {
    if (titleLower.includes(keyword.word.toLowerCase())) {
      score += 25;
    }
  });

  // 包含数字
  if (/\d/.test(title)) {
    score += 10;
  }

  // 包含强化词
  const hasPowerWord = POWER_WORDS.some(word =>
    titleLower.includes(word.toLowerCase())
  );
  if (hasPowerWord) {
    score += 10;
  }

  return Math.min(score, 100);
}

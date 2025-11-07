import type { Keyword } from '@/types';
import { truncate } from '@/lib/utils';

/**
 * 行动号召（CTA）短语
 */
const CTA_PHRASES = [
  'Learn more',
  'Read more',
  'Discover insights',
  'Explore now',
  'Find out more',
  'Stay updated',
  'Get the latest',
];

/**
 * 生成Meta描述建议
 */
export function generateMetaDescription(
  summary: string,
  keywords: Keyword[]
): string[] {
  const suggestions: string[] = [];

  if (!summary) {
    return ['No summary available for meta description generation'];
  }

  // 获取Top 3关键词
  const topKeywords = keywords.slice(0, 3).map(k => k.word);

  // 模板1: 摘要 + 关键词 + CTA
  const baseSummary = truncate(summary, 100).trim();
  const template1 = `${baseSummary} Key topics: ${topKeywords.join(', ')}. ${CTA_PHRASES[0]}.`;
  suggestions.push(truncate(template1, 160));

  // 模板2: 关键词开头 + 摘要
  if (topKeywords.length > 0) {
    const template2 = `Discover insights on ${topKeywords[0]}. ${baseSummary} ${CTA_PHRASES[2]}.`;
    suggestions.push(truncate(template2, 160));
  }

  // 模板3: 问题式
  if (topKeywords.length > 0) {
    const template3 = `What's happening with ${topKeywords[0]}? ${truncate(summary, 90)} ${CTA_PHRASES[4]} here.`;
    suggestions.push(truncate(template3, 160));
  }

  // 模板4: 关键词列表 + 简短摘要
  if (topKeywords.length >= 2) {
    const shortSummary = truncate(summary, 80);
    const template4 = `${topKeywords[0]}, ${topKeywords[1]}, and more. ${shortSummary} ${CTA_PHRASES[5]}.`;
    suggestions.push(truncate(template4, 160));
  }

  return suggestions.slice(0, 3); // 返回前3个建议
}

/**
 * 评估Meta描述质量
 */
export function scoreMetaDescription(description: string, keywords: Keyword[]): number {
  let score = 0;

  // 长度检查（150-160字符最佳）
  if (description.length >= 150 && description.length <= 160) {
    score += 30;
  } else if (description.length >= 120 && description.length < 170) {
    score += 20;
  } else {
    score += 10;
  }

  // 关键词包含
  const descLower = description.toLowerCase();
  keywords.slice(0, 3).forEach(keyword => {
    if (descLower.includes(keyword.word.toLowerCase())) {
      score += 20;
    }
  });

  // 包含CTA
  const hasCTA = CTA_PHRASES.some(cta =>
    descLower.includes(cta.toLowerCase())
  );
  if (hasCTA) {
    score += 15;
  }

  // 可读性（包含完整句子）
  if (description.includes('.') || description.includes('!')) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * 生成完整的SEO Meta标签
 */
export function generateMetaTags(
  title: string,
  description: string,
  keywords: Keyword[]
): {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
} {
  const keywordString = keywords.map(k => k.word).join(', ');

  return {
    title,
    description,
    keywords: keywordString,
    ogTitle: title, // Open Graph
    ogDescription: description,
    twitterTitle: title, // Twitter Card
    twitterDescription: description,
  };
}

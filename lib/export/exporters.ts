import type { TrendingKeyword } from '@/types';

/**
 * 导出为JSON格式
 */
export function exportToJSON(
  keywords: TrendingKeyword[],
  metadata?: any,
  filename?: string
): void {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    dataType: 'trending-keywords',
    metadata: metadata || {},
    trendingKeywords: keywords
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `trending-keywords-${formatDateForFilename()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出为CSV格式
 */
export function exportToCSV(
  keywords: TrendingKeyword[],
  filename?: string
): void {
  // CSV Header
  const headers = [
    '排名',
    '关键词',
    '热度评分',
    '出现频率',
    'TF-IDF分数',
    '新闻数量',
    '地区',
    '新闻源',
    '首次出现',
    '最后出现',
    '平均年龄(小时)'
  ];

  // CSV Rows
  const rows = keywords.map(kw => [
    kw.rank,
    escapeCSV(kw.word),
    kw.trendingScore.toFixed(2),
    kw.frequency,
    kw.tfidf.toFixed(4),
    kw.newsCount,
    escapeCSV(kw.regions.join(', ')),
    escapeCSV(kw.sources.slice(0, 3).join(', ')),  // 限制最多3个源
    formatDateTime(kw.firstSeen),
    formatDateTime(kw.lastSeen),
    kw.avgAge.toFixed(1)
  ]);

  // 组合CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // 添加UTF-8 BOM以支持Excel正确显示中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `trending-keywords-${formatDateForFilename()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * CSV字段转义
 * 处理包含逗号、引号、换行符的字段
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 格式化日期为文件名
 * 格式: YYYY-MM-DD
 */
function formatDateForFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间
 * 格式: YYYY-MM-DD HH:MM
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    return isoString;
  }
}

/**
 * 导出关键词的关联新闻为JSON
 */
export function exportRelatedNews(
  keyword: TrendingKeyword,
  filename?: string
): void {
  const data = {
    exportDate: new Date().toISOString(),
    keyword: keyword.word,
    trendingScore: keyword.trendingScore,
    newsCount: keyword.newsCount,
    relatedNews: keyword.relatedNews
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${keyword.word}-related-news-${formatDateForFilename()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

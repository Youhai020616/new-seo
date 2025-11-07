/**
 * 简单的 token 估算器，用于成本预估或日志（估算值，非精确）
 * 这个实现使用粗略的字符/4 来估计 token 数（英语近似，中文差异较小）
 */
export function estimateTokensFromText(text: string): number {
  if (!text) return 0;
  // 非精确：平均每 4 个字符约 1 token（英语）；中文可能更紧凑
  const chars = text.length;
  return Math.max(1, Math.round(chars / 4));
}

export function estimateTokensForPrompt(prompt: string, userContent?: string) {
  const base = estimateTokensFromText(prompt);
  const user = estimateTokensFromText(userContent || '');
  return base + user;
}

export const META_DESCRIPTION_PROMPT = `你是一位SEO优化专家。

任务: 基于以下关键词和文章内容，生成3个高质量的Meta描述。

要求:
1. 严格在150-160字符范围内（尽量接近155字符）
2. 自然植入Top 3关键词
3. 包含明确的行动号召（CTA），如"Learn more","Read more","Discover"等
4. 简洁描述文章价值，避免堆砌关键词
5. 输出必须为有效的 JSON（见输出格式）

输入:
关键词: {keywords}
文章内容: {content}

输出格式（JSON）:
{
  "descriptions": [
    {
      "text": "描述文本",
      "keywords_count": 3,
      "has_cta": true,
      "tone": "informative|urgent|neutral"
    }
  ]
}
`;

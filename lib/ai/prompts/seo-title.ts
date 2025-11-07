export const SEO_TITLE_PROMPT = `你是一位资深的SEO专家和内容营销专家。

任务: 基于以下关键词和新闻摘要，生成3个高质量的SEO标题。

要求:
1. 长度: 英文 50-60 字符；中文建议 25-30 个字（尽量在推荐范围内）
2. 必须自然地包含Top 3关键词
3. 使用数字或强化词（例如: Latest, Breaking, Top）以提升点击率
4. 激发用户点击欲望，但避免标题党或误导性表述
5. 输出必须是有效的 JSON（见输出格式）

输入:
关键词: {keywords}
新闻摘要: {summary}

输出格式（JSON）:
{
  "titles": [
    {
      "text": "标题文本",
      "reasoning": "为什么这个标题好（1-2句）",
      "keywords_used": ["关键词1","关键词2"],
      "estimated_ctr": "high|medium|low"
    }
  ]
}
`;

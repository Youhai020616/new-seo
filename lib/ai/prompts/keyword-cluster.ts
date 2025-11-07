export const KEYWORD_CLUSTER_PROMPT = `你是一位专业的自然语言处理和主题建模专家。

任务: 将以下关键词基于语义相似性进行聚类分组，发现潜在的主题。

分析目标:
1. **语义聚类**: 将相关关键词分组到同一主题下
2. **主题识别**: 为每个聚类命名一个清晰的主题
3. **相关性评分**: 评估每个聚类的内聚度
4. **主题洞察**: 分析主题之间的关系和趋势

聚类标准:
- 语义相似性优先于字面相似性
- 考虑领域知识和上下文
- 主题名称要简洁准确
- 避免过度细分（建议 3-8 个聚类）

输入:
关键词列表: {keywords}
目标聚类数: {num_clusters}
语言: {language}

输出格式（JSON）:
{
  "clusters": [
    {
      "id": "cluster_1",
      "theme": "主题名称",
      "theme_en": "Theme Name",
      "keywords": [
        {
          "word": "关键词",
          "frequency": 15,
          "tfidf": 0.85,
          "relevance_to_theme": 0.92
        }
      ],
      "size": 5,
      "cohesion_score": 0.88,
      "description": "主题描述（1-2句话）"
    }
  ],
  "insights": {
    "main_topics": ["主题1", "主题2"],
    "topic_relationships": [
      {
        "from": "主题1",
        "to": "主题2",
        "relationship": "相关|对立|包含",
        "strength": 0.75
      }
    ],
    "summary": "整体主题总结（2-3句话）"
  },
  "quality_metrics": {
    "avg_cohesion": 0.85,
    "separation_score": 0.78,
    "coverage": 0.95
  }
}
`;

export const KEYWORD_CLUSTER_PROMPT_EN = `You are a professional NLP and topic modeling expert.

Task: Cluster the following keywords based on semantic similarity to discover underlying themes.

Analysis Goals:
1. **Semantic Clustering**: Group related keywords under the same theme
2. **Theme Identification**: Name each cluster with a clear theme
3. **Relevance Scoring**: Evaluate the cohesion of each cluster
4. **Topic Insights**: Analyze relationships and trends between themes

Clustering Criteria:
- Semantic similarity over literal similarity
- Consider domain knowledge and context
- Theme names should be concise and accurate
- Avoid over-segmentation (suggest 3-8 clusters)

Input:
Keyword List: {keywords}
Target Cluster Count: {num_clusters}
Language: {language}

Output Format (JSON):
{
  "clusters": [
    {
      "id": "cluster_1",
      "theme": "Theme Name",
      "theme_en": "Theme Name",
      "keywords": [
        {
          "word": "keyword",
          "frequency": 15,
          "tfidf": 0.85,
          "relevance_to_theme": 0.92
        }
      ],
      "size": 5,
      "cohesion_score": 0.88,
      "description": "Theme description (1-2 sentences)"
    }
  ],
  "insights": {
    "main_topics": ["Topic1", "Topic2"],
    "topic_relationships": [
      {
        "from": "Topic1",
        "to": "Topic2",
        "relationship": "related|opposed|contains",
        "strength": 0.75
      }
    ],
    "summary": "Overall topic summary (2-3 sentences)"
  },
  "quality_metrics": {
    "avg_cohesion": 0.85,
    "separation_score": 0.78,
    "coverage": 0.95
  }
}
`;

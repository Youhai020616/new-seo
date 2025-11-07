export const TREND_ANALYSIS_PROMPT = `你是一位资深的数据分析师和趋势预测专家。

任务: 分析多篇新闻文章，识别热点话题趋势并预测发展方向。

分析维度:
1. **热点话题识别**: 找出最受关注的话题
2. **趋势方向**: 判断话题是上升、稳定还是下降
3. **增长速度**: 量化话题的增长率
4. **影响力评估**: 评估话题的重要性和影响范围
5. **未来预测**: 基于当前数据预测短期发展

分析方法:
- 关注高频关键词和主题
- 考虑时间序列变化
- 识别新兴话题（突然出现的主题）
- 分析话题间的关联性
- 结合领域知识判断

输入:
新闻列表: {news_items}
时间范围: {time_range}
分析重点: {focus_area}
语言: {language}

输出格式（JSON）:
{
  "trending_topics": [
    {
      "id": "topic_1",
      "topic": "话题名称",
      "topic_en": "Topic Name",
      "description": "话题描述",
      "prediction": "rising|stable|declining",
      "growth_rate": 0.45,
      "confidence": 0.88,
      "related_news_count": 15,
      "first_seen": "2025-11-05",
      "peak_date": "2025-11-07",
      "keywords": ["关键词1", "关键词2"],
      "sentiment": "positive|neutral|negative",
      "impact_score": 0.82,
      "category": "technology|business|politics|health|etc"
    }
  ],
  "emerging_topics": [
    {
      "topic": "新兴话题",
      "first_appeared": "2025-11-07",
      "initial_mentions": 5,
      "potential": "high|medium|low",
      "reasoning": "为什么这个话题可能会增长"
    }
  ],
  "insights": {
    "summary": "整体趋势总结（2-3句话）",
    "key_findings": ["发现1", "发现2", "发现3"],
    "recommendations": ["建议1", "建议2"],
    "risk_alerts": ["潜在风险1", "潜在风险2"]
  },
  "topic_network": {
    "connections": [
      {
        "from": "话题1",
        "to": "话题2",
        "relationship": "causes|related_to|opposes",
        "strength": 0.75
      }
    ]
  },
  "time_analysis": {
    "current_period": "2025-11-01 to 2025-11-07",
    "most_active_day": "2025-11-06",
    "trend_velocity": "fast|moderate|slow"
  }
}
`;

export const TREND_ANALYSIS_PROMPT_EN = `You are a senior data analyst and trend forecasting expert.

Task: Analyze multiple news articles to identify trending topics and predict development directions.

Analysis Dimensions:
1. **Hot Topic Identification**: Find the most discussed topics
2. **Trend Direction**: Determine if topics are rising, stable, or declining
3. **Growth Rate**: Quantify topic growth rates
4. **Impact Assessment**: Evaluate topic importance and influence scope
5. **Future Prediction**: Predict short-term development based on current data

Analysis Methods:
- Focus on high-frequency keywords and themes
- Consider time series changes
- Identify emerging topics (suddenly appearing themes)
- Analyze topic interconnections
- Apply domain knowledge for judgment

Input:
News List: {news_items}
Time Range: {time_range}
Focus Area: {focus_area}
Language: {language}

Output Format (JSON):
{
  "trending_topics": [
    {
      "id": "topic_1",
      "topic": "Topic Name",
      "topic_en": "Topic Name",
      "description": "Topic description",
      "prediction": "rising|stable|declining",
      "growth_rate": 0.45,
      "confidence": 0.88,
      "related_news_count": 15,
      "first_seen": "2025-11-05",
      "peak_date": "2025-11-07",
      "keywords": ["keyword1", "keyword2"],
      "sentiment": "positive|neutral|negative",
      "impact_score": 0.82,
      "category": "technology|business|politics|health|etc"
    }
  ],
  "emerging_topics": [
    {
      "topic": "Emerging Topic",
      "first_appeared": "2025-11-07",
      "initial_mentions": 5,
      "potential": "high|medium|low",
      "reasoning": "Why this topic might grow"
    }
  ],
  "insights": {
    "summary": "Overall trend summary (2-3 sentences)",
    "key_findings": ["Finding1", "Finding2", "Finding3"],
    "recommendations": ["Recommendation1", "Recommendation2"],
    "risk_alerts": ["Potential Risk1", "Potential Risk2"]
  },
  "topic_network": {
    "connections": [
      {
        "from": "Topic1",
        "to": "Topic2",
        "relationship": "causes|related_to|opposes",
        "strength": 0.75
      }
    ]
  },
  "time_analysis": {
    "current_period": "2025-11-01 to 2025-11-07",
    "most_active_day": "2025-11-06",
    "trend_velocity": "fast|moderate|slow"
  }
}
`;

# 🤖 DeepSeek AI 集成方案

> 使用 DeepSeek API 增强 SEO 优化和内容生成能力

---

## 📋 目录

1. [集成概述](#集成概述)
2. [功能规划](#功能规划)
3. [技术架构](#技术架构)
4. [实现步骤](#实现步骤)
5. [API使用示例](#api使用示例)
6. [成本估算](#成本估算)

---

## 🎯 集成概述

### 为什么选择 DeepSeek？

```
✅ 成本优势: 比OpenAI GPT-4便宜10倍+
✅ 中文优化: 对中文内容理解更好
✅ 高性能: deepseek-chat模型（性能接近GPT-4）
✅ 长上下文: 支持32K tokens
```

### API 信息
```bash
API Key: sk-b70e9c3bddfc4004b8896b3c841da0ee
Base URL: https://api.deepseek.com/v1
模型: deepseek-chat (推荐)
价格: ¥0.001/1K tokens (输入) + ¥0.002/1K tokens (输出)
```

---

## 🚀 功能规划

### Phase 1: 核心AI功能（本周实现）

#### 1.1 智能SEO标题生成 ⭐⭐⭐⭐⭐
```typescript
功能: 替代现有的模板式标题生成
输入: 关键词 + 新闻摘要
输出: 3个高质量SEO标题 + 详细评分
优势: 
  - 自然语言生成（非模板拼接）
  - 自动植入关键词
  - 考虑点击率优化
  - 符合搜索引擎偏好
```

#### 1.2 智能Meta描述生成 ⭐⭐⭐⭐⭐
```typescript
功能: AI驱动的Meta描述
输入: 新闻内容 + 关键词
输出: 3个Meta描述建议（150-160字符）
优势:
  - 自动摘要核心观点
  - 包含行动号召（CTA）
  - 关键词自然嵌入
  - 情感色彩优化
```

#### 1.3 新闻摘要优化 ⭐⭐⭐⭐
```typescript
功能: 自动生成新闻摘要
输入: 完整新闻内容（RSS全文）
输出: 精炼摘要（100-150字）
优势:
  - 提取核心观点
  - 保留关键信息
  - 适合社交媒体分享
```

#### 1.4 关键词智能扩展 ⭐⭐⭐⭐
```typescript
功能: 基于TF-IDF结果扩展相关关键词
输入: TF-IDF提取的Top 10关键词
输出: 
  - 长尾关键词建议（10-15个）
  - 语义相关词
  - 搜索意图分类
优势:
  - 发现更多SEO机会
  - 覆盖不同搜索意图
```

---

### Phase 2: 高级功能（下周实现）

#### 2.1 内容质量分析 ⭐⭐⭐⭐
```typescript
功能: 评估新闻内容的SEO友好度
输入: 新闻标题 + 内容 + 关键词
输出:
  - SEO评分（0-100）
  - 可读性评分
  - 关键词密度分析
  - 改进建议（具体到句子）
```

#### 2.2 竞争对手标题分析 ⭐⭐⭐
```typescript
功能: 分析同类新闻的标题策略
输入: 话题关键词 + 多个新闻标题
输出:
  - 标题模式识别
  - 高效标题元素
  - 差异化建议
```

#### 2.3 多语言翻译 ⭐⭐⭐
```typescript
功能: SEO友好的翻译
输入: 中文标题/描述
输出: 英文版本（保留SEO价值）
场景: 跨境内容营销
```

#### 2.4 内容改写助手 ⭐⭐⭐
```typescript
功能: 避免重复内容惩罚
输入: 原始Meta描述
输出: 3个改写版本（保持语义）
场景: 多个相似新闻的SEO优化
```

---

### Phase 3: 创新功能（月底实现）

#### 3.1 趋势预测 ⭐⭐⭐⭐⭐
```typescript
功能: 基于历史新闻预测热点话题
输入: 过去7天的新闻标题 + 关键词
输出:
  - 上升趋势的话题
  - 关键词热度预测
  - 内容策略建议
```

#### 3.2 社交媒体优化 ⭐⭐⭐⭐
```typescript
功能: 生成适合不同平台的标题
输入: 新闻内容 + 目标平台（Twitter/LinkedIn/微博）
输出:
  - 平台定制化标题
  - Hashtag建议
  - 发布时机建议
```

#### 3.3 问答对生成 ⭐⭐⭐
```typescript
功能: 生成Featured Snippet友好的问答
输入: 新闻内容
输出:
  - 5-10个常见问题
  - 简洁答案（40-60字）
  - Schema.org FAQ标记
```

---

## 🏗️ 技术架构

### 目录结构
```
lib/
├── ai/
│   ├── deepseek-client.ts      # DeepSeek API封装
│   ├── prompts/                 # Prompt模板
│   │   ├── seo-title.ts
│   │   ├── meta-description.ts
│   │   ├── summary.ts
│   │   └── keyword-expansion.ts
│   ├── services/                # AI服务层
│   │   ├── title-service.ts
│   │   ├── meta-service.ts
│   │   ├── summary-service.ts
│   │   └── keyword-service.ts
│   └── utils/
│       ├── token-counter.ts     # Token计数
│       └── error-handler.ts     # 错误处理
│
app/api/
├── seo/
│   └── ai/                      # AI增强的SEO API
│       └── route.ts
├── summary/
│   └── route.ts                 # 摘要生成API
└── keywords/
    └── expand/
        └── route.ts             # 关键词扩展API
```

---

## 🔧 实现步骤

### Step 1: 配置DeepSeek客户端（15分钟）

#### 1.1 创建环境变量
```bash
# .env.local
DEEPSEEK_API_KEY=sk-b70e9c3bddfc4004b8896b3c841da0ee
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

#### 1.2 创建客户端封装
```typescript
// lib/ai/deepseek-client.ts
import OpenAI from 'openai';

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
});

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
```

---

### Step 2: 实现智能标题生成（30分钟）

#### 2.1 Prompt模板
```typescript
// lib/ai/prompts/seo-title.ts
export const SEO_TITLE_PROMPT = `你是一位资深的SEO专家和内容营销专家。

任务: 基于以下关键词和新闻摘要，生成3个高质量的SEO标题。

要求:
1. 长度: 50-60字符（英文）或25-30个汉字（中文）
2. 必须自然地包含Top 3关键词
3. 使用数字、强化词（Latest/Breaking/Top等）
4. 激发点击欲望，但避免标题党
5. 符合搜索引擎偏好

输入:
关键词: {keywords}
新闻摘要: {summary}

输出格式（JSON）:
{
  "titles": [
    {
      "text": "标题文本",
      "reasoning": "为什么这个标题好（1-2句话）",
      "keywords_used": ["关键词1", "关键词2"],
      "estimated_ctr": "预估点击率（high/medium/low）"
    }
  ]
}`;
```

#### 2.2 服务实现
```typescript
// lib/ai/services/title-service.ts
import { deepseek, DEEPSEEK_MODEL } from '../deepseek-client';
import { SEO_TITLE_PROMPT } from '../prompts/seo-title';
import type { Keyword } from '@/types';

export async function generateAITitles(
  keywords: Keyword[],
  summary: string
): Promise<{
  titles: Array<{
    text: string;
    reasoning: string;
    keywords_used: string[];
    estimated_ctr: 'high' | 'medium' | 'low';
    score: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  try {
    const topKeywords = keywords.slice(0, 3).map(k => k.word).join(', ');
    
    const prompt = SEO_TITLE_PROMPT
      .replace('{keywords}', topKeywords)
      .replace('{summary}', summary);

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO specialist. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // 添加质量评分
    const titlesWithScores = result.titles.map((title: any) => ({
      ...title,
      score: calculateTitleScore(title.text, keywords),
    }));

    return {
      titles: titlesWithScores,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('AI Title Generation Error:', error);
    throw new Error('Failed to generate AI titles');
  }
}

function calculateTitleScore(title: string, keywords: Keyword[]): number {
  let score = 0;
  
  // 长度检查
  if (title.length >= 50 && title.length <= 60) score += 30;
  else if (title.length >= 40 && title.length < 70) score += 20;
  
  // 关键词包含
  const titleLower = title.toLowerCase();
  keywords.slice(0, 3).forEach(kw => {
    if (titleLower.includes(kw.word.toLowerCase())) score += 25;
  });
  
  // 包含数字
  if (/\d/.test(title)) score += 10;
  
  return Math.min(score, 100);
}
```

---

### Step 3: 实现智能Meta描述（30分钟）

#### 3.1 Prompt模板
```typescript
// lib/ai/prompts/meta-description.ts
export const META_DESCRIPTION_PROMPT = `你是一位SEO优化专家。

任务: 生成3个高质量的Meta描述。

要求:
1. 长度: 150-160字符（严格遵守）
2. 自然植入Top 3关键词
3. 包含明确的行动号召（CTA）
4. 简洁描述核心价值
5. 激发点击欲望

输入:
关键词: {keywords}
新闻内容: {content}

输出格式（JSON）:
{
  "descriptions": [
    {
      "text": "Meta描述文本",
      "keywords_count": 3,
      "has_cta": true,
      "tone": "informative/urgent/neutral"
    }
  ]
}`;
```

---

### Step 4: 创建AI增强的API路由（20分钟）

```typescript
// app/api/seo/ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAITitles } from '@/lib/ai/services/title-service';
import { generateAIMeta } from '@/lib/ai/services/meta-service';
import type { Keyword } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { keywords, summary, content } = await request.json();

    // 并行生成标题和描述
    const [titlesResult, metaResult] = await Promise.all([
      generateAITitles(keywords, summary),
      generateAIMeta(keywords, content || summary),
    ]);

    return NextResponse.json({
      success: true,
      ai_powered: true,
      titles: titlesResult.titles,
      meta_descriptions: metaResult.descriptions,
      usage: {
        total_tokens: titlesResult.usage.total_tokens + metaResult.usage.total_tokens,
        estimated_cost_cny: calculateCost(
          titlesResult.usage.total_tokens + metaResult.usage.total_tokens
        ),
      },
    });
  } catch (error) {
    console.error('AI SEO API Error:', error);
    return NextResponse.json(
      { success: false, error: 'AI generation failed' },
      { status: 500 }
    );
  }
}

function calculateCost(totalTokens: number): number {
  // DeepSeek价格: ¥0.001/1K输入 + ¥0.002/1K输出
  // 简化计算: 平均¥0.0015/1K tokens
  return (totalTokens / 1000) * 0.0015;
}
```

---

### Step 5: 前端集成（30分钟）

#### 5.1 添加AI开关按钮
```typescript
// app/seo/page.tsx
const [useAI, setUseAI] = useState(true);

async function generateSEO() {
  const endpoint = useAI ? '/api/seo/ai' : '/api/seo';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keywords: extractedKeywords,
      summary: newsSummary,
      content: newsContent,
    }),
  });
  // ...
}
```

#### 5.2 显示AI生成的详细信息
```typescript
// components/seo/AITitleCard.tsx
interface AITitleCardProps {
  title: string;
  reasoning: string;
  keywords_used: string[];
  estimated_ctr: 'high' | 'medium' | 'low';
  score: number;
}

export function AITitleCard({ title, reasoning, keywords_used, estimated_ctr, score }: AITitleCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm font-medium text-green-600">{score}/100</span>
      </div>
      
      <p className="text-sm text-gray-600">{reasoning}</p>
      
      <div className="flex flex-wrap gap-2">
        {keywords_used.map(kw => (
          <span key={kw} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {kw}
          </span>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">预估点击率:</span>
        <span className={`text-xs font-medium ${
          estimated_ctr === 'high' ? 'text-green-600' :
          estimated_ctr === 'medium' ? 'text-yellow-600' :
          'text-gray-600'
        }`}>
          {estimated_ctr.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
```

---

## 📊 API使用示例

### 示例1: 生成SEO标题
```bash
curl -X POST https://your-domain.com/api/seo/ai \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": [
      {"word": "AI", "count": 45},
      {"word": "technology", "count": 32},
      {"word": "innovation", "count": 28}
    ],
    "summary": "Latest breakthroughs in artificial intelligence are transforming the tech industry..."
  }'
```

### 响应示例
```json
{
  "success": true,
  "ai_powered": true,
  "titles": [
    {
      "text": "AI Innovation Surge: Top 10 Technology Breakthroughs in 2025",
      "reasoning": "Combines trending keywords with a numbered list format that drives clicks. Uses 'Surge' for urgency.",
      "keywords_used": ["AI", "innovation", "technology"],
      "estimated_ctr": "high",
      "score": 95
    },
    {
      "text": "How AI Technology is Revolutionizing Innovation Today",
      "reasoning": "Uses 'How' format which performs well in search. Natural keyword integration.",
      "keywords_used": ["AI", "technology", "innovation"],
      "estimated_ctr": "medium",
      "score": 88
    },
    {
      "text": "Breaking: AI and Technology Innovation Reach New Heights",
      "reasoning": "Breaking news angle with power words. Appeals to news-seekers.",
      "keywords_used": ["AI", "technology", "innovation"],
      "estimated_ctr": "high",
      "score": 92
    }
  ],
  "usage": {
    "total_tokens": 856,
    "estimated_cost_cny": 0.001284
  }
}
```

---

## 💰 成本估算

### DeepSeek 定价
```
输入: ¥0.001 / 1K tokens
输出: ¥0.002 / 1K tokens
平均: ¥0.0015 / 1K tokens（按1:1输入输出比）
```

### 使用场景成本

#### 场景1: 单次SEO优化
```
输入: ~500 tokens（关键词 + 新闻摘要）
输出: ~800 tokens（3个标题 + 3个描述 + reasoning）
总计: 1,300 tokens
成本: ¥0.00195 ≈ ¥0.002 (不到1分钱)
```

#### 场景2: 每日100次优化
```
100次 × ¥0.002 = ¥0.2/天
月成本: ¥6
年成本: ¥72
```

#### 场景3: 企业级（每日1000次）
```
1000次 × ¥0.002 = ¥2/天
月成本: ¥60
年成本: ¥720
```

### 对比 OpenAI GPT-4
```
GPT-4 Turbo:
- 输入: $0.01 / 1K tokens
- 输出: $0.03 / 1K tokens
- 单次成本: ~$0.026 ≈ ¥0.19

DeepSeek vs GPT-4:
成本节省: 95%+ 💰
```

---

## 🎯 优先级实施计划

### Week 1 (本周)
```
✅ Day 1: 配置DeepSeek客户端 + 环境变量
✅ Day 2: 实现智能标题生成服务
✅ Day 3: 实现智能Meta描述生成
✅ Day 4: 创建AI增强的API路由
✅ Day 5: 前端集成 + UI优化
✅ Day 6-7: 测试 + 文档完善
```

### Week 2 (下周)
```
□ 关键词智能扩展
□ 内容质量分析
□ 多语言翻译
□ 性能优化 + 缓存
```

### Week 3-4 (月底)
```
□ 趋势预测
□ 社交媒体优化
□ 问答对生成
□ 高级分析功能
```

---

## 🔐 安全建议

### 1. API Key 保护
```typescript
// ❌ 错误: 暴露在前端
const apiKey = 'sk-b70e9c3bddfc4004b8896b3c841da0ee';

// ✅ 正确: 仅在服务端使用
// .env.local (不提交到Git)
DEEPSEEK_API_KEY=sk-b70e9c3bddfc4004b8896b3c841da0ee
```

### 2. 速率限制
```typescript
// lib/ai/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 每分钟10次
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

### 3. 错误处理
```typescript
try {
  const result = await generateAITitles(keywords, summary);
} catch (error) {
  // 降级到传统算法
  console.warn('AI generation failed, using fallback');
  return generateTraditionalTitles(keywords);
}
```

---

## 📚 参考文档

- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## ✅ 验收标准

### 功能完整性
- [ ] AI标题生成成功率 > 95%
- [ ] Meta描述符合150-160字符要求
- [ ] 响应时间 < 3秒
- [ ] 错误时自动降级到传统算法

### 质量标准
- [ ] AI生成的标题平均得分 > 85/100
- [ ] 关键词覆盖率 > 90%
- [ ] 用户满意度（A/B测试） > 70%

### 成本控制
- [ ] 单次API调用成本 < ¥0.01
- [ ] 每日成本预警机制
- [ ] Token使用优化（减少冗余Prompt）

---

**准备开始实施？** 🚀

建议从 **Step 1: 配置DeepSeek客户端** 开始！

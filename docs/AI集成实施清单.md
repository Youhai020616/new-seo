# 🚀 DeepSeek AI 集成 - 快速实施清单

> API Key: `sk-b70e9c3bddfc4004b8896b3c841da0ee`

---

## ✅ 实施步骤（预计2小时完成）

### 第一阶段: 基础配置（15分钟）

- [ ] **Step 1.1**: 创建环境变量文件
  ```bash
  echo "DEEPSEEK_API_KEY=sk-b70e9c3bddfc4004b8896b3c841da0ee" >> .env.local
  echo "DEEPSEEK_BASE_URL=https://api.deepseek.com/v1" >> .env.local
  echo "DEEPSEEK_MODEL=deepseek-chat" >> .env.local
  ```

- [ ] **Step 1.2**: 创建 AI 目录结构
  ```bash
  mkdir -p lib/ai/{prompts,services,utils}
  ```

- [ ] **Step 1.3**: 验证 OpenAI 包已安装
  ```bash
  # 已安装: openai@6.8.1
  ```

---

### 第二阶段: 核心服务实现（45分钟）

- [ ] **Step 2.1**: 创建 DeepSeek 客户端封装
  - 文件: `lib/ai/deepseek-client.ts`
  - 功能: 统一的 API 调用接口

- [ ] **Step 2.2**: 实现 SEO 标题生成
  - Prompt: `lib/ai/prompts/seo-title.ts`
  - Service: `lib/ai/services/title-service.ts`
  - 输出: 3个AI生成的标题 + 评分 + 推理

- [ ] **Step 2.3**: 实现 Meta 描述生成
  - Prompt: `lib/ai/prompts/meta-description.ts`
  - Service: `lib/ai/services/meta-service.ts`
  - 输出: 3个Meta描述（150-160字符）

- [ ] **Step 2.4**: 添加 Token 计数工具
  - 文件: `lib/ai/utils/token-counter.ts`
  - 功能: 成本预估和监控

---

### 第三阶段: API 路由（30分钟）

- [ ] **Step 3.1**: 创建 AI 增强的 SEO API
  - 文件: `app/api/seo/ai/route.ts`
  - 功能: 并行生成标题和Meta描述
  - 响应: 包含使用量和成本估算

- [ ] **Step 3.2**: 添加降级逻辑
  - AI 失败时自动回退到传统算法
  - 错误日志记录

---

### 第四阶段: 前端集成（30分钟）

- [ ] **Step 4.1**: 添加 AI 开关按钮
  - 位置: SEO 页面
  - 功能: 切换 AI/传统模式

- [ ] **Step 4.2**: 创建 AI 结果展示组件
  - 组件: `components/seo/AITitleCard.tsx`
  - 显示: 标题 + 推理 + 关键词 + CTR预估

- [ ] **Step 4.3**: 添加成本显示
  - 显示: Token使用量 + 成本（人民币）

---

## 📋 文件清单

### 需要创建的文件（9个）

```
lib/ai/
├── deepseek-client.ts           ← 客户端封装
├── prompts/
│   ├── seo-title.ts            ← 标题生成Prompt
│   └── meta-description.ts     ← Meta描述Prompt
├── services/
│   ├── title-service.ts        ← 标题生成服务
│   └── meta-service.ts         ← Meta描述服务
└── utils/
    └── token-counter.ts        ← Token计数工具

app/api/seo/ai/
└── route.ts                     ← AI增强的API路由

components/seo/
└── AITitleCard.tsx              ← AI结果展示组件
```

---

## 🧪 测试检查点

### 基础测试
- [ ] DeepSeek API 连接成功
- [ ] 生成3个标题（中文 + 英文）
- [ ] 生成3个Meta描述
- [ ] Token使用量正确统计
- [ ] 成本计算准确

### 质量测试
- [ ] 标题长度在50-60字符
- [ ] Meta描述在150-160字符
- [ ] 关键词自然嵌入
- [ ] 包含行动号召（CTA）
- [ ] 响应时间 < 3秒

### 错误处理
- [ ] API Key 无效时的降级
- [ ] 网络超时处理
- [ ] 速率限制处理
- [ ] 前端错误提示

---

## 💡 快速开始命令

### 1. 配置环境变量
```bash
cat > .env.local << 'EOF'
DEEPSEEK_API_KEY=sk-b70e9c3bddfc4004b8896b3c841da0ee
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
EOF
```

### 2. 创建目录结构
```bash
mkdir -p lib/ai/{prompts,services,utils}
mkdir -p app/api/seo/ai
mkdir -p components/seo
```

### 3. 测试 API 连接
```bash
# 创建简单测试脚本
node -e "
const OpenAI = require('openai');
const client = new OpenAI({
  apiKey: 'sk-b70e9c3bddfc4004b8896b3c841da0ee',
  baseURL: 'https://api.deepseek.com/v1'
});

client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Hello!' }]
}).then(r => console.log('✅ DeepSeek API 连接成功!', r.choices[0].message.content))
  .catch(e => console.error('❌ 连接失败:', e.message));
"
```

---

## 📊 预期效果

### AI 生成示例

#### 输入
```json
{
  "keywords": [
    {"word": "AI", "count": 45},
    {"word": "technology", "count": 32},
    {"word": "innovation", "count": 28}
  ],
  "summary": "Latest breakthroughs in AI technology are transforming industries..."
}
```

#### 输出（AI标题）
```json
{
  "titles": [
    {
      "text": "AI Technology Surge: Top 10 Innovation Breakthroughs in 2025",
      "reasoning": "数字化标题（Top 10）提升点击率，结合所有关键词，使用'Surge'增加紧迫感",
      "keywords_used": ["AI", "technology", "innovation"],
      "estimated_ctr": "high",
      "score": 95
    }
  ]
}
```

### 成本预估
```
单次请求:
- Tokens: ~1,300
- 成本: ¥0.002 (不到1分钱)

日均100次:
- 成本: ¥0.2/天
- 月成本: ¥6
```

---

## 🎯 优先级功能

### P0 - 本周必须完成
- ✅ AI标题生成
- ✅ AI Meta描述生成
- ✅ 前端集成

### P1 - 下周完成
- ⏳ 关键词扩展
- ⏳ 内容摘要
- ⏳ 多语言翻译

### P2 - 月底完成
- ⏳ 趋势预测
- ⏳ 社交媒体优化
- ⏳ 内容质量分析

---

## 🔗 相关文档

- 详细方案: `docs/AI集成方案.md`
- 竞品分析: `docs/竞品分析报告.md`
- API文档: https://platform.deepseek.com/api-docs/

---

## ⚡ 现在开始！

建议执行顺序:
1. ✅ 配置环境变量（1分钟）
2. ✅ 测试API连接（2分钟）
3. 🚀 创建DeepSeek客户端（10分钟）
4. 🚀 实现标题生成服务（20分钟）
5. 🚀 创建API路由（15分钟）
6. 🚀 前端集成（20分钟）
7. ✅ 测试验证（10分钟）

**总用时: 约1.5小时** ⏱️

准备好了吗？让我们从第一步开始！🎯

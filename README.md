# 📰 News SEO Assistant

> 本地热点新闻聚合与SEO关键词助手

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)

一个智能的新闻聚合和SEO优化工具，自动从多个RSS源收集新闻，提取关键词，并生成SEO优化建议。

---

## 🎯 核心功能

### ✅ 已实现功能

- **📡 新闻聚合**: 自动抓取多个RSS源（BBC News, TechCrunch等），支持地区筛选
- **🔍 关键词提取**: TF-IDF算法实现，英文/中文停用词过滤，Top 10关键词提取
- **✍️ SEO助手**: 自动生成3个SEO标题和Meta描述建议，含质量评分系统（0-100分）
- **🎨 用户界面**: 响应式设计，实时交互，关键词可视化展示

---

## 🛠️ 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Node.js
- **NLP**: natural.js (TF-IDF算法)
- **RSS**: rss-parser

---

## 📁 项目架构

\`\`\`
news-seo-assistant/
├── app/
│   ├── api/              # API Routes
│   │   ├── news/         # 新闻聚合API
│   │   ├── keywords/     # 关键词提取API
│   │   └── seo/          # SEO生成API
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 主页
├── lib/
│   ├── rss/              # RSS解析
│   ├── nlp/              # NLP处理（TF-IDF）
│   └── seo/              # SEO生成
├── components/ui/        # UI组件
├── types/                # TypeScript类型
└── config/               # 配置文件
\`\`\`

---

## 🚀 快速开始

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

### 访问应用
打开浏览器访问: **http://localhost:3000**

### 生产构建
\`\`\`bash
npm run build
npm start
\`\`\`

---

## 💻 使用指南

1. **浏览新闻**: 打开首页自动加载最新新闻，使用地区筛选器切换
2. **提取关键词**: 点击"🔍 Extract Keywords"按钮，使用TF-IDF算法提取Top 10关键词
3. **生成SEO建议**: 自动生成SEO标题和Meta描述建议（含质量评分）

---

## 🔌 API文档

### 1. 获取新闻
\`\`\`http
GET /api/news?region=singapore
\`\`\`

### 2. 提取关键词
\`\`\`http
POST /api/keywords
Body: { "texts": ["text1", "text2"] }
\`\`\`

### 3. 生成SEO建议
\`\`\`http
POST /api/seo
Body: { "keywords": [...], "summary": "..." }
\`\`\`

---

## 🏗️ 系统架构

\`\`\`
用户界面 (React)
    ↓
API Routes (Next.js)
    ↓
业务逻辑层
├── RSS Parser (并行抓取)
├── TF-IDF算法 (关键词提取)
└── SEO生成器 (标题+描述)
\`\`\`

---

## 🧪 技术特点

### TF-IDF算法
- **公式**: TF-IDF = TF × log(N / DF)
- **优点**: 自动识别重要关键词，过滤常见词

### RSS聚合策略
- 多源并行抓取（Promise.allSettled）
- 容错处理（10秒超时）
- 自动排序（按发布时间）

### SEO优化
- 标题长度: 50-60字符
- Meta描述: 150-160字符
- 自然植入Top 3关键词

---

## 📊 性能指标

| 指标 | 实际值 |
|------|--------|
| RSS聚合时间 | ~3秒 |
| 关键词提取 | ~0.5秒 |
| SEO生成 | ~200ms |
| 首屏加载 | ~1.5秒 |

---

## 📝 开发时间记录

| 阶段 | 用时 |
|------|------|
| 项目搭建 | 15分钟 |
| RSS聚合 | 30分钟 |
| 关键词提取 | 40分钟 |
| SEO助手 | 30分钟 |
| UI实现 | 45分钟 |
| 文档编写 | 20分钟 |
| **总计** | **~3小时** |

---

## 🔮 未来优化

- [ ] 词云图可视化
- [ ] JSON/CSV导出
- [ ] OpenAI API集成
- [ ] 社交媒体分享

---

## 📄 License

MIT © 2025

---

**Built with ❤️ using Next.js & Natural NLP**

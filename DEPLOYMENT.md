# 🚀 Vercel 部署指南

本文档详细说明如何将 News SEO Assistant 项目部署到 Vercel。

## 📋 部署前准备

### 1. 环境要求
- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器
- Git 仓库（已推送到 GitHub）
- Vercel 账号
- DeepSeek API Key

### 2. 检查清单
- [ ] 代码已提交到 GitHub
- [ ] 已获取 DeepSeek API Key
- [ ] 已创建 Vercel 账号
- [ ] 本地测试通过 (`npm run build`)

## 🔧 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

#### Step 1: 登录 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库

#### Step 2: 导入项目
1. 点击 "Add New Project"
2. 选择你的 GitHub 仓库 `Youhai020616/new-seo`
3. 选择项目根目录为 `news-seo-assistant`

#### Step 3: 配置项目
**项目设置：**
- Framework Preset: `Next.js`
- Root Directory: `news-seo-assistant`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

#### Step 4: 配置环境变量
在 Vercel Dashboard 的 Environment Variables 部分添加：

```
DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
NEXT_PUBLIC_APP_URL=https://你的域名.vercel.app
```

**重要提示：**
- `DEEPSEEK_API_KEY` 是必需的，没有它 AI 功能将无法工作
- 建议为所有环境（Production, Preview, Development）都设置相同的环境变量

#### Step 5: 部署
1. 点击 "Deploy" 按钮
2. 等待构建完成（通常需要 1-3 分钟）
3. 部署成功后会获得一个 `.vercel.app` 域名

### 方法二：通过 Vercel CLI

#### Step 1: 安装 Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: 登录
```bash
vercel login
```

#### Step 3: 部署
```bash
# 进入项目目录
cd news-seo-assistant

# 首次部署
vercel

# 部署到生产环境
vercel --prod
```

#### Step 4: 添加环境变量
```bash
vercel env add DEEPSEEK_API_KEY
vercel env add DEEPSEEK_BASE_URL
vercel env add DEEPSEEK_MODEL
```

## 🌐 自定义域名（可选）

### 1. 在 Vercel Dashboard 中添加域名
1. 进入项目设置
2. 点击 "Domains"
3. 添加你的自定义域名

### 2. 配置 DNS
在你的域名服务商处添加以下记录：
- Type: `CNAME`
- Name: `www` 或 `@`
- Value: `cname.vercel-dns.com`

## 🔍 部署后验证

### 1. 检查部署状态
访问：`https://你的域名.vercel.app`

### 2. 测试 API 端点
```bash
# 测试健康检查
curl https://你的域名.vercel.app/api/health

# 测试 AI 功能
curl -X POST https://你的域名.vercel.app/api/ai/summary \
  -H "Content-Type: application/json" \
  -d '{"content":"测试内容","language":"zh"}'
```

### 3. 检查环境变量
在 Vercel Dashboard 中：
1. 进入项目设置
2. 点击 "Environment Variables"
3. 确认所有变量都已正确设置

## ⚙️ 性能优化建议

### 1. 边缘函数配置
项目已配置为使用香港节点（hkg1），适合亚洲用户访问。

### 2. 缓存策略
- API 路由已配置 60 秒缓存
- 静态资源自动缓存
- 可根据需求调整 `vercel.json` 中的缓存配置

### 3. 监控和分析
1. 在 Vercel Dashboard 中查看：
   - Analytics（访问分析）
   - Speed Insights（性能分析）
   - Logs（日志）

## 🔒 安全建议

### 1. 环境变量
- ✅ 永远不要在代码中硬编码 API Key
- ✅ 使用 Vercel 的环境变量功能
- ✅ 定期轮换 API Key

### 2. API 限流
考虑添加速率限制中间件：
```typescript
// lib/ai/middleware/rate-limit.ts
export function rateLimit() {
  // 实现速率限制逻辑
}
```

### 3. 域名白名单
在 `next.config.ts` 中配置允许的域名：
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://你的域名.com' },
      ],
    },
  ];
}
```

## 🐛 常见问题

### 1. 构建失败
**问题：** `Error: Build failed`
**解决：**
```bash
# 本地测试构建
npm run build

# 检查依赖
npm install

# 清除缓存
rm -rf .next node_modules
npm install
npm run build
```

### 2. API 调用失败
**问题：** AI 功能不工作
**解决：**
- 检查 `DEEPSEEK_API_KEY` 是否正确设置
- 查看 Vercel 函数日志
- 确认 API Key 有足够的配额

### 3. 环境变量未生效
**问题：** 环境变量读取为空
**解决：**
- 重新部署项目
- 检查变量名是否正确（区分大小写）
- 确保变量应用到了正确的环境

### 4. 超时错误
**问题：** `Error: Function execution timeout`
**解决：**
- Vercel 免费版函数超时时间为 10 秒
- 考虑升级到 Pro 版本（60 秒超时）
- 优化 API 调用逻辑，使用流式响应

## 📊 成本估算

### Vercel 定价
- **Hobby（免费）：**
  - 100 GB 带宽/月
  - 无限部署
  - 10 秒函数超时
  - 适合个人项目

- **Pro（$20/月）：**
  - 1 TB 带宽/月
  - 60 秒函数超时
  - 优先构建
  - 适合生产环境

### DeepSeek API 成本
- 按 token 计费
- 建议设置月度预算限制
- 监控使用情况

## 🔄 持续部署

### 自动部署
Vercel 会自动监听你的 GitHub 仓库：
- **main 分支** → 自动部署到生产环境
- **其他分支** → 自动部署到预览环境
- **Pull Request** → 生成预览链接

### 部署钩子
可以配置 GitHub Actions 或 Vercel Webhooks 实现：
- 部署前运行测试
- 部署后运行验证
- 发送通知

## 📞 支持资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

## ✅ 部署检查清单

完成部署后，请确认：

- [ ] 网站可以正常访问
- [ ] 首页加载正常
- [ ] 关键词提取功能正常
- [ ] SEO 生成功能正常
- [ ] AI 摘要功能正常
- [ ] 趋势分析功能正常
- [ ] 情感分析功能正常
- [ ] 多语言切换正常
- [ ] 响应式布局正常
- [ ] 性能达标（Lighthouse 分数 > 90）

---

**最后更新：** 2025-11-07
**维护者：** Youhai020616

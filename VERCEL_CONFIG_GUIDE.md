# Vercel 部署配置清单

## 🎯 项目配置

### Framework Preset
```
Next.js
```

### Root Directory
```
news-seo-assistant
```
⚠️ **重要**: 必须设置为 `news-seo-assistant`，因为这是你的 Next.js 项目所在的子目录

### Build Command
```
npm run build
```

### Output Directory
```
.next
```
（选择 "Next.js default" 即可）

### Install Command
```
npm install
```

---

## 🔐 环境变量配置

### 必需的环境变量（没有这些 AI 功能将无法工作）

#### 1. DEEPSEEK_API_KEY
```
Key:   DEEPSEEK_API_KEY
Value: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
**如何获取:**
1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 Key（通常以 `sk-` 开头）

⚠️ **注意**: 这个 Key 只会显示一次，请妥善保存

#### 2. DEEPSEEK_BASE_URL
```
Key:   DEEPSEEK_BASE_URL
Value: https://api.deepseek.com/v1
```
（固定值，直接复制）

#### 3. DEEPSEEK_MODEL
```
Key:   DEEPSEEK_MODEL
Value: deepseek-chat
```
（默认模型，直接复制）

### 可选的环境变量

#### 4. NEXT_PUBLIC_APP_URL
```
Key:   NEXT_PUBLIC_APP_URL
Value: https://your-project.vercel.app
```
**说明**: 部署后 Vercel 会分配一个域名，可以先不填，部署成功后再添加

#### 5. RSS_CACHE_DURATION
```
Key:   RSS_CACHE_DURATION
Value: 60
```
（RSS 缓存时间，单位：分钟）

---

## 📸 操作步骤

### Step 1: 设置 Root Directory
1. 在 "Root Directory" 旁边点击 "Edit" 按钮
2. 输入: `news-seo-assistant`
3. 点击保存

### Step 2: 删除示例环境变量
1. 点击 `EXAMPLE_NAME` 右侧的删除按钮（-）

### Step 3: 添加环境变量
1. 点击 "+ Add More" 按钮
2. 在 Key 栏输入: `DEEPSEEK_API_KEY`
3. 在 Value 栏输入: 你的 DeepSeek API Key
4. 重复步骤 1-3，添加其他环境变量

### Step 4: 部署
1. 确认所有配置正确
2. 点击底部的 "Deploy" 按钮
3. 等待构建完成（约 2-3 分钟）

---

## ⚠️ 常见错误

### 错误 1: Root Directory 未设置
**症状**: 构建失败，提示找不到 `package.json`
**解决**: 确保 Root Directory 设置为 `news-seo-assistant`

### 错误 2: DEEPSEEK_API_KEY 未设置
**症状**: 网站可以访问，但 AI 功能全部失败
**解决**: 在环境变量中添加正确的 API Key

### 错误 3: API Key 格式错误
**症状**: AI 调用返回 401 Unauthorized
**解决**: 检查 API Key 是否完整复制，包含 `sk-` 前缀

---

## 🎉 部署成功后

部署成功后，你会看到：
- ✅ 部署成功页面
- 🌐 一个 `.vercel.app` 域名
- 📊 可以访问你的网站

### 验证部署
访问你的网站并测试：
1. 首页是否正常显示
2. 导航到 `/keywords` 页面
3. 测试关键词提取功能
4. 测试 SEO 生成功能
5. 检查 AI 摘要是否正常工作

---

## 💡 提示

- 所有环境变量都会应用到 Production、Preview 和 Development 环境
- API Key 是敏感信息，不要提交到 Git 仓库
- 可以在 Vercel Dashboard 随时修改环境变量
- 修改环境变量后需要重新部署才能生效

---

**准备好了吗？** 按照上面的步骤配置，然后点击 Deploy！🚀

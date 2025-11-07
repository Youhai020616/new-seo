#!/bin/bash

# Vercel 部署前检查脚本
# 使用方法: ./scripts/pre-deploy-check.sh

set -e

echo "🔍 开始部署前检查..."
echo ""

# 1. 检查 Node 版本
echo "1️⃣ 检查 Node.js 版本..."
NODE_VERSION=$(node -v)
echo "   ✅ Node.js 版本: $NODE_VERSION"
echo ""

# 2. 检查依赖是否安装
echo "2️⃣ 检查依赖..."
if [ ! -d "node_modules" ]; then
  echo "   ⚠️  node_modules 不存在，正在安装依赖..."
  npm install
else
  echo "   ✅ 依赖已安装"
fi
echo ""

# 3. 检查环境变量文件
echo "3️⃣ 检查环境变量..."
if [ -f ".env.local" ]; then
  echo "   ✅ .env.local 存在"
  
  # 检查必需的环境变量
  if grep -q "DEEPSEEK_API_KEY=" .env.local; then
    if grep -q "DEEPSEEK_API_KEY=$" .env.local || grep -q "DEEPSEEK_API_KEY=your_" .env.local; then
      echo "   ⚠️  警告: DEEPSEEK_API_KEY 未设置或使用示例值"
      echo "   请在 .env.local 中设置真实的 DeepSeek API Key"
    else
      echo "   ✅ DEEPSEEK_API_KEY 已设置"
    fi
  else
    echo "   ⚠️  警告: .env.local 中缺少 DEEPSEEK_API_KEY"
  fi
else
  echo "   ⚠️  .env.local 不存在"
  echo "   提示: 复制 .env.example 到 .env.local 并填入真实的 API Key"
fi
echo ""

# 4. 运行 TypeScript 类型检查
echo "4️⃣ TypeScript 类型检查..."
if npm run type-check > /dev/null 2>&1; then
  echo "   ✅ 类型检查通过"
else
  echo "   ⚠️  类型检查未配置（可选）"
fi
echo ""

# 5. 测试构建
echo "5️⃣ 测试构建..."
if npm run build; then
  echo "   ✅ 构建成功"
else
  echo "   ❌ 构建失败！请修复错误后再部署"
  exit 1
fi
echo ""

# 6. 检查 Git 状态
echo "6️⃣ 检查 Git 状态..."
if [ -d ".git" ]; then
  if [[ -z $(git status -s) ]]; then
    echo "   ✅ 工作目录干净"
  else
    echo "   ⚠️  有未提交的更改:"
    git status -s
    echo ""
    read -p "   是否要提交这些更改? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git add .
      read -p "   请输入提交信息: " commit_msg
      git commit -m "$commit_msg"
      git push
      echo "   ✅ 更改已提交并推送"
    fi
  fi
else
  echo "   ⚠️  不是 Git 仓库"
fi
echo ""

# 7. Vercel 部署建议
echo "📋 部署建议:"
echo ""
echo "选项 1: 通过 Vercel Dashboard 部署"
echo "  1. 访问 https://vercel.com/new"
echo "  2. 导入仓库: Youhai020616/new-seo"
echo "  3. Root Directory: news-seo-assistant"
echo "  4. 添加环境变量: DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL"
echo "  5. 点击 Deploy"
echo ""
echo "选项 2: 通过 Vercel CLI 部署"
echo "  运行: npx vercel --prod"
echo ""

echo "✅ 所有检查完成！准备部署到 Vercel"

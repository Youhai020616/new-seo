#!/usr/bin/env node

/**
 * RSS源测试脚本
 * 用于验证配置的RSS源是否可用
 *
 * 使用方法:
 *   node scripts/test-rss-sources.js [region]
 *
 * 示例:
 *   node scripts/test-rss-sources.js hongkong
 *   node scripts/test-rss-sources.js all
 */

const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

// 读取RSS源配置
const rssSourcesPath = path.join(__dirname, '../config/rss-sources.json');
const rssSources = JSON.parse(fs.readFileSync(rssSourcesPath, 'utf-8'));

// 命令行参数
const targetRegion = process.argv[2] || 'all';

// 过滤RSS源
const filteredSources = targetRegion === 'all'
  ? rssSources.sources
  : rssSources.sources.filter(s => s.region === targetRegion);

console.log(`\n📡 测试 RSS 源可用性`);
console.log(`地区: ${targetRegion}`);
console.log(`RSS 源数量: ${filteredSources.length}\n`);
console.log('━'.repeat(60));

// 测试单个RSS源
async function testRSSSource(source) {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NewsSEOBot/1.0)',
    },
  });

  const startTime = Date.now();

  try {
    const feed = await parser.parseURL(source.url);
    const duration = Date.now() - startTime;

    return {
      success: true,
      name: source.name,
      region: source.region,
      url: source.url,
      duration,
      itemCount: feed.items.length,
      feedTitle: feed.title,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      name: source.name,
      region: source.region,
      url: source.url,
      duration,
      error: error.message,
    };
  }
}

// 测试所有源
async function testAllSources() {
  const results = [];

  for (const source of filteredSources) {
    console.log(`\n🔍 测试: ${source.name} (${source.region})`);
    console.log(`   URL: ${source.url}`);

    const result = await testRSSSource(source);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ 成功 - ${result.duration}ms`);
      console.log(`   📰 Feed标题: ${result.feedTitle}`);
      console.log(`   📊 新闻条数: ${result.itemCount}`);
    } else {
      console.log(`   ❌ 失败 - ${result.duration}ms`);
      console.log(`   ⚠️  错误: ${result.error}`);
    }
  }

  // 统计结果
  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 测试统计\n');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalItems = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.itemCount, 0);
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`总测试数: ${results.length}`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`📰 总新闻数: ${totalItems}`);
  console.log(`⏱️  平均响应时间: ${avgDuration.toFixed(0)}ms\n`);

  // 按地区分组统计
  const byRegion = {};
  results.forEach(r => {
    if (!byRegion[r.region]) {
      byRegion[r.region] = { success: 0, fail: 0, items: 0 };
    }
    if (r.success) {
      byRegion[r.region].success++;
      byRegion[r.region].items += r.itemCount;
    } else {
      byRegion[r.region].fail++;
    }
  });

  console.log('地区统计:');
  Object.entries(byRegion).forEach(([region, stats]) => {
    console.log(`  ${region}: ${stats.success}/${stats.success + stats.fail} 成功, ${stats.items} 条新闻`);
  });

  console.log('\n' + '━'.repeat(60) + '\n');

  // 失败的源列表
  const failedSources = results.filter(r => !r.success);
  if (failedSources.length > 0) {
    console.log('❌ 失败的RSS源:\n');
    failedSources.forEach(r => {
      console.log(`  • ${r.name} (${r.region})`);
      console.log(`    URL: ${r.url}`);
      console.log(`    错误: ${r.error}\n`);
    });
  }
}

// 运行测试
testAllSources().catch(error => {
  console.error('测试脚本错误:', error);
  process.exit(1);
});

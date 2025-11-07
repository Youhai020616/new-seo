'use client';

import { useEffect, useRef, useState } from 'react';
import type { Keyword } from '@/types';

interface KeywordCloudProps {
  keywords: Keyword[];
}

export default function KeywordCloud({ keywords }: KeywordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || keywords.length === 0) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const width = container.clientWidth;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 计算字体大小（基于 TF-IDF 分数）
    const maxTfidf = Math.max(...keywords.map(k => k.tfidf));
    const minTfidf = Math.min(...keywords.map(k => k.tfidf));

    // 颜色渐变
    const colors = [
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#ec4899', // pink-500
      '#f59e0b', // amber-500
      '#10b981', // emerald-500
      '#06b6d4', // cyan-500
    ];

    // 绘制词云
    keywords.forEach((keyword, index) => {
      // 计算字体大小（12-48px）
      const normalized = (keyword.tfidf - minTfidf) / (maxTfidf - minTfidf || 1);
      const fontSize = 12 + normalized * 36;

      // 随机位置（简单布局）
      const angle = (index * 137.5) % 360; // 黄金角度
      const radius = 30 + (index * 15) % (Math.min(width, height) / 3);
      const x = width / 2 + radius * Math.cos((angle * Math.PI) / 180);
      const y = height / 2 + radius * Math.sin((angle * Math.PI) / 180);

      // 设置样式
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = colors[index % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 添加阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 绘制文字
      ctx.fillText(keyword.word, x, y);

      // 清除阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    });
  }, [keywords]);

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
    </div>
  );
}

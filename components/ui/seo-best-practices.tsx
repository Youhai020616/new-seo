"use client";

import { GlassCard } from "./glass-card";
import { CheckCircle, Sparkles } from "lucide-react";

interface SEOBestPracticesProps {
  language?: "zh" | "en";
}

export function SEOBestPractices({ language = "zh" }: SEOBestPracticesProps) {
  const content = {
    zh: {
      title: "SEO 最佳实践",
      titleOptimization: "标题优化：",
      metaTips: "Meta描述技巧：",
      titleTips: [
        "保持标题在50-60个字符之间",
        "在开头附近包含主要关键词",
        "使其引人注目且值得点击",
        "避免关键词堆砌",
        "使用动作词和数字",
      ],
      metaTipsList: [
        "目标为150-160个字符",
        "自然地包含目标关键词",
        "编写清晰、引人注目的文案",
        "添加行动号召",
        "为每个页面创建独特描述",
      ],
    },
    en: {
      title: "SEO Best Practices",
      titleOptimization: "Title Optimization:",
      metaTips: "Meta Description Tips:",
      titleTips: [
        "Keep titles between 50-60 characters",
        "Include primary keyword near the beginning",
        "Make it compelling and click-worthy",
        "Avoid keyword stuffing",
        "Use action words and numbers",
      ],
      metaTipsList: [
        "Aim for 150-160 characters",
        "Include target keywords naturally",
        "Write clear, compelling copy",
        "Add a call-to-action",
        "Make it unique for each page",
      ],
    },
  };

  const t = content[language];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          📖 {t.title}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Title Optimization */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {t.titleOptimization}
          </h4>
          <ul className="space-y-2">
            {t.titleTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta Description Tips */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            {t.metaTips}
          </h4>
          <ul className="space-y-2">
            {t.metaTipsList.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-600">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}

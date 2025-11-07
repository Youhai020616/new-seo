'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Keyword } from '@/types';

interface KeywordChartProps {
  keywords: Keyword[];
  type?: 'line' | 'bar';
}

export default function KeywordChart({ keywords, type = 'bar' }: KeywordChartProps) {
  if (keywords.length === 0) {
    return null;
  }

  // 准备数据
  const chartData = keywords.map(kw => ({
    word: kw.word.length > 10 ? kw.word.substring(0, 10) + '...' : kw.word,
    fullWord: kw.word,
    'TF-IDF Score': Number(kw.tfidf.toFixed(3)),
    'Frequency': kw.frequency,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.fullWord}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="word"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="TF-IDF Score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Frequency"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="word"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              yAxisId="left"
              dataKey="TF-IDF Score"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="Frequency"
              fill="#8b5cf6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

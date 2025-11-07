import React from 'react';

type Props = {
  title: string;
  reasoning?: string;
  keywords_used?: string[];
  estimated_ctr?: 'high' | 'medium' | 'low';
  score?: number;
};

export default function AITitleCard({ title, reasoning, keywords_used = [], estimated_ctr = 'medium', score = 0 }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg leading-tight">{title}</h3>
        <span className="text-sm font-medium text-green-600">{score}/100</span>
      </div>
      {reasoning ? <p className="text-sm text-gray-600 mt-2">{reasoning}</p> : null}
      <div className="flex flex-wrap gap-2 mt-3">
        {keywords_used.map(k => (
          <span key={k} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {k}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
        <span>Estimated CTR:</span>
        <span className={estimated_ctr === 'high' ? 'text-green-600' : estimated_ctr === 'medium' ? 'text-yellow-600' : 'text-gray-600'}>
          {estimated_ctr.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

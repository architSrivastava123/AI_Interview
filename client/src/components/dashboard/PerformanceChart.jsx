import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx';
import { TrendingUp } from 'lucide-react';

export function PerformanceChart({ trendData = [] }) {
  if (!trendData || trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance Trend</CardTitle>
        </CardHeader>
        <div className="h-40 flex items-center justify-center text-xs text-slate-500">
          No interview sessions completed yet. Start your first mock interview to track progress.
        </div>
      </Card>
    );
  }

  const maxScore = 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-indigo-400" />
          <CardTitle className="text-sm">Score Progression</CardTitle>
        </div>
        <span className="text-xs text-slate-500">{trendData.length} recorded sessions</span>
      </CardHeader>

      <div className="pt-2">
        <div className="flex items-end gap-2 h-36 border-b border-slate-800 pb-2">
          {trendData.slice(-8).map((point, index) => {
            const heightPercent = Math.max(10, (point.score / maxScore) * 100);
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 border border-slate-700 text-slate-200 text-[10px] px-1.5 py-0.5 rounded code-font pointer-events-none z-10 whitespace-nowrap">
                  {point.score}% · {point.grade}
                </div>
                <div className="w-full bg-slate-800/80 rounded-t-sm flex items-end justify-center overflow-hidden h-full">
                  <div
                    className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all rounded-t-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 truncate w-full text-center">
                  {point.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

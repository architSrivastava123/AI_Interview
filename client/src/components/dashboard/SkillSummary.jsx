import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Progress } from '../ui/Progress.jsx';

export function SkillSummary({ averageScores = {} }) {
  const dimensions = [
    { key: 'technical', label: 'Technical Depth', weight: '40%' },
    { key: 'fluency', label: 'Speech Fluency', weight: '20%' },
    { key: 'pace', label: 'Speaking Pace', weight: '15%' },
    { key: 'confidence', label: 'Delivery Confidence', weight: '15%' },
    { key: 'communication', label: 'Communication Clarity', weight: '10%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Dimension Breakdown</CardTitle>
        <span className="text-xs text-slate-500">Deterministic scoring weights</span>
      </CardHeader>

      <div className="space-y-3.5">
        {dimensions.map((dim) => {
          const score = averageScores[dim.key] || 0;
          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{dim.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 code-font">wt: {dim.weight}</span>
                  <span className="code-font font-semibold text-slate-200">{score}%</span>
                </div>
              </div>
              <Progress value={score} max={100} variant={score >= 75 ? 'success' : score >= 60 ? 'primary' : 'warning'} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Progress } from '../ui/Progress.jsx';

export function DimensionRadar({ report = {} }) {
  const dimensions = [
    { label: 'Technical Accuracy & Depth', score: report.technicalScore || 0, weight: '40%' },
    { label: 'Speech Fluency & Articulation', score: report.fluencyScore || 0, weight: '20%' },
    { label: 'Speaking Pace & Cadence', score: report.paceScore || 0, weight: '15%' },
    { label: 'Delivery Confidence & Structure', score: report.confidenceScore || 0, weight: '15%' },
    { label: 'Communication Clarity', score: report.communicationScore || 0, weight: '10%' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Performance by Dimension</CardTitle>
        <span className="text-xs text-slate-500">Deterministic composite weights</span>
      </CardHeader>

      <div className="space-y-4">
        {dimensions.map((dim, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-200 font-medium">{dim.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 code-font">weight: {dim.weight}</span>
                <span className="code-font font-bold text-slate-100">{dim.score}%</span>
              </div>
            </div>
            <Progress
              value={dim.score}
              max={100}
              variant={dim.score >= 75 ? 'success' : dim.score >= 60 ? 'primary' : 'warning'}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

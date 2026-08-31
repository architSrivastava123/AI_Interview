import React from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Target, TrendingUp, Flame, CheckCircle } from 'lucide-react';

export function ReadinessCard({ analytics = {} }) {
  const readiness = analytics.readinessScore || 0;
  const total = analytics.totalInterviews || 0;
  const streak = analytics.streakDays || 0;

  const getTier = (score) => {
    if (score >= 85) return { label: 'Interview Ready', color: 'success' };
    if (score >= 70) return { label: 'Competent', color: 'primary' };
    if (score >= 55) return { label: 'Needs Practice', color: 'warning' };
    return { label: 'Early Stage', color: 'default' };
  };

  const tier = getTier(readiness);

  return (
    <Card className="bg-gradient-to-br from-surface to-surface-raised">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400">Readiness Score</span>
            <Badge variant={tier.color} size="xs">{tier.label}</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100 code-font">{readiness}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t sm:border-t-0 sm:border-l border-surface-border pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-0.5">
              <CheckCircle size={13} className="text-indigo-400" />
              <span>Completed</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 code-font">{total} sessions</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-slate-400 text-xs mb-0.5">
              <Flame size={13} className="text-amber-400" />
              <span>Active Streak</span>
            </div>
            <p className="text-sm font-semibold text-slate-200 code-font">{streak} days</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

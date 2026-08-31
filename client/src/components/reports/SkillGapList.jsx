import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';

export function SkillGapList({ skillGaps = [], targetRole = 'Target Role' }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'strong':
        return <Badge variant="success" size="xs">Strong (+5)</Badge>;
      case 'on-track':
        return <Badge variant="primary" size="xs">On Track</Badge>;
      case 'needs-work':
        return <Badge variant="warning" size="xs">Needs Work</Badge>;
      case 'critical':
        return <Badge variant="danger" size="xs">Critical Gap</Badge>;
      default:
        return <Badge variant="default" size="xs">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Skill Gap Analysis</CardTitle>
        <span className="text-xs text-slate-500">Benchmark: {targetRole}</span>
      </CardHeader>

      <div className="divide-y divide-slate-800/80">
        {skillGaps.map((gap, index) => (
          <div key={index} className="py-2.5 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-200 capitalize">
                {gap.dimension}
              </span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Candidate: {gap.candidateAvg}% · Target Benchmark: {gap.target}%
              </div>
            </div>
            <div>
              {getStatusBadge(gap.status)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

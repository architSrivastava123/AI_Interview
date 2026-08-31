import React from 'react';
import { Progress } from '../ui/Progress.jsx';

export function InterviewProgress({ current = 1, total = 5 }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
        <span>Session Progress</span>
        <span className="code-font font-medium text-indigo-400">
          Question {current} of {total}
        </span>
      </div>
      <Progress value={current} max={total} variant="primary" />
    </div>
  );
}

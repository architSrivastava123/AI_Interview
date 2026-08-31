import React from 'react';
import { Textarea } from '../ui/Input.jsx';

export function AnswerEditor({ value, onChange, placeholder = 'Type or speak your answer here...' }) {
  const wordCount = (value || '').trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
        <span>Your Response</span>
        <span className="code-font text-slate-500">{wordCount} words</span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="font-sans text-sm leading-relaxed"
      />
    </div>
  );
}

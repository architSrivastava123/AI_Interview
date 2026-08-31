import React, { useState } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export function QuestionReviewCard({ item, order = 1 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-slate-900 border-slate-800">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs code-font font-medium">
            {order}
          </span>
          <div>
            <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{item.questionText}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>{item.topic}</span>
              <span>·</span>
              <Badge variant="default" size="xs">{item.difficulty || 'Medium'}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {item.score !== undefined && (
            <span className="text-xs font-bold text-slate-100 code-font">
              {item.score}%
            </span>
          )}
          <button className="text-slate-500 hover:text-slate-300 p-1">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs">
          {item.answerText && (
            <div>
              <span className="text-slate-400 font-medium">Submitted Answer:</span>
              <p className="mt-1 p-2.5 bg-slate-950/60 rounded border border-slate-800 text-slate-300 leading-relaxed font-sans">
                {item.answerText}
              </p>
            </div>
          )}

          {item.feedback && (
            <div>
              <span className="text-slate-400 font-medium">AI Feedback:</span>
              <p className="mt-1 text-slate-300 leading-relaxed">
                {item.feedback}
              </p>
            </div>
          )}

          {item.missingConcepts && item.missingConcepts.length > 0 && (
            <div>
              <span className="text-slate-400 font-medium">Missing Key Concepts:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {item.missingConcepts.map((concept, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-950/40 text-rose-300 border border-rose-900/40 rounded text-[11px] code-font">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

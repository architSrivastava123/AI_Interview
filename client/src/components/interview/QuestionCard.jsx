import React from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Sparkles, HelpCircle } from 'lucide-react';

export function QuestionCard({ question, currentOrder = 1, totalQuestions = 5 }) {
  if (!question) return null;

  const getDifficultyVariant = (diff) => {
    switch (diff) {
      case 'Easy': return 'success';
      case 'Medium': return 'primary';
      case 'Hard': return 'warning';
      case 'Expert': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-700/80">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 code-font">
            QUESTION {currentOrder} OF {totalQuestions}
          </span>
          <Badge variant={getDifficultyVariant(question.difficulty)} size="xs">
            {question.difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" size="xs">
            {question.topic}
          </Badge>
          {question.source === 'resume_rag' && (
            <Badge variant="primary" size="xs">
              Resume Context
            </Badge>
          )}
        </div>
      </div>

      <div className="py-4">
        <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          {question.questionText}
        </h2>
      </div>

      {question.expectedConcepts && question.expectedConcepts.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 mr-1">Focus Areas:</span>
          {question.expectedConcepts.map((concept, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-slate-800/80 text-slate-300 rounded text-[11px] code-font">
              {concept}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

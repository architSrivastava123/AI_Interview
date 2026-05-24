"use client";

/**
 * ScoreCard.jsx
 * Reusable multi-dimension score display card.
 * Shows all 5 scoring dimensions with color-coded progress bars.
 */
import React from 'react';
import { Target, Mic, Gauge, Zap, MessageSquare, Award } from 'lucide-react';

const DIMENSIONS = [
  { key: 'technicalScore',     label: 'Technical',     icon: Target,       color: 'from-indigo-500 to-indigo-600',  text: 'text-indigo-400' },
  { key: 'fluencyScore',       label: 'Fluency',       icon: Mic,          color: 'from-purple-500 to-purple-600',  text: 'text-purple-400' },
  { key: 'paceScore',          label: 'Pace',          icon: Gauge,        color: 'from-cyan-500 to-cyan-600',      text: 'text-cyan-400' },
  { key: 'confidenceScore',    label: 'Confidence',    icon: Zap,          color: 'from-orange-500 to-orange-600',  text: 'text-orange-400' },
  { key: 'communicationScore', label: 'Communication', icon: MessageSquare, color: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400' },
];

function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-rose-400';
}

/**
 * @param {{ scores: Object, grade: string, percentile: number, showDimensions?: boolean }} props
 */
export function ScoreCard({ scores = {}, grade = 'N/A', percentile = 0, showDimensions = true }) {
  const composite = Math.round(Number(scores.compositeScore) || 0);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
      {/* Composite Score Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Award size={11} className="text-indigo-400" />
            Composite Score
          </p>
          <div className="flex items-end gap-3 mt-2">
            <span className={`text-5xl font-black ${getScoreColor(composite)}`}>
              {composite}
            </span>
            <span className="text-gray-500 text-lg mb-1">/100</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-3xl font-black text-white">{grade}</div>
          <div className="text-[10px] text-gray-400 font-bold">{percentile}th percentile</div>
        </div>
      </div>

      {/* Composite bar */}
      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700"
          style={{ width: `${composite}%` }}
        />
      </div>

      {/* Dimension Breakdown */}
      {showDimensions && (
        <div className="space-y-3 pt-2">
          {DIMENSIONS.map(({ key, label, icon: Icon, color, text }) => {
            const val = Math.round(Number(scores[key]) || 0);
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${text} flex items-center gap-1`}>
                    <Icon size={10} />
                    {label}
                  </span>
                  <span className={`text-[11px] font-black ${getScoreColor(val)}`}>
                    {val}
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ScoreCard;

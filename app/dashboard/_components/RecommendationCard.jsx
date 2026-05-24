"use client";

/**
 * RecommendationCard.jsx
 * Individual recommendation card with priority indicator, skill tag, resource link.
 */
import React from 'react';
import { ExternalLink, Clock, Zap, BookOpen, Code2, Mic, Gauge, Target, CheckCircle, Circle } from 'lucide-react';

const PRIORITY_CONFIG = {
  1: { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  2: { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  3: { label: 'Medium',   color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  4: { label: 'Low',      color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/20' },
  5: { label: 'Optional', color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/20' },
};

const RESOURCE_ICONS = {
  docs:     BookOpen,
  article:  BookOpen,
  github:   Code2,
  course:   Zap,
  practice: Target,
  tool:     Zap,
  roadmap:  Target,
  action:   CheckCircle,
  book:     BookOpen,
  tutorial: BookOpen,
};

const SKILL_COLORS = {
  technical:     'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  fluency:       'text-purple-400 bg-purple-500/10 border-purple-500/20',
  pace:          'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  confidence:    'text-orange-400 bg-orange-500/10 border-orange-500/20',
  communication: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  practice:      'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  challenge:     'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

/**
 * @param {{ recommendation: Object, onMarkComplete?: Function }} props
 */
export function RecommendationCard({ recommendation: rec, onMarkComplete }) {
  if (!rec) return null;

  const priority = Number(rec.priority) || 5;
  const pConfig = PRIORITY_CONFIG[Math.min(5, Math.max(1, priority))] || PRIORITY_CONFIG[5];
  const ResourceIcon = RESOURCE_ICONS[rec.resourceType] || BookOpen;
  const skillColor = SKILL_COLORS[rec.targetSkill] || SKILL_COLORS.practice;
  const isCompleted = Boolean(rec.isCompleted);

  return (
    <div className={`glass-panel p-5 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300 group relative overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/3 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/6 transition-all" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 space-y-2.5">
          {/* Priority + Category tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${pConfig.bg} ${pConfig.color}`}>
              {pConfig.label} Priority
            </span>
            {rec.targetSkill && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${skillColor}`}>
                {rec.targetSkill}
              </span>
            )}
            {rec.difficulty && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 bg-white/5 text-gray-400">
                {rec.difficulty}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className={`text-sm font-extrabold tracking-wide ${isCompleted ? 'line-through text-gray-500' : 'text-white group-hover:text-indigo-300 transition-colors'}`}>
            {rec.title}
          </h4>

          {/* Description */}
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {rec.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            {rec.estimatedHours > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> ~{rec.estimatedHours}h
              </span>
            )}
            {rec.impactScore > 0 && (
              <span className="flex items-center gap-1 text-indigo-400">
                <Zap size={10} /> Impact: {Math.round(rec.impactScore)}
              </span>
            )}
          </div>
        </div>

        {/* Actions column */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* Complete toggle */}
          {onMarkComplete && (
            <button
              onClick={() => onMarkComplete(rec)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted
                ? <CheckCircle size={14} className="text-emerald-400" />
                : <Circle size={14} className="text-gray-500" />
              }
            </button>
          )}

          {/* Resource link */}
          {rec.resourceUrl && (
            <a
              href={rec.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-gray-500 hover:text-indigo-400 transition-all"
              title="Open resource"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;

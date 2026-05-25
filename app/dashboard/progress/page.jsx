"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import {
  TrendingUp, ArrowLeft, Trophy, XCircle, Calendar,
  Zap, Activity, Target, BarChart2, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import AnalyticsChart from '../_components/AnalyticsChart';

function getGradeColor(grade) {
  if (!grade) return 'text-gray-400';
  const g = grade[0];
  if (g === 'A') return 'text-emerald-400';
  if (g === 'B') return 'text-indigo-400';
  if (g === 'C') return 'text-yellow-400';
  if (g === 'D') return 'text-orange-400';
  return 'text-rose-400';
}

export default function ProgressPage() {
  const { user } = useUser();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const res = await fetch(`/api/progress?userEmail=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProgress(data.progress);
    } catch {
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const sessions = progress?.sessions || [];
  const trend = progress?.trend || [];
  const records = progress?.records || {};
  const velocity = progress?.velocity || {};
  const streaks = progress?.streaks || {};
  const domainBreakdown = progress?.domainBreakdown || [];
  const scoreDimHistory = progress?.scoreDimensionHistory || [];

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      <div className="glow-orb bg-indigo-500/8 w-[500px] h-[500px] top-10 left-10" />
      <div className="glow-orb bg-cyan-500/8 w-[400px] h-[400px] bottom-10 right-10" />
      <div className="absolute inset-0 cyber-grid opacity-[0.10] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              Progress Tracker
              <TrendingUp size={22} className="text-cyan-400" />
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Your interview journey across all sessions.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="glass-panel p-6 rounded-3xl border border-white/5 animate-pulse h-32" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
            <Activity size={40} className="text-gray-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white">No Progress Data Yet</h3>
            <p className="text-gray-500 text-xs mt-2">Complete your first mock interview to start tracking progress.</p>
            <Link href="/dashboard">
              <Button className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Personal Records */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { icon: BarChart2, label: 'Total Sessions', value: records.totalSessions || 0, color: 'text-indigo-400', accent: 'from-indigo-500/10' },
                { icon: Trophy, label: 'Best Score', value: records.bestScore ? `${records.bestScore}/100` : 'N/A', color: 'text-yellow-400', accent: 'from-yellow-500/10' },
                { icon: TrendingUp, label: 'Overall Growth', value: records.overallImprovement >= 0 ? `+${records.overallImprovement}` : `${records.overallImprovement}`, color: records.overallImprovement >= 0 ? 'text-emerald-400' : 'text-rose-400', accent: 'from-emerald-500/10' },
                { icon: Zap, label: 'Trend', value: velocity.trend === 'improving' ? '▲ Rising' : velocity.trend === 'declining' ? '▼ Falling' : '→ Stable', color: velocity.trend === 'improving' ? 'text-emerald-400' : velocity.trend === 'declining' ? 'text-rose-400' : 'text-yellow-400', accent: 'from-cyan-500/10' },
              ].map(card => (
                <div key={card.label} className={`glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-br ${card.accent} to-transparent`}>
                  <card.icon size={18} className={`${card.color} mb-3`} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
                  <p className={`text-xl font-black mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Score Trend */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                <TrendingUp size={16} className="text-indigo-400" />
                <span className="text-sm font-extrabold text-white uppercase tracking-wide">Score Over Time</span>
              </div>
              <AnalyticsChart data={trend} height={220} />
            </div>

            {/* Best vs Worst Comparison */}
            {records.bestSession && records.worstSession && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Best Session', session: records.bestSession, icon: Trophy, accentClass: 'from-emerald-500/10 border-emerald-500/15', iconClass: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400' },
                  { label: 'Needs Most Work', session: records.worstSession, icon: XCircle, accentClass: 'from-rose-500/10 border-rose-500/15', iconClass: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400' },
                ].map(({ label, session, icon: Icon, accentClass, iconClass, badge }) => (
                  <div key={label} className={`glass-panel p-6 rounded-3xl border bg-gradient-to-br ${accentClass} to-transparent`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon size={16} className={iconClass} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">{label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-black text-white">{session.score}</p>
                        <p className="text-gray-500 text-xs">composite score</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`text-sm font-black px-2 py-1 rounded ${badge}`}>{session.grade}</span>
                        <p className="text-[10px] text-gray-500 block">{session.track}</p>
                        <p className="text-[10px] text-gray-600">{session.completedAt}</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/interview/${session.mockId}/feedback`}>
                      <button className="mt-4 text-[10px] font-bold text-gray-400 hover:text-indigo-400 transition-colors">
                        View Session →
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Dimension Score History */}
            {scoreDimHistory.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <Target size={16} className="text-purple-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Dimension Score History</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Session', 'Composite', 'Technical', 'Fluency', 'Pace', 'Confidence', 'Communication', 'Grade'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-[10px] font-black uppercase tracking-wider text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scoreDimHistory.slice(-10).map((row, i) => (
                        <tr key={i} className="border-b border-white/3 hover:bg-white/2">
                          <td className="py-2.5 pr-4 text-gray-400 font-mono text-[10px]">{row.mockId?.slice(-6) || `#${i + 1}`}</td>
                          <td className="py-2.5 pr-4 font-black text-white">{Math.round(row.compositeScore)}</td>
                          <td className="py-2.5 pr-4 text-indigo-400">{Math.round(row.technicalScore)}</td>
                          <td className="py-2.5 pr-4 text-purple-400">{Math.round(row.fluencyScore)}</td>
                          <td className="py-2.5 pr-4 text-cyan-400">{Math.round(row.paceScore)}</td>
                          <td className="py-2.5 pr-4 text-orange-400">{Math.round(row.confidenceScore)}</td>
                          <td className="py-2.5 pr-4 text-emerald-400">{Math.round(row.communicationScore)}</td>
                          <td className="py-2.5 pr-4">
                            <span className={`font-black text-sm ${getGradeColor(row.grade)}`}>{row.grade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Domain Breakdown */}
            {domainBreakdown.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <BarChart2 size={16} className="text-cyan-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Domain Mastery</span>
                </div>
                <div className="space-y-4">
                  {domainBreakdown.map(d => (
                    <div key={d.domain} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-200">{d.domain}</span>
                        <span className="text-gray-400">{d.avgScore}/100 avg · {d.count} sessions · Best: {d.bestScore}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${d.avgScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

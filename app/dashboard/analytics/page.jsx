"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import {
  TrendingUp, Activity, Target, Flame, BarChart2,
  Award, Zap, ArrowLeft, RefreshCw, Globe, Layers
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import AnalyticsChart from '../_components/AnalyticsChart';
import SkillRadar from '../_components/SkillRadar';

const DOMAIN_COLORS = {
  Frontend:       'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
  Backend:        'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
  'Full Stack':   'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  'Data Science': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  DevOps:         'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-400',
  General:        'from-gray-500/20 to-gray-500/5 border-gray-500/20 text-gray-400',
};

function getDomainStyle(domain) {
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.General;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (showToast = false) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    if (showToast) setRefreshing(true);

    try {
      const res = await fetch(`/api/analytics?userEmail=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics(data.analytics);
      if (showToast) toast.success('Analytics refreshed!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const trend = analytics?.trend || [];
  const skillGap = analytics?.skillGap;
  const domainBreakdown = analytics?.domainBreakdown || [];
  const streaks = analytics?.streaks || {};
  const velocity = analytics?.velocity || {};

  // Build radar data from skill gap
  const radarData = skillGap?.dimensions?.map(d => ({
    axis: d.dimension.charAt(0).toUpperCase() + d.dimension.slice(1),
    label: d.dimension.charAt(0).toUpperCase() + d.dimension.slice(1),
    value: d.candidateAvg,
  })) || [];

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      <div className="glow-orb bg-indigo-500/8 w-[500px] h-[500px] top-10 left-10" />
      <div className="glow-orb bg-purple-500/8 w-[400px] h-[400px] bottom-10 right-10" />
      <div className="absolute inset-0 cyber-grid opacity-[0.10] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
                Analytics Dashboard
                <Activity size={22} className="text-indigo-400 animate-pulse" />
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Deep insights into your interview performance over time.</p>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="glass-panel p-6 rounded-3xl border border-white/5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <>
            {/* Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { icon: Layers, label: 'Total Sessions', value: analytics?.totalSessions ?? 0, color: 'text-indigo-400', accent: 'from-indigo-500/10' },
                { icon: Award, label: 'Avg Score', value: analytics?.avgCompositeScore ? `${analytics.avgCompositeScore}/100` : 'N/A', color: 'text-emerald-400', accent: 'from-emerald-500/10' },
                { icon: Flame, label: 'Current Streak', value: `${streaks.currentStreak || 0} days`, color: 'text-orange-400', accent: 'from-orange-500/10' },
                { icon: TrendingUp, label: 'Improvement', value: velocity.trend === 'improving' ? `+${velocity.changePercent}%` : velocity.trend === 'declining' ? `${velocity.changePercent}%` : 'Stable', color: velocity.trend === 'improving' ? 'text-emerald-400' : velocity.trend === 'declining' ? 'text-rose-400' : 'text-yellow-400', accent: 'from-cyan-500/10' },
              ].map(card => (
                <div key={card.label} className={`glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-br ${card.accent} to-transparent`}>
                  <card.icon size={18} className={`${card.color} mb-3`} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
                  <p className={`text-xl font-black mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Performance Trend Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Performance Trend</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold">{trend.length} sessions</span>
              </div>
              {trend.length > 0 ? (
                <AnalyticsChart data={trend} height={220} />
              ) : (
                <div className="flex items-center justify-center h-[160px] text-gray-500 text-sm">
                  Complete interviews to see your trend
                </div>
              )}
            </div>

            {/* Skill Radar + Skill Gap side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Skill Radar */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <Target size={16} className="text-purple-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Skill Radar</span>
                </div>
                {radarData.length > 0 ? (
                  <SkillRadar data={radarData} size={260} />
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-gray-500 text-sm">
                    No score data yet
                  </div>
                )}
              </div>

              {/* Skill Gap Matrix */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <BarChart2 size={16} className="text-cyan-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Skill Gap vs Target</span>
                  <span className="ml-auto text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-400 font-bold border border-white/5">
                    {analytics?.primaryTrack || 'General'}
                  </span>
                </div>
                {skillGap?.dimensions?.length > 0 ? (
                  skillGap.dimensions.map(dim => (
                    <div key={dim.dimension} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="capitalize font-bold text-gray-300">{dim.dimension}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{dim.candidateAvg} / {dim.target}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            dim.status === 'strong' ? 'bg-emerald-500/15 text-emerald-400' :
                            dim.status === 'on-track' ? 'bg-indigo-500/15 text-indigo-400' :
                            dim.status === 'needs-work' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-rose-500/15 text-rose-400'
                          }`}>
                            {dim.gap > 0 ? `+${dim.gap}` : dim.gap}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dim.status === 'strong' ? 'bg-emerald-500' :
                            dim.status === 'on-track' ? 'bg-indigo-500' :
                            dim.status === 'needs-work' ? 'bg-yellow-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${dim.candidateAvg}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                    Complete sessions to see gap analysis
                  </div>
                )}
              </div>
            </div>

            {/* Domain Breakdown */}
            {domainBreakdown.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
                  <Globe size={16} className="text-emerald-400" />
                  <span className="text-sm font-extrabold text-white uppercase tracking-wide">Domain Breakdown</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domainBreakdown.map(d => (
                    <div
                      key={d.domain}
                      className={`p-4 rounded-2xl border bg-gradient-to-br ${getDomainStyle(d.domain)} to-transparent`}
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider">{d.domain}</p>
                      <div className="flex items-end justify-between mt-2">
                        <div>
                          <p className="text-2xl font-black text-white">{d.avgScore}</p>
                          <p className="text-[10px] text-gray-500">avg score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">{d.count}</p>
                          <p className="text-[10px] text-gray-500">sessions</p>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-current opacity-60 transition-all" style={{ width: `${d.avgScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { label: 'Current Streak', value: `${streaks.currentStreak || 0} days`, icon: Flame, color: 'text-orange-400' },
                { label: 'Longest Streak', value: `${streaks.longestStreak || 0} days`, icon: Award, color: 'text-yellow-400' },
                { label: 'Active Days', value: `${streaks.totalActiveDays || 0} days`, icon: Activity, color: 'text-indigo-400' },
              ].map(s => (
                <div key={s.label} className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <s.icon size={20} className={s.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
                    <p className={`text-xl font-black ${s.color} mt-0.5`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

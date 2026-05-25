"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { ArrowLeft, Sparkles, RefreshCw, CheckCircle, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import RecommendationCard from '../_components/RecommendationCard';

export default function RecommendationsPage() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      const res = await fetch(`/api/recommendations?userEmail=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const regenerate = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.primaryEmailAddress.emailAddress }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      toast.success('Recommendations refreshed!');
    } catch {
      toast.error('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkComplete = async (rec) => {
    setRecommendations(prev =>
      prev.map(r => r.id === rec.id ? { ...r, isCompleted: !r.isCompleted } : r)
    );
    toast.success(rec.isCompleted ? 'Marked as incomplete' : 'Marked as complete!');
  };

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const completed = recommendations.filter(r => r.isCompleted).length;
  const total = recommendations.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const grouped = recommendations.reduce((acc, rec) => {
    const cat = rec.category || 'general';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rec);
    return acc;
  }, {});

  const categoryLabels = {
    'skill-gap':       '🎯 Skill Gap Fixes',
    'domain-focus':    '🔧 Domain Focus',
    'next-session':    '🚀 Next Session',
    'difficulty-ramp': '📈 Level Up',
    general:           '💡 General',
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-white relative pb-20 pt-8">
      <div className="glow-orb bg-indigo-500/8 w-[500px] h-[500px] top-10 left-10" />
      <div className="glow-orb bg-purple-500/8 w-[400px] h-[400px] bottom-10 right-10" />
      <div className="absolute inset-0 cyber-grid opacity-[0.10] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-12 relative z-10 space-y-8">

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
                Recommendations
                <Sparkles size={20} className="text-indigo-400 animate-pulse" />
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Personalized learning plan based on your skill gaps.</p>
            </div>
          </div>
          <button
            onClick={regenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/15 hover:scale-[1.02] transition-all"
          >
            <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'Refresh Plan'}
          </button>
        </div>

        {/* Progress Summary */}
        {total > 0 && (
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-5">
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <CheckCircle size={22} className="text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-white">{completed} / {total} items completed</span>
                <span className="text-[10px] font-black text-indigo-400">{progressPct}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="glass-panel p-5 rounded-2xl border border-white/5 animate-pulse h-28" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
            <Layers size={40} className="text-gray-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-white">No Recommendations Yet</h3>
            <p className="text-gray-500 text-xs mt-2 max-w-sm mx-auto">Complete a mock interview session, then click "Refresh Plan" to generate personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, recs]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                  {categoryLabels[category] || category}
                  <span className="text-[10px] font-bold text-gray-600 normal-case">({recs.length})</span>
                </h2>
                <div className="space-y-3">
                  {recs.map((rec, i) => (
                    <RecommendationCard
                      key={rec.id || i}
                      recommendation={rec}
                      onMarkComplete={handleMarkComplete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

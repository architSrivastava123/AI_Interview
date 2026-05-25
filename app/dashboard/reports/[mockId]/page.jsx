"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Loader2, CheckCircle2, XCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import SkillRadar from '../../_components/SkillRadar';
import ScoreCard from '../../_components/ScoreCard';

export default function ReportPage({ params }) {
  const { user } = useUser();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const mockId = params?.mockId;

  const fetchReport = useCallback(async () => {
    if (!mockId) return;
    try {
      const res = await fetch(`/api/reports?mockId=${mockId}`);
      if (res.status === 404) {
        setReport(null);
      } else if (!res.ok) {
        throw new Error('Failed');
      } else {
        const data = await res.json();
        setReport(data.report);
      }
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [mockId]);

  const generateReport = async () => {
    if (!user?.primaryEmailAddress?.emailAddress || !mockId) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockId, userEmail: user.primaryEmailAddress.emailAddress }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReport(data.report);
      toast.success('Report generated!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async (format) => {
    const url = `/api/export?userEmail=${encodeURIComponent(user?.primaryEmailAddress?.emailAddress || '')}&type=session&mockId=${mockId}&format=${format}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `report_${mockId}.${format}`;
      link.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    }
  };

  // Parse report data
  let parsedData = null;
  if (report?.reportData) {
    try { parsedData = JSON.parse(report.reportData); } catch { parsedData = null; }
  }
  if (report?.parsedData) parsedData = report.parsedData;

  const scores = parsedData?.scores ? {
    compositeScore: parsedData.scores.composite,
    technicalScore: parsedData.scores.technical,
    fluencyScore: parsedData.scores.fluency,
    paceScore: parsedData.scores.pace,
    confidenceScore: parsedData.scores.confidence,
    communicationScore: parsedData.scores.communication,
  } : {};

  const radarData = parsedData?.radarData || [];
  const questionDetails = parsedData?.questionDetails || [];
  const strengths = parsedData?.strengths || JSON.parse(report?.strengths || '[]');
  const weaknesses = parsedData?.weaknesses || JSON.parse(report?.weaknesses || '[]');
  const nextSteps = parsedData?.nextSteps || JSON.parse(report?.nextSteps || '[]');

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
                Session Report
                <FileText size={20} className="text-indigo-400" />
              </h1>
              <p className="text-gray-400 text-xs mt-0.5 font-mono">{mockId}</p>
            </div>
          </div>

          {report && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
              >
                <Download size={12} /> JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-bold transition-all"
              >
                <Download size={12} /> CSV
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="glass-panel p-12 rounded-3xl border border-white/5 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-400 h-10 w-10" />
          </div>
        ) : !report ? (
          <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
            <FileText size={40} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Report Generated Yet</h3>
            <p className="text-gray-500 text-xs mt-2 max-w-sm mx-auto">Generate a full report to get an executive summary, skill breakdown, and export options.</p>
            <button
              onClick={generateReport}
              disabled={generating}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg mx-auto hover:scale-[1.02] transition-all"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ) : (
          <>
            {/* Executive Summary */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-3">
                <FileText size={11} /> Executive Summary
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{report.executiveSummary}</p>
            </div>

            {/* Score Card + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreCard scores={scores} grade={report.grade || 'N/A'} percentile={parsedData?.percentile || 0} />
              <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-4 self-start">Skill Radar</p>
                {radarData.length > 0 ? (
                  <SkillRadar data={radarData} size={240} />
                ) : (
                  <div className="text-gray-500 text-sm">No radar data</div>
                )}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-3">
                  <CheckCircle2 size={11} /> Strengths
                </p>
                <ul className="space-y-2">
                  {(Array.isArray(strengths) ? strengths : []).map((s, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0 mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-panel p-6 rounded-3xl border border-rose-500/10 bg-gradient-to-br from-rose-500/5 to-transparent">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-1.5 mb-3">
                  <XCircle size={11} /> Areas to Improve
                </p>
                <ul className="space-y-2">
                  {(Array.isArray(weaknesses) ? weaknesses : []).map((w, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-rose-400 shrink-0 mt-0.5">!</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 to-transparent">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-4">
                  <BookOpen size={11} /> Recommended Next Steps
                </p>
                <div className="space-y-2">
                  {(Array.isArray(nextSteps) ? nextSteps : []).map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-gray-300">
                      <span className="text-indigo-400 font-black shrink-0 mt-0.5">{i + 1}.</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Breakdown Table */}
            {questionDetails.length > 0 && (
              <div className="glass-panel p-6 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">Question Breakdown</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['#', 'Question', 'Difficulty', 'Rating', 'WPM', 'Words', 'Label'].map(h => (
                          <th key={h} className="text-left pb-2 pr-4 text-[10px] font-black uppercase tracking-wider text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {questionDetails.map((q, i) => (
                        <tr key={i} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                          <td className="py-3 pr-4 text-gray-500">{q.questionNumber}</td>
                          <td className="py-3 pr-4 text-gray-300 max-w-[200px] truncate">{q.question}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              q.difficulty === 'Expert' ? 'bg-rose-500/15 text-rose-400' :
                              q.difficulty === 'Hard' ? 'bg-orange-500/15 text-orange-400' :
                              q.difficulty === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' :
                              'bg-emerald-500/15 text-emerald-400'
                            }`}>{q.difficulty}</span>
                          </td>
                          <td className="py-3 pr-4 font-black text-white">{q.rating}/10</td>
                          <td className="py-3 pr-4 text-cyan-400">{q.wpm > 0 ? `${q.wpm}` : '—'}</td>
                          <td className="py-3 pr-4 text-gray-400">{q.wordCount}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-[9px] font-bold ${
                              q.ratingLabel === 'Excellent' ? 'text-emerald-400' :
                              q.ratingLabel === 'Good' ? 'text-indigo-400' :
                              q.ratingLabel === 'Average' ? 'text-yellow-400' : 'text-rose-400'
                            }`}>{q.ratingLabel}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

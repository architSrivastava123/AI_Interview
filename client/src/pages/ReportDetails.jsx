import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportService } from '../services/reportService.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { DimensionRadar } from '../components/reports/DimensionRadar.jsx';
import { SkillGapList } from '../components/reports/SkillGapList.jsx';
import { QuestionReviewCard } from '../components/reports/QuestionReviewCard.jsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { formatDate } from '../utils/formatters.js';

export default function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const res = await reportService.getById(id);
        setReport(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load report:', err);
        setError(err.message || 'Report not found.');
        setIsLoading(false);
      }
    }

    loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner text="Compiling detailed performance synthesis and skill gaps..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-md text-xs text-rose-300 mb-4">
          {error || 'Report not found.'}
        </div>
        <Link to="/dashboard">
          <Button variant="secondary" size="sm">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PageHeader
        title={`${report.targetRole} Mock Interview Report`}
        description={`Completed on ${formatDate(report.createdAt, 'full')}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/interview/setup">
              <Button variant="outline" size="sm" className="gap-1.5">
                <RotateCcw size={13} />
                <span>Practice Again</span>
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button variant="primary" size="sm" className="gap-1.5">
                <BookOpen size={13} />
                <span>View Practice Plan</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Top Banner: Composite Score & Executive Summary */}
      <Card className="bg-gradient-to-br from-surface to-surface-raised border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-indigo-300 code-font leading-none">{report.grade}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">GRADE</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-400 code-font">OVERALL PERFORMANCE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-100 code-font">{report.overallScore}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300">
            <div>
              <span className="text-slate-500 block">Questions</span>
              <span className="font-semibold code-font text-slate-100">{report.totalQuestions}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Technical</span>
              <span className="font-semibold code-font text-slate-100">{report.technicalScore}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Fluency</span>
              <span className="font-semibold code-font text-slate-100">{report.fluencyScore}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Pace</span>
              <span className="font-semibold code-font text-slate-100">{report.paceScore}%</span>
            </div>
          </div>
        </div>

        {report.executiveSummary && (
          <div className="mt-4 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-200 block mb-1">Executive Summary:</span>
            {report.executiveSummary}
          </div>
        )}
      </Card>

      {/* Strengths and Weaknesses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400" />
              <CardTitle className="text-sm">Demonstrated Strengths</CardTitle>
            </div>
          </CardHeader>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <CardTitle className="text-sm">Key Areas for Improvement</CardTitle>
            </div>
          </CardHeader>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.weaknesses?.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Dimensions & Skill Gaps Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DimensionRadar report={report} />
        <SkillGapList skillGaps={report.skillGaps || []} targetRole={report.targetRole} />
      </div>

      {/* Question Summaries Breakdown */}
      {report.questionSummaries && report.questionSummaries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">Question-by-Question Review</h3>
          {report.questionSummaries.map((q, idx) => (
            <QuestionReviewCard key={idx} item={q} order={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { FileText, ArrowRight, RotateCcw } from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const res = await reportService.list();
        setReports(res.data || []);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <LoadingSpinner text="Loading interview reports history..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Interview Performance Reports"
        description="Review comprehensive feedback, scoring breakdowns, and question evaluations from past sessions."
        actions={
          <Link to="/interview/setup">
            <Button variant="primary" size="sm">New Mock Interview</Button>
          </Link>
        }
      />

      {reports.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400 mb-3">
            <FileText size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">No completed reports yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Complete your first technical mock interview to receive a full diagnostic report.
          </p>
          <Link to="/interview/setup">
            <Button variant="primary" size="sm">Start Mock Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report._id} className="hover:border-slate-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center flex-shrink-0">
                    <span className="text-base font-bold text-slate-100 code-font leading-none">{report.grade}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">GRADE</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{report.targetRole}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{formatDate(report.createdAt)}</span>
                      <span>·</span>
                      <span className="code-font text-indigo-400 font-medium">Overall Score: {report.overallScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link to={`/reports/${report._id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                      <span>View Full Report</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ReadinessCard } from '../components/dashboard/ReadinessCard.jsx';
import { PerformanceChart } from '../components/dashboard/PerformanceChart.jsx';
import { RecentInterviews } from '../components/dashboard/RecentInterviews.jsx';
import { SkillSummary } from '../components/dashboard/SkillSummary.jsx';
import { Button } from '../components/ui/Button.jsx';
import { analyticsService } from '../services/analyticsService.js';
import { interviewService } from '../services/interviewService.js';
import { Target, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [analyticsRes, interviewsRes] = await Promise.all([
          analyticsService.get().catch(() => ({ data: {} })),
          interviewService.list().catch(() => ({ data: [] })),
        ]);
        setAnalytics(analyticsRes.data || {});
        setInterviews(interviewsRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <LoadingSpinner text="Aggregating performance analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Developer'}`}
        description="Monitor your technical interview readiness, speaking pace, and practice recommendations."
        actions={
          <Link to="/interview/setup">
            <Button variant="primary" size="md" className="gap-2">
              <Plus size={15} />
              <span>Start Mock Interview</span>
            </Button>
          </Link>
        }
      />

      {/* Top row: Readiness & Streak */}
      <div className="mb-6">
        <ReadinessCard analytics={analytics} />
      </div>

      {/* Main Grid: Chart & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart trendData={analytics.performanceTrend} />
        </div>
        <div>
          <SkillSummary averageScores={analytics.averageScores} />
        </div>
      </div>

      {/* Bottom Grid: Recent Interviews */}
      <div>
        <RecentInterviews interviews={interviews} />
      </div>
    </div>
  );
}

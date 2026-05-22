import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq, desc } from 'drizzle-orm';
import { InterviewSession, CandidateScore, AnalyticsSnapshot } from '../../../utils/schema';
import {
  buildPerformanceTrend,
  computeImprovementVelocity,
  getDomainBreakdown,
  computeStreakData,
  rankSessionsByPerformance,
} from '../../../utils/engines/analyticsEngine';
import moment from 'moment';

/**
 * GET /api/progress?userEmail=...
 * Returns full performance history with trends, records, and comparisons.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    const [sessions, scores] = await Promise.all([
      db.select().from(InterviewSession).where(eq(InterviewSession.userEmail, userEmail)),
      db.select().from(CandidateScore).where(eq(CandidateScore.userEmail, userEmail)),
    ]);

    if (sessions.length === 0) {
      return NextResponse.json({
        progress: {
          sessions: [],
          trend: [],
          domainBreakdown: [],
          streaks: { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 },
          velocity: { velocity: 0, trend: 'insufficient_data', changePercent: 0 },
          records: {
            bestSession: null,
            worstSession: null,
            bestScore: 0,
            totalSessions: 0,
            overallImprovement: 0,
          },
        },
      }, { status: 200 });
    }

    // Time-order sessions
    const sortedSessions = [...sessions].sort((a, b) => {
      const da = moment(a.completedAt || a.createdAt, ['DD-MM-YYYY', 'YYYY-MM-DD']).valueOf();
      const db2 = moment(b.completedAt || b.createdAt, ['DD-MM-YYYY', 'YYYY-MM-DD']).valueOf();
      return da - db2;
    });

    const trend = buildPerformanceTrend(sessions);
    const velocity = computeImprovementVelocity(sortedSessions);
    const domainBreakdown = getDomainBreakdown(sessions);
    const streaks = computeStreakData(sessions);
    const ranked = rankSessionsByPerformance(sessions);

    const bestSession = ranked[0] || null;
    const worstSession = ranked[ranked.length - 1] || null;
    const firstScore = Number(sortedSessions[0]?.compositeScore) || 0;
    const lastScore = Number(sortedSessions[sortedSessions.length - 1]?.compositeScore) || 0;
    const overallImprovement = Math.round(lastScore - firstScore);

    // Score dimension history for timeline
    const scoreDimensionHistory = scores.map(s => ({
      mockId: s.mockIdRef,
      technicalScore: s.technicalScore,
      fluencyScore: s.fluencyScore,
      paceScore: s.paceScore,
      confidenceScore: s.confidenceScore,
      communicationScore: s.communicationScore,
      compositeScore: s.compositeScore,
      grade: s.grade,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      progress: {
        sessions: sortedSessions,
        trend,
        domainBreakdown,
        streaks,
        velocity,
        scoreDimensionHistory,
        records: {
          bestSession: bestSession ? {
            mockId: bestSession.mockIdRef,
            score: Number(bestSession.compositeScore),
            grade: bestSession.grade,
            track: bestSession.jobTrack,
            completedAt: bestSession.completedAt,
          } : null,
          worstSession: worstSession ? {
            mockId: worstSession.mockIdRef,
            score: Number(worstSession.compositeScore),
            grade: worstSession.grade,
            track: worstSession.jobTrack,
            completedAt: worstSession.completedAt,
          } : null,
          bestScore: bestSession ? Number(bestSession.compositeScore) : 0,
          totalSessions: sessions.length,
          overallImprovement,
        },
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/progress] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

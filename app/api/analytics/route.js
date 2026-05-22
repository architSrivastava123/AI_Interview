import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { InterviewSession, CandidateScore, AnalyticsSnapshot } from '../../../utils/schema';
import {
  buildPerformanceTrend,
  computeSkillGapMatrix,
  computeImprovementVelocity,
  getDomainBreakdown,
  computeStreakData,
  generateAnalyticsSnapshot,
  rankSessionsByPerformance,
} from '../../../utils/engines/analyticsEngine';
import moment from 'moment';

/**
 * GET /api/analytics?userEmail=...
 * Returns a full AnalyticsSnapshot with trend data, domain breakdown, streaks, and velocity.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    // Fetch all sessions and scores for the user
    const sessions = await db
      .select()
      .from(InterviewSession)
      .where(eq(InterviewSession.userEmail, userEmail));

    const scores = await db
      .select()
      .from(CandidateScore)
      .where(eq(CandidateScore.userEmail, userEmail));

    // Determine most common track for skill gap
    const trackCounts = {};
    for (const s of sessions) {
      const t = s.jobTrack || 'General';
      trackCounts[t] = (trackCounts[t] || 0) + 1;
    }
    const primaryTrack = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

    // Compute analytics
    const trend = buildPerformanceTrend(sessions);
    const skillGap = computeSkillGapMatrix(scores, primaryTrack);
    const velocity = computeImprovementVelocity(sessions);
    const domainBreakdown = getDomainBreakdown(sessions);
    const streaks = computeStreakData(sessions);
    const ranked = rankSessionsByPerformance(sessions);

    // Build snapshot
    const snapshot = generateAnalyticsSnapshot(userEmail, sessions, scores);

    // Persist the latest snapshot (upsert by date)
    await db.delete(AnalyticsSnapshot)
      .where(eq(AnalyticsSnapshot.userEmail, userEmail));
    await db.insert(AnalyticsSnapshot).values(snapshot);

    return NextResponse.json({
      analytics: {
        ...snapshot,
        trend,
        skillGap,
        velocity,
        domainBreakdown,
        streaks,
        rankedSessions: ranked.slice(0, 5), // top 5
        primaryTrack,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/analytics] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

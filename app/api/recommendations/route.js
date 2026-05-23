import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { InterviewSession, CandidateScore, Recommendation } from '../../../utils/schema';
import {
  identifyWeakSkills,
  mapSkillsToResources,
  prioritizeRecommendations,
  getNextInterviewSuggestion,
  getDifficultyRampPlan,
} from '../../../utils/engines/recommendationEngine';
import { computeSkillGapMatrix } from '../../../utils/engines/analyticsEngine';
import moment from 'moment';

/**
 * GET /api/recommendations?userEmail=...
 * Returns the current recommendation list for a user.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    const recommendations = await db
      .select()
      .from(Recommendation)
      .where(eq(Recommendation.userEmail, userEmail));

    // If no recommendations exist yet, generate basic ones from sessions
    if (recommendations.length === 0) {
      const sessions = await db
        .select()
        .from(InterviewSession)
        .where(eq(InterviewSession.userEmail, userEmail));

      const nextSuggestion = getNextInterviewSuggestion(sessions);
      const rampPlan = getDifficultyRampPlan(sessions);

      const fresh = [];
      if (nextSuggestion) {
        fresh.push({
          category: 'next-session',
          title: `Start with: ${nextSuggestion.track} Interview`,
          description: nextSuggestion.reason,
          resourceUrl: '',
          resourceType: 'action',
          priority: 1,
          impactScore: 30,
          targetSkill: 'practice',
          difficulty: nextSuggestion.difficulty,
          estimatedHours: 1,
          userEmail,
          createdAt: moment().format('DD-MM-YYYY'),
        });
      }
      if (rampPlan.length > 0) {
        fresh.push({
          category: 'difficulty-ramp',
          title: rampPlan[0].description,
          description: `Target score: ${rampPlan[0].targetScore}+`,
          resourceUrl: '',
          resourceType: 'action',
          priority: 2,
          impactScore: 20,
          targetSkill: 'challenge',
          difficulty: rampPlan[0].difficulty,
          estimatedHours: 0.5,
          userEmail,
          createdAt: moment().format('DD-MM-YYYY'),
        });
      }

      return NextResponse.json({ recommendations: fresh }, { status: 200 });
    }

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/recommendations] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Generates and persists fresh recommendations based on latest session.
 *
 * Body: { userEmail: string, mockId?: string, track?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, mockId, track } = body;

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    const [sessions, scores] = await Promise.all([
      db.select().from(InterviewSession).where(eq(InterviewSession.userEmail, userEmail)),
      db.select().from(CandidateScore).where(eq(CandidateScore.userEmail, userEmail)),
    ]);

    const primaryTrack = track || sessions[sessions.length - 1]?.jobTrack || 'General';
    const skillGap = computeSkillGapMatrix(scores, primaryTrack);
    const weakSkills = identifyWeakSkills(skillGap);
    const rawRecs = mapSkillsToResources(weakSkills, primaryTrack);

    const nextSuggestion = getNextInterviewSuggestion(sessions);
    if (nextSuggestion) {
      rawRecs.push({
        category: 'next-session',
        title: `Recommended Next: ${nextSuggestion.track}`,
        description: nextSuggestion.reason,
        resourceUrl: '',
        resourceType: 'action',
        priority: 2,
        impactScore: 25,
        targetSkill: 'practice',
        difficulty: nextSuggestion.difficulty,
        estimatedHours: 1,
      });
    }

    const prioritized = prioritizeRecommendations(rawRecs);

    const toInsert = prioritized.map(r => ({
      userEmail,
      mockIdRef: mockId || null,
      category: r.category || 'general',
      title: r.title,
      description: r.description,
      resourceUrl: r.resourceUrl || '',
      resourceType: r.resourceType || 'article',
      priority: r.priority || 5,
      impactScore: r.impactScore || 0,
      targetSkill: r.targetSkill || '',
      difficulty: r.difficulty || 'Medium',
      estimatedHours: r.estimatedHours || 1,
      createdAt: moment().format('DD-MM-YYYY'),
    }));

    // Replace existing recommendations for this user
    await db.delete(Recommendation).where(eq(Recommendation.userEmail, userEmail));
    const inserted = await db.insert(Recommendation).values(toInsert).returning();

    return NextResponse.json(
      { message: 'Recommendations generated', recommendations: inserted },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/recommendations] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

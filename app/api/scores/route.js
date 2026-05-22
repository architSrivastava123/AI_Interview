import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { UserAnswer, CandidateScore, InterviewSession, MockInterview } from '../../../utils/schema';
import { computeSessionScore, getBenchmarkPercentile, scoreToGrade } from '../../../utils/engines/scoringEngine';
import moment from 'moment';

/**
 * POST /api/scores
 * Computes and persists a CandidateScore for a completed interview session.
 *
 * Body: { mockId: string, userEmail: string, track?: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { mockId, userEmail, track } = body;

    if (!mockId || !userEmail) {
      return NextResponse.json(
        { message: 'mockId and userEmail are required' },
        { status: 400 }
      );
    }

    // Fetch all answers for this session
    const answers = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, mockId));

    if (answers.length === 0) {
      return NextResponse.json(
        { message: 'No answers found for the given mockId' },
        { status: 404 }
      );
    }

    // Compute multi-dimensional scores
    const scoreData = computeSessionScore(answers);
    const domain = track || 'General';
    const percentile = getBenchmarkPercentile(scoreData.compositeScore, domain);

    const scoreRecord = {
      mockIdRef: mockId,
      userEmail,
      technicalScore: scoreData.technicalScore,
      fluencyScore: scoreData.fluencyScore,
      paceScore: scoreData.paceScore,
      confidenceScore: scoreData.confidenceScore,
      communicationScore: scoreData.communicationScore,
      compositeScore: scoreData.compositeScore,
      grade: scoreToGrade(scoreData.compositeScore),
      percentile,
      rawRatingAvg: scoreData.rawRatingAvg,
      totalFillerWords: scoreData.totalFillerWords,
      avgWpm: scoreData.avgWpm,
      scoreMetadata: JSON.stringify({ computedAt: moment().toISOString(), answerCount: answers.length }),
      createdAt: moment().format('DD-MM-YYYY'),
    };

    // Upsert: delete existing then insert
    await db.delete(CandidateScore).where(eq(CandidateScore.mockIdRef, mockId));
    const inserted = await db.insert(CandidateScore).values(scoreRecord).returning();

    // Also upsert the InterviewSession record
    await db.delete(InterviewSession).where(eq(InterviewSession.mockIdRef, mockId));
    await db.insert(InterviewSession).values({
      mockIdRef: mockId,
      userEmail,
      jobTrack: domain,
      totalQuestions: answers.length,
      compositeScore: scoreData.compositeScore,
      grade: scoreToGrade(scoreData.compositeScore),
      percentile,
      isCompleted: true,
      completedAt: moment().format('DD-MM-YYYY'),
      createdAt: moment().format('DD-MM-YYYY'),
    });

    return NextResponse.json(
      { message: 'Score computed and stored', score: inserted[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/scores] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scores?mockId=...
 * Retrieves score record for a given session.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');

    if (!mockId) {
      return NextResponse.json({ message: 'mockId is required' }, { status: 400 });
    }

    const scores = await db
      .select()
      .from(CandidateScore)
      .where(eq(CandidateScore.mockIdRef, mockId));

    if (scores.length === 0) {
      return NextResponse.json({ message: 'Score not found for this session' }, { status: 404 });
    }

    return NextResponse.json({ score: scores[0] }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/scores] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

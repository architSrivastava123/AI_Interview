import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { UserAnswer, CandidateScore, InterviewSession } from '../../../utils/schema';

/**
 * POST /api/fetchUserData
 * Fetches user answers and optionally enriched score/session data.
 *
 * Body: { userEmail: string, includeScores?: boolean, includeAnalytics?: boolean }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, includeScores = false, includeAnalytics = false } = body;

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    // Base query: user answers
    const userAnswers = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.userEmail, userEmail));

    const response = {
      userAnswers: userAnswers.length > 0 ? userAnswers : [],
    };

    // Optional: include score dimension data
    if (includeScores) {
      const scores = await db
        .select()
        .from(CandidateScore)
        .where(eq(CandidateScore.userEmail, userEmail));
      response.scores = scores;
    }

    // Optional: include session metadata
    if (includeAnalytics) {
      const sessions = await db
        .select()
        .from(InterviewSession)
        .where(eq(InterviewSession.userEmail, userEmail));
      response.sessions = sessions;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('[POST /api/fetchUserData] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}
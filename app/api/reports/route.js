import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { UserAnswer, MockInterview, CandidateScore, GeneratedReport } from '../../../utils/schema';
import { buildSessionReport } from '../../../utils/engines/reportEngine';
import moment from 'moment';

/**
 * POST /api/reports
 * Generates and persists a full interview report for a session.
 *
 * Body: { mockId: string, userEmail: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { mockId, userEmail } = body;

    if (!mockId || !userEmail) {
      return NextResponse.json(
        { message: 'mockId and userEmail are required' },
        { status: 400 }
      );
    }

    // Fetch session, answers, and scores in parallel
    const [sessions, answers, scores] = await Promise.all([
      db.select().from(MockInterview).where(eq(MockInterview.mockId, mockId)),
      db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, mockId)),
      db.select().from(CandidateScore).where(eq(CandidateScore.mockIdRef, mockId)),
    ]);

    if (sessions.length === 0) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const scoreRecord = scores[0] || null;

    // Generate report
    const report = buildSessionReport(session, answers, scoreRecord);

    // Upsert report
    await db.delete(GeneratedReport).where(eq(GeneratedReport.mockIdRef, mockId));
    const inserted = await db.insert(GeneratedReport).values({
      ...report,
      exportedAt: moment().format('DD-MM-YYYY HH:mm:ss'),
    }).returning();

    return NextResponse.json(
      { message: 'Report generated', report: inserted[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/reports] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports?mockId=...
 * Retrieves an existing report for a session.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');

    if (!mockId) {
      return NextResponse.json({ message: 'mockId is required' }, { status: 400 });
    }

    const reports = await db
      .select()
      .from(GeneratedReport)
      .where(eq(GeneratedReport.mockIdRef, mockId));

    if (reports.length === 0) {
      return NextResponse.json({ message: 'Report not found for this session' }, { status: 404 });
    }

    const report = reports[0];
    // Parse JSON blob for client convenience
    let parsedData = null;
    try {
      parsedData = report.reportData ? JSON.parse(report.reportData) : null;
    } catch {
      parsedData = null;
    }

    return NextResponse.json({ report: { ...report, parsedData } }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/reports] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

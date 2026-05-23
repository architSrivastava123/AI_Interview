import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { eq } from 'drizzle-orm';
import { UserAnswer, MockInterview, InterviewSession, CandidateScore, GeneratedReport } from '../../../utils/schema';
import { generateExportData, buildSessionReport, buildProgressReport } from '../../../utils/engines/reportEngine';
import { generateAnalyticsSnapshot } from '../../../utils/engines/analyticsEngine';
import moment from 'moment';

/**
 * GET /api/export?userEmail=...&format=json|csv&type=progress|session&mockId=...
 * Exports candidate data in the requested format.
 *
 * Query params:
 *   - userEmail (required)
 *   - format: 'json' (default) | 'csv'
 *   - type: 'progress' (default) | 'session'
 *   - mockId: required when type=session
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    const format = searchParams.get('format') || 'json';
    const type = searchParams.get('type') || 'progress';
    const mockId = searchParams.get('mockId');

    if (!userEmail) {
      return NextResponse.json({ message: 'userEmail is required' }, { status: 400 });
    }

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { message: "Invalid format. Use 'json' or 'csv'" },
        { status: 400 }
      );
    }

    let exportString = '';
    let filename = '';

    if (type === 'session') {
      // Export single session report
      if (!mockId) {
        return NextResponse.json({ message: 'mockId is required for session export' }, { status: 400 });
      }

      // Check for existing generated report first
      const existingReports = await db
        .select()
        .from(GeneratedReport)
        .where(eq(GeneratedReport.mockIdRef, mockId));

      let reportData;
      if (existingReports.length > 0 && existingReports[0].reportData) {
        try {
          reportData = JSON.parse(existingReports[0].reportData);
        } catch {
          reportData = existingReports[0];
        }
      } else {
        // Build report on-the-fly
        const [sessions, answers, scores] = await Promise.all([
          db.select().from(MockInterview).where(eq(MockInterview.mockId, mockId)),
          db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, mockId)),
          db.select().from(CandidateScore).where(eq(CandidateScore.mockIdRef, mockId)),
        ]);

        if (sessions.length === 0) {
          return NextResponse.json({ message: 'Session not found' }, { status: 404 });
        }

        const report = buildSessionReport(sessions[0], answers, scores[0] || null);
        reportData = JSON.parse(report.reportData);
      }

      exportString = generateExportData(reportData, format);
      filename = `interview_report_${mockId}.${format}`;
    } else {
      // Export full progress report
      const [sessions, scores] = await Promise.all([
        db.select().from(InterviewSession).where(eq(InterviewSession.userEmail, userEmail)),
        db.select().from(CandidateScore).where(eq(CandidateScore.userEmail, userEmail)),
      ]);

      const analytics = generateAnalyticsSnapshot(userEmail, sessions, scores);
      const progressReport = buildProgressReport(sessions, analytics);

      if (format === 'csv') {
        // Build a CSV from progress report sessions
        const rows = [
          ['Session #', 'Track', 'Score', 'Grade', 'Velocity', 'Completed At'].join(','),
          ...(progressReport.trend || []).map((t, i) =>
            [i + 1, t.track, t.score, t.grade, '', t.date].join(',')
          ),
        ];
        exportString = rows.join('\n');
      } else {
        exportString = generateExportData(progressReport, 'json');
      }

      filename = `progress_report_${userEmail.split('@')[0]}_${moment().format('YYYY-MM-DD')}.${format}`;
    }

    const contentType = format === 'csv' ? 'text/csv' : 'application/json';

    return new Response(exportString, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('[GET /api/export] Error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
}

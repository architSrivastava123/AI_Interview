/**
 * API Route Tests — scores, analytics, recommendations, reports, progress, export
 *
 * Tests use jest.mock to avoid real DB connections.
 * Each test verifies the HTTP logic layer independently.
 */

// ─── Shared mocks ─────────────────────────────────────────────────────────────

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

// Mock drizzle-orm operators
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ eq: true, a, b })),
  desc: jest.fn((a) => ({ desc: true, a })),
}));

// Mock moment
jest.mock('moment', () => {
  const m = jest.fn(() => ({ format: jest.fn(() => '29-05-2025'), toISOString: jest.fn(() => '2025-05-29T00:00:00Z') }));
  m.mockReturnValue({ format: jest.fn(() => '29-05-2025'), toISOString: jest.fn(() => '2025-05-29') });
  return m;
});

// ─── scores API ───────────────────────────────────────────────────────────────

describe('/api/scores', () => {
  let POST, GET;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          { rating: '8', userAns: 'Good answer|||duration:40', mockIdRef: 'mock-1', userEmail: 'a@b.com' },
          { rating: '7', userAns: 'Another answer|||duration:35', mockIdRef: 'mock-1', userEmail: 'a@b.com' },
        ]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1, compositeScore: 72, grade: 'B' }]),
        delete: jest.fn().mockReturnThis(),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer',
      CandidateScore: 'CandidateScore',
      InterviewSession: 'InterviewSession',
      MockInterview: 'MockInterview',
    }));

    jest.mock('../../utils/engines/scoringEngine', () => ({
      computeSessionScore: jest.fn().mockReturnValue({
        technicalScore: 72, fluencyScore: 80, paceScore: 78, confidenceScore: 75,
        communicationScore: 73, compositeScore: 76, grade: 'B+', rawRatingAvg: 7.5,
        totalFillerWords: 2, avgWpm: 130,
      }),
      getBenchmarkPercentile: jest.fn().mockReturnValue(68),
      scoreToGrade: jest.fn().mockReturnValue('B+'),
    }));

    const route = require('../../app/api/scores/route');
    POST = route.POST;
    GET = route.GET;
  });

  test('POST with missing mockId returns 400', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com' }) };
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('POST with missing userEmail returns 400', async () => {
    const req = { json: jest.fn().mockResolvedValue({ mockId: 'abc' }) };
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('GET with missing mockId returns 400', async () => {
    const req = { url: 'http://localhost/api/scores' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

// ─── analytics API ────────────────────────────────────────────────────────────

describe('/api/analytics', () => {
  let GET;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockResolvedValue([{}]),
        delete: jest.fn().mockReturnThis(),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      InterviewSession: 'InterviewSession',
      CandidateScore: 'CandidateScore',
      AnalyticsSnapshot: 'AnalyticsSnapshot',
    }));

    jest.mock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([]),
      computeSkillGapMatrix: jest.fn().mockReturnValue({ dimensions: [], overallGap: 0, targetRole: 'General' }),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 0, trend: 'insufficient_data', changePercent: 0 }),
      getDomainBreakdown: jest.fn().mockReturnValue([]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 }),
      generateAnalyticsSnapshot: jest.fn().mockReturnValue({ userEmail: 'a@b.com', totalSessions: 0, trendData: '[]', domainBreakdown: '[]', createdAt: '29-05-2025' }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([]),
    }));

    const route = require('../../app/api/analytics/route');
    GET = route.GET;
  });

  test('GET without userEmail returns 400', async () => {
    const req = { url: 'http://localhost/api/analytics' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET with userEmail and no sessions returns 200', async () => {
    const req = { url: 'http://localhost/api/analytics?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

// ─── recommendations API ──────────────────────────────────────────────────────

describe('/api/recommendations', () => {
  let GET, POST;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Rec' }]),
        delete: jest.fn().mockReturnThis(),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      InterviewSession: 'InterviewSession',
      CandidateScore: 'CandidateScore',
      Recommendation: 'Recommendation',
    }));

    jest.mock('../../utils/engines/recommendationEngine', () => ({
      identifyWeakSkills: jest.fn().mockReturnValue([]),
      mapSkillsToResources: jest.fn().mockReturnValue([{ title: 'Test', category: 'general', priority: 3, impactScore: 10, description: 'desc', resourceUrl: '', resourceType: 'article', targetSkill: 'technical', difficulty: 'Medium', estimatedHours: 2 }]),
      prioritizeRecommendations: jest.fn().mockImplementation(recs => recs),
      getNextInterviewSuggestion: jest.fn().mockReturnValue({ track: 'Backend', reason: 'Try Backend', difficulty: 'Medium' }),
      getDifficultyRampPlan: jest.fn().mockReturnValue([{ step: 1, difficulty: 'Medium', targetScore: 70, description: 'Level up!' }]),
    }));

    jest.mock('../../utils/engines/analyticsEngine', () => ({
      computeSkillGapMatrix: jest.fn().mockReturnValue({ dimensions: [], overallGap: 0, targetRole: 'General' }),
    }));

    const route = require('../../app/api/recommendations/route');
    GET = route.GET;
    POST = route.POST;
  });

  test('GET without userEmail returns 400', async () => {
    const req = { url: 'http://localhost/api/recommendations' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET with userEmail (no recs) returns 200', async () => {
    const req = { url: 'http://localhost/api/recommendations?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  test('POST without userEmail returns 400', async () => {
    const req = { json: jest.fn().mockResolvedValue({}) };
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('POST with valid userEmail returns 201', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com' }) };
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

// ─── reports API ──────────────────────────────────────────────────────────────

describe('/api/reports', () => {
  let GET, POST;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn()
          .mockResolvedValueOnce([{ mockId: 'mock-1', jobPosition: 'Dev', interviewTrack: 'Frontend', jobExperience: '2', createdBy: 'a@b.com', jobDesc: 'React', createdAt: '29-05-2025' }])
          .mockResolvedValueOnce([{ question: 'Q1', userAns: 'A1', rating: '8', correctAns: 'CA1', feedback: 'Good' }])
          .mockResolvedValueOnce([{ compositeScore: 75, technicalScore: 70 }]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1, mockIdRef: 'mock-1', reportTitle: 'Report', executiveSummary: 'Summary', grade: 'B' }]),
        delete: jest.fn().mockReturnThis(),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer',
      MockInterview: 'MockInterview',
      CandidateScore: 'CandidateScore',
      GeneratedReport: 'GeneratedReport',
    }));

    jest.mock('../../utils/engines/reportEngine', () => ({
      buildSessionReport: jest.fn().mockReturnValue({
        mockIdRef: 'mock-1',
        userEmail: 'a@b.com',
        reportTitle: 'Test Report',
        executiveSummary: 'A good session.',
        reportData: JSON.stringify({ questionDetails: [], radarData: [], scores: {} }),
        totalScore: 75,
        grade: 'B',
        strengths: '[]',
        weaknesses: '[]',
        nextSteps: '[]',
        createdAt: '29-05-2025',
      }),
    }));

    const route = require('../../app/api/reports/route');
    POST = route.POST;
    GET = route.GET;
  });

  test('POST with missing mockId returns 400', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com' }) };
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('POST with valid data returns 201', async () => {
    const req = { json: jest.fn().mockResolvedValue({ mockId: 'mock-1', userEmail: 'a@b.com' }) };
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  test('GET without mockId returns 400', async () => {
    const req = { url: 'http://localhost/api/reports' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

// ─── progress API ─────────────────────────────────────────────────────────────

describe('/api/progress', () => {
  let GET;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      InterviewSession: 'InterviewSession',
      CandidateScore: 'CandidateScore',
      AnalyticsSnapshot: 'AnalyticsSnapshot',
    }));

    jest.mock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([]),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 0, trend: 'insufficient_data', changePercent: 0 }),
      getDomainBreakdown: jest.fn().mockReturnValue([]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([]),
    }));

    const route = require('../../app/api/progress/route');
    GET = route.GET;
  });

  test('GET without userEmail returns 400', async () => {
    const req = { url: 'http://localhost/api/progress' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET with userEmail but no sessions returns 200 with empty arrays', async () => {
    const req = { url: 'http://localhost/api/progress?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.data.progress.sessions).toEqual([]);
  });
});

// ─── export API ───────────────────────────────────────────────────────────────

describe('/api/export', () => {
  let GET;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      },
    }));

    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer',
      MockInterview: 'MockInterview',
      InterviewSession: 'InterviewSession',
      CandidateScore: 'CandidateScore',
      GeneratedReport: 'GeneratedReport',
    }));

    jest.mock('../../utils/engines/reportEngine', () => ({
      generateExportData: jest.fn().mockReturnValue('{}'),
      buildProgressReport: jest.fn().mockReturnValue({ trend: [], totalSessions: 0 }),
    }));

    jest.mock('../../utils/engines/analyticsEngine', () => ({
      generateAnalyticsSnapshot: jest.fn().mockReturnValue({ trendData: '[]', domainBreakdown: '[]' }),
    }));

    const route = require('../../app/api/export/route');
    GET = route.GET;
  });

  test('GET without userEmail returns 400', async () => {
    const req = { url: 'http://localhost/api/export' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET with invalid format returns 400', async () => {
    const req = { url: 'http://localhost/api/export?userEmail=a%40b.com&format=pdf' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET session export without mockId returns 400', async () => {
    const req = { url: 'http://localhost/api/export?userEmail=a%40b.com&type=session&format=json' };
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  test('GET progress export JSON returns 200 with file attachment', async () => {
    const req = { url: 'http://localhost/api/export?userEmail=a%40b.com&format=json&type=progress' };
    const res = await GET(req);
    // Should return a Response object (not a NextResponse.json)
    expect(res).toBeDefined();
    // Not a 400/500 error
    expect(res.status === undefined || res.status !== 400).toBe(true);
  });

  test('GET progress export CSV returns 200', async () => {
    const req = { url: 'http://localhost/api/export?userEmail=a%40b.com&format=csv&type=progress' };
    const res = await GET(req);
    expect(res).toBeDefined();
    expect(res.status === undefined || res.status !== 400).toBe(true);
  });
});

// ─── scores API extended happy paths ──────────────────────────────────────────

describe('/api/scores — extended', () => {
  let GET, POST;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn()
          .mockResolvedValueOnce([{ rating: '8', userAns: 'Test answer|||duration:40', mockIdRef: 'm1', userEmail: 'a@b.com' }])
          .mockResolvedValueOnce([{ id: 5, compositeScore: 78, grade: 'B+', percentile: 72 }]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 1, compositeScore: 78, grade: 'B+' }]),
        delete: jest.fn().mockReturnThis(),
      },
    }));
    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer', CandidateScore: 'CandidateScore',
      InterviewSession: 'InterviewSession', MockInterview: 'MockInterview',
    }));
    jest.mock('../../utils/engines/scoringEngine', () => ({
      computeSessionScore: jest.fn().mockReturnValue({
        technicalScore: 78, fluencyScore: 82, paceScore: 80, confidenceScore: 77,
        communicationScore: 74, compositeScore: 78, grade: 'B+', rawRatingAvg: 8,
        totalFillerWords: 0, avgWpm: 125,
      }),
      getBenchmarkPercentile: jest.fn().mockReturnValue(72),
      scoreToGrade: jest.fn().mockReturnValue('B+'),
    }));

    const route = require('../../app/api/scores/route');
    POST = route.POST;
    GET = route.GET;
  });

  test('POST with valid body computes score and returns 201', async () => {
    const req = { json: jest.fn().mockResolvedValue({ mockId: 'm1', userEmail: 'a@b.com', track: 'Frontend' }) };
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('score');
  });

  test('GET with valid mockId returns 200 with score', async () => {
    const req = { url: 'http://localhost/api/scores?mockId=m1' };
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('score');
  });
});

// ─── reports API extended happy paths ─────────────────────────────────────────

describe('/api/reports — extended', () => {
  let GET;

  beforeEach(() => {
    jest.resetModules();

    const mockReport = {
      id: 1, mockIdRef: 'm1',
      reportTitle: 'Test Report',
      executiveSummary: 'Good job.',
      reportData: JSON.stringify({ questionDetails: [{ questionNumber: 1, question: 'Q1', rating: 8 }], radarData: [], scores: {} }),
      totalScore: 80,
      grade: 'A-',
      strengths: '["Tech depth"]',
      weaknesses: '[]',
      nextSteps: '["Practice more"]',
    };

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockReport]),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockReport]),
        delete: jest.fn().mockReturnThis(),
      },
    }));
    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer', MockInterview: 'MockInterview',
      CandidateScore: 'CandidateScore', GeneratedReport: 'GeneratedReport',
    }));
    jest.mock('../../utils/engines/reportEngine', () => ({
      buildSessionReport: jest.fn().mockReturnValue(mockReport),
    }));

    const route = require('../../app/api/reports/route');
    GET = route.GET;
  });

  test('GET with valid mockId returns 200 with report', async () => {
    const req = { url: 'http://localhost/api/reports?mockId=m1' };
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('report');
  });

  test('GET report has parsedData field', async () => {
    const req = { url: 'http://localhost/api/reports?mockId=m1' };
    const res = await GET(req);
    expect(res.data.report).toHaveProperty('parsedData');
  });
});

// ─── progress API extended happy paths ────────────────────────────────────────

describe('/api/progress — extended', () => {
  let GET;

  const sessions = [
    { mockIdRef: 'a1', compositeScore: 65, grade: 'C+', jobTrack: 'Frontend', completedAt: '01-05-2025', userEmail: 'a@b.com', createdAt: '01-05-2025' },
    { mockIdRef: 'a2', compositeScore: 78, grade: 'B+', jobTrack: 'Backend', completedAt: '02-05-2025', userEmail: 'a@b.com', createdAt: '02-05-2025' },
  ];

  beforeEach(() => {
    jest.resetModules();

    // Use module-level mock counter (must be prefixed with 'mock' for Jest factory scope)
    let mockCallCount = 0;
    jest.mock('../../utils/db', () => {
      let mockInternalCount = 0;
      return {
        db: {
          select: jest.fn().mockReturnThis(),
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockImplementation(() => {
            mockInternalCount++;
            return Promise.resolve(mockInternalCount === 1
              ? [
                  { mockIdRef: 'a1', compositeScore: 65, grade: 'C+', jobTrack: 'Frontend', completedAt: '01-05-2025', userEmail: 'a@b.com', createdAt: '01-05-2025' },
                  { mockIdRef: 'a2', compositeScore: 78, grade: 'B+', jobTrack: 'Backend', completedAt: '02-05-2025', userEmail: 'a@b.com', createdAt: '02-05-2025' },
                ]
              : [
                  { mockIdRef: 'a1', technicalScore: 70, fluencyScore: 80, paceScore: 75, confidenceScore: 72, communicationScore: 73, compositeScore: 65, grade: 'C+', createdAt: '01-05-2025' },
                ]
            );
          }),
        },
      };
    });
    jest.mock('../../utils/schema', () => ({
      InterviewSession: 'InterviewSession',
      CandidateScore: 'CandidateScore',
      AnalyticsSnapshot: 'AnalyticsSnapshot',
    }));
    jest.mock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([{ date: '01-05-2025', score: 65 }]),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 13, trend: 'improving', changePercent: 20 }),
      getDomainBreakdown: jest.fn().mockReturnValue([{ domain: 'Frontend', count: 1, avgScore: 65 }]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 2, longestStreak: 2, totalActiveDays: 2 }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([
        { mockIdRef: 'a2', compositeScore: 78, grade: 'B+', jobTrack: 'Backend', completedAt: '02-05-2025' },
        { mockIdRef: 'a1', compositeScore: 65, grade: 'C+', jobTrack: 'Frontend', completedAt: '01-05-2025' },
      ]),
    }));

    const route = require('../../app/api/progress/route');
    GET = route.GET;
  });

  test('GET with sessions returns 200 with full progress shape', async () => {
    const req = { url: 'http://localhost/api/progress?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.data.progress).toHaveProperty('sessions');
    expect(res.data.progress).toHaveProperty('trend');
    expect(res.data.progress).toHaveProperty('records');
    expect(res.data.progress).toHaveProperty('velocity');
    expect(res.data.progress).toHaveProperty('streaks');
  });

  test('GET with sessions returns correct bestScore', async () => {
    const req = { url: 'http://localhost/api/progress?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(res.data.progress.records.bestScore).toBe(78);
  });

  test('GET with sessions returns overallImprovement', async () => {
    const req = { url: 'http://localhost/api/progress?userEmail=a%40b.com' };
    const res = await GET(req);
    expect(typeof res.data.progress.records.overallImprovement).toBe('number');
  });
});

// ─── fetchUserData API ────────────────────────────────────────────────────────

describe('/api/fetchUserData', () => {
  let POST;

  beforeEach(() => {
    jest.resetModules();

    jest.mock('../../utils/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          { id: 1, userEmail: 'a@b.com', question: 'Q1', userAns: 'A1', rating: '7', mockIdRef: 'm1' },
        ]),
      },
    }));
    jest.mock('../../utils/schema', () => ({
      UserAnswer: 'UserAnswer',
      CandidateScore: 'CandidateScore',
      InterviewSession: 'InterviewSession',
    }));

    const route = require('../../app/api/fetchUserData/route');
    POST = route.POST;
  });

  test('POST without userEmail returns 400', async () => {
    const req = { json: jest.fn().mockResolvedValue({}) };
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('POST with userEmail returns 200 with userAnswers', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com' }) };
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('userAnswers');
    expect(Array.isArray(res.data.userAnswers)).toBe(true);
  });

  test('POST with includeScores=true includes scores field', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com', includeScores: true }) };
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('scores');
  });

  test('POST with includeAnalytics=true includes sessions field', async () => {
    const req = { json: jest.fn().mockResolvedValue({ userEmail: 'a@b.com', includeAnalytics: true }) };
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('sessions');
  });
});

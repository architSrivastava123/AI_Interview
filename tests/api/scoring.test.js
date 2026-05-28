/**
 * tests/api/scoring.test.js
 *
 * Tests for:
 *   - app/api/scores/route.js   (POST + GET)
 *   - app/api/progress/route.js (GET)
 *   - app/api/export/route.js   (GET)
 *
 * Uses jest.doMock() to avoid Jest hoisting issues with closures.
 */

function makeDb(responses = []) {
  let idx = 0;
  return {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockImplementation(() => {
      const val = responses[idx] !== undefined ? responses[idx] : [];
      idx++;
      return Promise.resolve(val);
    }),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockImplementation(() => {
      const val = responses[idx] !== undefined ? responses[idx] : [{ id: 1, compositeScore: 76, grade: 'B+', percentile: 68 }];
      idx++;
      return Promise.resolve(val);
    }),
    delete: jest.fn().mockReturnThis(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// /api/scores
// ═══════════════════════════════════════════════════════════════════════════════

describe('POST /api/scores', () => {
  const MOCK_ANSWERS = [
    { rating: '8', userAns: 'Great|||duration:40', mockIdRef: 'm1' },
    { rating: '7', userAns: 'Good|||duration:35',  mockIdRef: 'm1' },
  ];
  const MOCK_SCORE_ROW = [{ id: 1, compositeScore: 76, grade: 'B+', percentile: 68 }];

  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([MOCK_ANSWERS, MOCK_SCORE_ROW, MOCK_SCORE_ROW]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({ UserAnswer: 'UA', CandidateScore: 'CS', InterviewSession: 'IS', MockInterview: 'MI' }));
    jest.doMock('../../utils/engines/scoringEngine', () => ({
      computeSessionScore: jest.fn().mockReturnValue({ technicalScore: 72, fluencyScore: 80, paceScore: 78, confidenceScore: 75, communicationScore: 73, compositeScore: 76, grade: 'B+', rawRatingAvg: 7.5, totalFillerWords: 2, avgWpm: 130 }),
      getBenchmarkPercentile: jest.fn().mockReturnValue(68),
      scoreToGrade: jest.fn().mockReturnValue('B+'),
    }));
    return require('../../app/api/scores/route');
  }

  test('POST without mockId returns 400', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.status).toBe(400);
  });

  test('POST without userEmail returns 400', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ mockId: 'm1' }) });
    expect(res.status).toBe(400);
  });

  test('POST with valid body returns 201', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ mockId: 'm1', userEmail: 'u@t.com' }) });
    expect(res.status).toBe(201);
  });

  test('POST response includes score object', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ mockId: 'm1', userEmail: 'u@t.com' }) });
    expect(res.data).toHaveProperty('score');
  });

  test('POST score has compositeScore', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ mockId: 'm1', userEmail: 'u@t.com' }) });
    expect(res.data.score).toHaveProperty('compositeScore');
  });

  test('GET without mockId returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/scores' });
    expect(res.status).toBe(400);
  });

  test('GET with valid mockId returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/scores?mockId=m1' });
    expect(res.status).toBe(200);
  });

  test('GET response includes score field', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/scores?mockId=m1' });
    expect(res.data).toHaveProperty('score');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /api/progress
// ═══════════════════════════════════════════════════════════════════════════════

describe('GET /api/progress', () => {
  const SESSIONS = [
    { mockIdRef: 'a1', compositeScore: 65, grade: 'C+', jobTrack: 'Frontend', completedAt: '01-05-2025', userEmail: 'u@t.com' },
    { mockIdRef: 'a2', compositeScore: 78, grade: 'B+', jobTrack: 'Backend',  completedAt: '02-05-2025', userEmail: 'u@t.com' },
  ];

  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([SESSIONS, []]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({ InterviewSession: 'IS', CandidateScore: 'CS', AnalyticsSnapshot: 'AS' }));
    jest.doMock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([{ date: '01-05-2025', score: 65 }]),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 13, trend: 'improving', changePercent: 20 }),
      getDomainBreakdown: jest.fn().mockReturnValue([{ domain: 'Frontend', count: 1, avgScore: 65 }]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 2, longestStreak: 2, totalActiveDays: 2 }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([...SESSIONS].reverse()),
    }));
    return require('../../app/api/progress/route');
  }

  test('GET without userEmail returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress' });
    expect(res.status).toBe(400);
  });

  test('GET with userEmail returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.status).toBe(200);
  });

  test('response has progress.sessions array', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.data.progress).toHaveProperty('sessions');
  });

  test('response has progress.trend array', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.data.progress).toHaveProperty('trend');
  });

  test('progress.records has bestScore', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.data.progress.records).toHaveProperty('bestScore');
  });

  test('bestScore is 78 (highest of sessions)', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.data.progress.records.bestScore).toBe(78);
  });

  test('response has velocity and streaks', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.data.progress).toHaveProperty('velocity');
    expect(res.data.progress).toHaveProperty('streaks');
  });

  test('empty DB session list returns 200 with empty sessions', async () => {
    jest.resetModules();
    const emptyDb = makeDb([[], []]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db: emptyDb }));
    jest.doMock('../../utils/schema', () => ({ InterviewSession: 'IS', CandidateScore: 'CS', AnalyticsSnapshot: 'AS' }));
    jest.doMock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([]),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 0, trend: 'insufficient_data', changePercent: 0 }),
      getDomainBreakdown: jest.fn().mockReturnValue([]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([]),
    }));
    const { GET } = require('../../app/api/progress/route');
    const res = await GET({ url: 'http://localhost/api/progress?userEmail=u%40t.com' });
    expect(res.status).toBe(200);
    expect(res.data.progress.sessions).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /api/export
// ═══════════════════════════════════════════════════════════════════════════════

describe('GET /api/export', () => {
  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([[], [], []]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({
      UserAnswer: 'UA', MockInterview: 'MI', InterviewSession: 'IS', CandidateScore: 'CS', GeneratedReport: 'GR',
    }));
    jest.doMock('../../utils/engines/reportEngine', () => ({
      generateExportData: jest.fn().mockReturnValue('{}'),
      buildProgressReport: jest.fn().mockReturnValue({ totalSessions: 0, trend: [] }),
    }));
    jest.doMock('../../utils/engines/analyticsEngine', () => ({
      generateAnalyticsSnapshot: jest.fn().mockReturnValue({ trendData: '[]', domainBreakdown: '[]' }),
    }));
    return require('../../app/api/export/route');
  }

  test('GET without userEmail returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/export' });
    expect(res.status).toBe(400);
  });

  test('GET with invalid format returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/export?userEmail=u%40t.com&format=pdf' });
    expect(res.status).toBe(400);
  });

  test('GET session type without mockId returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/export?userEmail=u%40t.com&type=session&format=json' });
    expect(res.status).toBe(400);
  });

  test('GET progress json export returns defined response', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/export?userEmail=u%40t.com&format=json&type=progress' });
    expect(res).toBeDefined();
  });

  test('GET progress csv export returns defined response', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/export?userEmail=u%40t.com&format=csv&type=progress' });
    expect(res).toBeDefined();
  });
});

/**
 * tests/api/recommendations.test.js
 *
 * Tests for:
 *   - app/api/recommendations/route.js (GET + POST)
 *   - app/api/analytics/route.js       (GET)
 *   - app/api/reports/route.js         (GET + POST)
 *
 * Uses jest.doMock() to avoid Jest hoisting issues.
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
      const val = responses[idx] !== undefined ? responses[idx] : [{ id: 1 }];
      idx++;
      return Promise.resolve(val);
    }),
    delete: jest.fn().mockReturnThis(),
  };
}

const mockRecs = [{ id: 1, title: 'React Patterns', category: 'skill-gap', priority: 1, impactScore: 30, description: 'desc', resourceUrl: '', resourceType: 'docs', targetSkill: 'technical', difficulty: 'Medium', estimatedHours: 4 }];

// ═══════════════════════════════════════════════════════════════════════════════
// /api/recommendations
// ═══════════════════════════════════════════════════════════════════════════════

describe('GET /api/recommendations', () => {
  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([mockRecs, mockRecs, mockRecs]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({ InterviewSession: 'IS', CandidateScore: 'CS', Recommendation: 'REC' }));
    jest.doMock('../../utils/engines/recommendationEngine', () => ({
      identifyWeakSkills: jest.fn().mockReturnValue([{ dimension: 'technical', gap: -20, status: 'critical' }]),
      mapSkillsToResources: jest.fn().mockReturnValue(mockRecs),
      prioritizeRecommendations: jest.fn().mockImplementation(r => r),
      getNextInterviewSuggestion: jest.fn().mockReturnValue({ track: 'Backend', reason: 'Try Backend', difficulty: 'Medium' }),
      getDifficultyRampPlan: jest.fn().mockReturnValue([{ step: 1, difficulty: 'Medium', targetScore: 72, description: 'Level up!' }]),
    }));
    jest.doMock('../../utils/engines/analyticsEngine', () => ({
      computeSkillGapMatrix: jest.fn().mockReturnValue({ dimensions: [], overallGap: 0, targetRole: 'General' }),
    }));
    return require('../../app/api/recommendations/route');
  }

  test('GET without userEmail returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/recommendations' });
    expect(res.status).toBe(400);
  });

  test('GET with userEmail returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/recommendations?userEmail=u%40t.com' });
    expect(res.status).toBe(200);
  });

  test('GET response contains recommendations array', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/recommendations?userEmail=u%40t.com' });
    expect(res.data).toHaveProperty('recommendations');
    expect(Array.isArray(res.data.recommendations)).toBe(true);
  });

  test('POST without userEmail returns 400', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({}) });
    expect(res.status).toBe(400);
  });

  test('POST with valid userEmail returns 201', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.status).toBe(201);
  });

  test('POST response contains recommendations field', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.data).toHaveProperty('recommendations');
  });

  test('GET with refresh=true returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/recommendations?userEmail=u%40t.com&refresh=true' });
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /api/analytics
// ═══════════════════════════════════════════════════════════════════════════════

describe('GET /api/analytics', () => {
  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([[], [], []]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({ InterviewSession: 'IS', CandidateScore: 'CS', AnalyticsSnapshot: 'AS' }));
    jest.doMock('../../utils/engines/analyticsEngine', () => ({
      buildPerformanceTrend: jest.fn().mockReturnValue([]),
      computeSkillGapMatrix: jest.fn().mockReturnValue({ dimensions: [], overallGap: 0, targetRole: 'General' }),
      computeImprovementVelocity: jest.fn().mockReturnValue({ velocity: 0, trend: 'insufficient_data', changePercent: 0 }),
      getDomainBreakdown: jest.fn().mockReturnValue([]),
      computeStreakData: jest.fn().mockReturnValue({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 }),
      generateAnalyticsSnapshot: jest.fn().mockReturnValue({ userEmail: 'u@t.com', totalSessions: 0, trendData: '[]', domainBreakdown: '[]', createdAt: '29-05-2025' }),
      rankSessionsByPerformance: jest.fn().mockReturnValue([]),
    }));
    return require('../../app/api/analytics/route');
  }

  test('GET without userEmail returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/analytics' });
    expect(res.status).toBe(400);
  });

  test('GET with userEmail (0 sessions) returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/analytics?userEmail=u%40t.com' });
    expect(res.status).toBe(200);
  });

  test('GET response has analytics object', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/analytics?userEmail=u%40t.com' });
    expect(res.data).toHaveProperty('analytics');
  });

  test('analytics has trend, skillGap, velocity, streaks, domainBreakdown', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/analytics?userEmail=u%40t.com' });
    const { analytics } = res.data;
    expect(analytics).toHaveProperty('trend');
    expect(analytics).toHaveProperty('skillGap');
    expect(analytics).toHaveProperty('velocity');
    expect(analytics).toHaveProperty('streaks');
    expect(analytics).toHaveProperty('domainBreakdown');
  });

  test('analytics.totalSessions is 0 for empty DB', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/analytics?userEmail=u%40t.com' });
    expect(res.data.analytics.totalSessions).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// /api/reports
// ═══════════════════════════════════════════════════════════════════════════════

describe('POST /api/reports', () => {
  const mockReportObj = {
    id: 1, mockIdRef: 'm1', reportTitle: 'Test Report',
    executiveSummary: 'Good performance.',
    reportData: JSON.stringify({ questionDetails: [{ questionNumber: 1, question: 'Q1', rating: 8, difficulty: 'Medium', ratingLabel: 'Good', userAnswer: 'A1', wpm: 0, durationSeconds: 0, aiFeedback: 'OK' }], radarData: [], scores: {} }),
    totalScore: 76, grade: 'B+',
    strengths: '["Technical depth"]', weaknesses: '[]', nextSteps: '["Practice more"]',
  };
  const mockInterviewRow = [{ mockId: 'm1', jobPosition: 'Dev', interviewTrack: 'Frontend', jobExperience: '2', createdBy: 'u@t.com', jobDesc: 'React', createdAt: '29-05-2025' }];
  const mockAnswersRow = [{ question: 'Q1', userAns: 'A1', rating: '8', correctAns: 'CA1', feedback: 'Good' }];
  const mockScoreRow = [{ compositeScore: 76, technicalScore: 72 }];

  async function makeRoute() {
    jest.resetModules();
    const db = makeDb([mockInterviewRow, mockAnswersRow, mockScoreRow, [mockReportObj], [mockReportObj]]);
    jest.doMock('next/server', () => ({
      NextResponse: { json: (d, i) => ({ data: d, status: (i && i.status) || 200 }) },
    }));
    jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
    jest.doMock('../../utils/db', () => ({ db }));
    jest.doMock('../../utils/schema', () => ({ UserAnswer: 'UA', MockInterview: 'MI', CandidateScore: 'CS', GeneratedReport: 'GR' }));
    jest.doMock('../../utils/engines/reportEngine', () => ({
      buildSessionReport: jest.fn().mockReturnValue(mockReportObj),
    }));
    return require('../../app/api/reports/route');
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

  test('POST response contains report object', async () => {
    const { POST } = await makeRoute();
    const res = await POST({ json: jest.fn().mockResolvedValue({ mockId: 'm1', userEmail: 'u@t.com' }) });
    expect(res.data).toHaveProperty('report');
  });

  test('GET without mockId returns 400', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/reports' });
    expect(res.status).toBe(400);
  });

  test('GET with valid mockId returns 200', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/reports?mockId=m1' });
    expect(res.status).toBe(200);
  });

  test('GET response has report with parsedData', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/reports?mockId=m1' });
    expect(res.data.report).toHaveProperty('parsedData');
  });

  test('GET parsedData is an object (not a string)', async () => {
    const { GET } = await makeRoute();
    const res = await GET({ url: 'http://localhost/api/reports?mockId=m1' });
    expect(typeof res.data.report.parsedData).toBe('object');
  });
});

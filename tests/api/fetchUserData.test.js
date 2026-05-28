/**
 * tests/api/fetchUserData.test.js
 *
 * Tests for app/api/fetchUserData/route.js
 * Uses jest.doMock() (not hoisted) to avoid out-of-scope variable errors.
 */

function makeDb(answers = [], scores = [], sessions = []) {
  let callCount = 0;
  return {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve(answers);
      if (callCount === 2) return Promise.resolve(scores);
      return Promise.resolve(sessions);
    }),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([]),
  };
}

const ANSWERS  = [{ id: 1, mockIdRef: 'm1', userEmail: 'u@t.com', question: 'Q1', userAns: 'A1', rating: '8', createdAt: '29-05-2025' }];
const SCORES   = [{ id: 1, mockIdRef: 'm1', compositeScore: 75, grade: 'B+' }];
const SESSIONS = [{ id: 1, mockIdRef: 'm1', compositeScore: 75 }];

async function getPost(db) {
  jest.resetModules();
  jest.doMock('next/server', () => ({
    NextResponse: { json: (data, init) => ({ data, status: (init && init.status) || 200 }) },
  }));
  jest.doMock('drizzle-orm', () => ({ eq: jest.fn(), desc: jest.fn() }));
  jest.doMock('../../utils/db', () => ({ db }));
  jest.doMock('../../utils/schema', () => ({
    UserAnswer: 'UserAnswer', CandidateScore: 'CandidateScore', InterviewSession: 'InterviewSession',
  }));
  return require('../../app/api/fetchUserData/route').POST;
}

describe('POST /api/fetchUserData', () => {
  test('POST without userEmail returns 400', async () => {
    const POST = await getPost(makeDb());
    const res = await POST({ json: jest.fn().mockResolvedValue({}) });
    expect(res.status).toBe(400);
  });

  test('POST with empty userEmail returns 400', async () => {
    const POST = await getPost(makeDb());
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: '' }) });
    expect(res.status).toBe(400);
  });

  test('POST with valid userEmail returns 200', async () => {
    const POST = await getPost(makeDb(ANSWERS));
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.status).toBe(200);
  });

  test('POST with valid userEmail returns userAnswers array', async () => {
    const POST = await getPost(makeDb(ANSWERS));
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.data).toHaveProperty('userAnswers');
    expect(Array.isArray(res.data.userAnswers)).toBe(true);
  });

  test('POST with includeScores=true adds scores field', async () => {
    const POST = await getPost(makeDb(ANSWERS, SCORES));
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com', includeScores: true }) });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('scores');
  });

  test('POST with includeAnalytics=true adds sessions field', async () => {
    const POST = await getPost(makeDb(ANSWERS, [], SESSIONS));
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com', includeAnalytics: true }) });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('sessions');
  });

  test('POST with both flags returns userAnswers, scores, sessions', async () => {
    const POST = await getPost(makeDb(ANSWERS, SCORES, SESSIONS));
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com', includeScores: true, includeAnalytics: true }) });
    expect(res.data).toHaveProperty('userAnswers');
    expect(res.data).toHaveProperty('scores');
    expect(res.data).toHaveProperty('sessions');
  });

  test('returns 500 when DB throws', async () => {
    const errDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockRejectedValue(new Error('DB connection failed')),
    };
    const POST = await getPost(errDb);
    const res = await POST({ json: jest.fn().mockResolvedValue({ userEmail: 'u@t.com' }) });
    expect(res.status).toBe(500);
  });
});

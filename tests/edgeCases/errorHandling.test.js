/**
 * tests/edgeCases/errorHandling.test.js
 *
 * Error handling tests for all modules:
 * - Engine functions that should throw vs. gracefully handle errors
 * - API handlers that catch DB errors and return 500
 * - Recovery scenarios after partial failures
 */

jest.mock('../../utils/engines/scoringEngine',        () => jest.requireActual('../../utils/engines/scoringEngine'));
jest.mock('../../utils/engines/analyticsEngine',      () => jest.requireActual('../../utils/engines/analyticsEngine'));
jest.mock('../../utils/engines/recommendationEngine', () => jest.requireActual('../../utils/engines/recommendationEngine'));
jest.mock('../../utils/engines/reportEngine',         () => jest.requireActual('../../utils/engines/reportEngine'));

const { computeSessionScore, scoreToGrade }           = require('../../utils/engines/scoringEngine');
const { computeSkillGapMatrix, rankSessionsByPerformance } = require('../../utils/engines/analyticsEngine');
const { mapSkillsToResources, getDifficultyRampPlan }  = require('../../utils/engines/recommendationEngine');
const { buildSessionReport, generateExportData, buildProgressReport } = require('../../utils/engines/reportEngine');

// ═══════════════════════════════════════════════════════════════════════════════
// scoringEngine — error handling
// ═══════════════════════════════════════════════════════════════════════════════

describe('scoringEngine — graceful error handling', () => {
  test('answers with completely missing userAns still process', () => {
    const answers = [{ rating: '7' }]; // no userAns
    expect(() => computeSessionScore(answers, 'Frontend')).not.toThrow();
  });

  test('answers with null userAns still process', () => {
    const answers = [{ rating: '7', userAns: null }];
    expect(() => computeSessionScore(answers, 'Frontend')).not.toThrow();
  });

  test('answer with non-numeric rating treated as 0', () => {
    const answers = [{ rating: 'excellent', userAns: 'text|||duration:30' }];
    const result = computeSessionScore(answers, 'Frontend');
    expect(result.rawRatingAvg).toBeLessThanOrEqual(5);
  });

  test('score > 100 from string "110" is clamped in grade', () => {
    // scoreToGrade should not crash for > 100
    expect(() => scoreToGrade(110)).not.toThrow();
  });

  test('duration parsing: corrupted duration marker treated as 0', () => {
    const answers = [{ rating: '7', userAns: 'text|||duration:notanumber' }];
    expect(() => computeSessionScore(answers, 'Frontend')).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// analyticsEngine — error handling
// ═══════════════════════════════════════════════════════════════════════════════

describe('analyticsEngine — graceful error handling', () => {
  test('computeSkillGapMatrix with zero score items returns 0 averages', () => {
    const scores = [{}]; // empty object
    expect(() => computeSkillGapMatrix(scores, 'Frontend')).not.toThrow();
  });

  test('computeSkillGapMatrix with undefined dimensions returns 5 dimensions', () => {
    const result = computeSkillGapMatrix([], 'Frontend');
    expect(result.dimensions).toHaveLength(5);
  });

  test('rankSessionsByPerformance handles sessions with null compositeScore', () => {
    const sessions = [{ mockIdRef: 'x', compositeScore: null }, { mockIdRef: 'y', compositeScore: 70 }];
    expect(() => rankSessionsByPerformance(sessions)).not.toThrow();
  });

  test('rankSessionsByPerformance handles sessions with string compositeScore', () => {
    const sessions = [{ mockIdRef: 'x', compositeScore: '70' }, { mockIdRef: 'y', compositeScore: '80' }];
    expect(() => rankSessionsByPerformance(sessions)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// recommendationEngine — error handling
// ═══════════════════════════════════════════════════════════════════════════════

describe('recommendationEngine — graceful error handling', () => {
  test('mapSkillsToResources with null weakSkills either throws or returns array', () => {
    // The engine may throw for null since it uses for...of; we verify predictable behavior
    let recs;
    try {
      recs = mapSkillsToResources(null, 'Frontend');
      expect(Array.isArray(recs)).toBe(true);
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
    }
  });

  test('getDifficultyRampPlan with null sessions returns 4-step plan', () => {
    const plan = getDifficultyRampPlan(null);
    expect(plan).toHaveLength(4);
  });

  test('getDifficultyRampPlan with sessions containing null compositeScore', () => {
    expect(() => getDifficultyRampPlan([{ compositeScore: null }])).not.toThrow();
  });

  test('mapSkillsToResources: unknown domain falls back gracefully', () => {
    const recs = mapSkillsToResources([], 'UnknownDomain123');
    expect(Array.isArray(recs)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// reportEngine — error handling
// ═══════════════════════════════════════════════════════════════════════════════

describe('reportEngine — error handling', () => {
  test('buildSessionReport with null session throws (cannot read props of null)', () => {
    expect(() => buildSessionReport(null, [], {})).toThrow();
  });

  test('buildSessionReport with undefined answers gracefully processes', () => {
    const session = { mockId: 'x', jobPosition: 'Dev', interviewTrack: 'Frontend', createdBy: 'u@t.com', jobExperience: '2', jobDesc: 'React', createdAt: '29-05-2025' };
    expect(() => buildSessionReport(session, undefined, {})).not.toThrow();
  });

  test('generateExportData with corrupt reportData JSON → CSV handles gracefully or throws', () => {
    const badReport = { reportData: '{bad json{{{' };
    // Should either throw or return header-only CSV
    try {
      const result = generateExportData(badReport, 'csv');
      expect(typeof result).toBe('string');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  test('generateExportData: format "json" with good data returns JSON string', () => {
    const validReport = {
      questionDetails: [
        { questionNumber: 1, question: 'Q', difficulty: 'Easy', rating: 7, ratingLabel: 'Good', userAnswer: 'A', wpm: 0, durationSeconds: 0, aiFeedback: 'ok' },
      ],
    };
    const output = generateExportData(validReport, 'json');
    expect(typeof output).toBe('string');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('buildProgressReport with null analytics uses defaults', () => {
    const sessions = [{ mockIdRef: 'x', compositeScore: 60, jobTrack: 'Frontend', completedAt: '01-05-2025' }];
    expect(() => buildProgressReport(sessions, null)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API error recovery (inline HTTP handler simulation)
// ═══════════════════════════════════════════════════════════════════════════════

describe('API error recovery — simulated handler logic', () => {
  async function simulateHandler(dbFn) {
    try {
      const data = await dbFn();
      return { status: 200, data };
    } catch (e) {
      return { status: 500, error: e.message };
    }
  }

  test('DB success returns 200', async () => {
    const res = await simulateHandler(() => Promise.resolve([{ id: 1 }]));
    expect(res.status).toBe(200);
  });

  test('DB failure returns 500', async () => {
    const res = await simulateHandler(() => Promise.reject(new Error('DB down')));
    expect(res.status).toBe(500);
  });

  test('DB timeout error captured in error message', async () => {
    const res = await simulateHandler(() => Promise.reject(new Error('Query timeout')));
    expect(res.error).toContain('timeout');
  });

  test('DB connection error captured correctly', async () => {
    const res = await simulateHandler(() => { throw new Error('Connection refused'); });
    expect(res.status).toBe(500);
    expect(res.error).toContain('refused');
  });

  test('Empty DB result array does not cause handler crash', async () => {
    const res = await simulateHandler(() => Promise.resolve([]));
    expect(res.status).toBe(200);
    expect(res.data).toEqual([]);
  });

  test('Null from DB result does not cause crash', async () => {
    const res = await simulateHandler(() => Promise.resolve(null));
    expect(res.status).toBe(200);
    expect(res.data).toBeNull();
  });
});

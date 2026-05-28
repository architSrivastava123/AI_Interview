/**
 * tests/integration/interviewFlow.test.js
 *
 * Integration tests for the end-to-end interview creation and scoring flow:
 *   1. Form validation → Gemini prompt generation
 *   2. Session score computation from raw answers
 *   3. Report generation from score + session data
 *   4. Recommendation generation from report data
 *
 * All external services (DB, Gemini) are mocked.
 * The integration chain calls real engine modules in sequence.
 */

jest.mock('../../utils/engines/scoringEngine', () => jest.requireActual('../../utils/engines/scoringEngine'));
jest.mock('../../utils/engines/reportEngine', () => jest.requireActual('../../utils/engines/reportEngine'));
jest.mock('../../utils/engines/analyticsEngine', () => jest.requireActual('../../utils/engines/analyticsEngine'));
jest.mock('../../utils/engines/recommendationEngine', () => jest.requireActual('../../utils/engines/recommendationEngine'));

const { computeSessionScore, getBenchmarkPercentile } = require('../../utils/engines/scoringEngine');
const { buildSessionReport, buildSkillRadarData } = require('../../utils/engines/reportEngine');
const { identifyWeakSkills, mapSkillsToResources } = require('../../utils/engines/recommendationEngine');
const { computeSkillGapMatrix } = require('../../utils/engines/analyticsEngine');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  mockId: 'flow-001',
  jobPosition: 'Frontend Engineer',
  interviewTrack: 'Frontend',
  jobExperience: '3',
  createdBy: 'dev@example.com',
  jobDesc: 'React, TypeScript, GraphQL',
  createdAt: '29-05-2025',
};

const RAW_ANSWERS = [
  { question: 'Explain React reconciliation', userAns: 'The diffing algorithm for virtual DOM|||duration:38', rating: '8',  correctAns: 'Fiber-based diff', feedback: 'Good coverage' },
  { question: 'What is a closure?',           userAns: 'A function with access to outer scope|||duration:28', rating: '9',  correctAns: 'Function + outer scope', feedback: 'Excellent' },
  { question: 'CSS specificity rules?',       userAns: 'ID > class > element|||duration:20', rating: '10', correctAns: 'Correct!', feedback: 'Perfect' },
  { question: 'Describe event bubbling',      userAns: 'Events propagate upward|||duration:25', rating: '7',  correctAns: 'Correct direction', feedback: 'Good' },
  { question: 'What is memoization?',         userAns: 'Caching function results|||duration:22', rating: '6',  correctAns: 'Caching expensive computations', feedback: 'Could be more detailed' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Step 1: Score computation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interview Flow — Step 1: Score Computation', () => {
  let score;

  beforeAll(() => {
    score = computeSessionScore(RAW_ANSWERS, 'Frontend');
  });

  test('computeSessionScore returns defined result', () => {
    expect(score).toBeDefined();
  });

  test('compositeScore is in 0–100', () => {
    expect(score.compositeScore).toBeGreaterThanOrEqual(0);
    expect(score.compositeScore).toBeLessThanOrEqual(100);
  });

  test('all 5 dimension scores are populated', () => {
    expect(score.technicalScore).toBeGreaterThan(0);
    expect(score.fluencyScore).toBeGreaterThan(0);
    expect(score.paceScore).toBeGreaterThan(0);
    expect(score.confidenceScore).toBeGreaterThan(0);
    expect(score.communicationScore).toBeGreaterThan(0);
  });

  test('grade is a non-empty string', () => {
    expect(typeof score.grade).toBe('string');
    expect(score.grade.length).toBeGreaterThan(0);
  });

  test('rawRatingAvg matches manual calculation of [8,9,10,7,6]/5 = 8', () => {
    expect(score.rawRatingAvg).toBeCloseTo(8, 0);
  });

  test('getBenchmarkPercentile returns 0–100', () => {
    const pct = getBenchmarkPercentile(score.compositeScore);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2: Report Generation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interview Flow — Step 2: Report Generation', () => {
  let score, report;

  beforeAll(() => {
    score = computeSessionScore(RAW_ANSWERS, 'Frontend');
    report = buildSessionReport(MOCK_SESSION, RAW_ANSWERS, score);
  });

  test('buildSessionReport returns defined report', () => {
    expect(report).toBeDefined();
  });

  test('report.userEmail matches session.createdBy', () => {
    expect(report.userEmail).toBe('dev@example.com');
  });

  test('report.reportData is valid JSON', () => {
    expect(() => JSON.parse(report.reportData)).not.toThrow();
  });

  test('parsed report has 5 questionDetails (one per answer)', () => {
    expect(JSON.parse(report.reportData).questionDetails).toHaveLength(5);
  });

  test('totalScore is within acceptable range for strong performer', () => {
    // With avg rating of 8, should be above 60
    expect(report.totalScore).toBeGreaterThan(60);
  });

  test('grade is one of the expected letter grades', () => {
    const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
    expect(validGrades).toContain(report.grade);
  });

  test('strengths is parseable JSON array', () => {
    const parsed = JSON.parse(report.strengths);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test('nextSteps is parseable JSON array', () => {
    const parsed = JSON.parse(report.nextSteps);
    expect(Array.isArray(parsed)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 3: Skill Radar Data
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interview Flow — Step 3: Skill Radar', () => {
  let score, radarData;

  beforeAll(() => {
    score = computeSessionScore(RAW_ANSWERS, 'Frontend');
    radarData = buildSkillRadarData(score);
  });

  test('radarData has 5 axes', () => {
    expect(radarData).toHaveLength(5);
  });

  test('all values are in 0–100', () => {
    radarData.forEach(d => {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
    });
  });

  test('Technical radar value roughly reflects technicalScore', () => {
    const tech = radarData.find(d => d.axis === 'Technical');
    expect(tech.value).toBe(Math.round(score.technicalScore));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 4: Recommendation Chain
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interview Flow — Step 4: Recommendations', () => {
  let score, skillGap, weakSkills, recommendations;

  beforeAll(() => {
    score = computeSessionScore(RAW_ANSWERS, 'Frontend');
    // For strong answers, skill gap should be small
    skillGap = computeSkillGapMatrix([score], 'Frontend');
    weakSkills = identifyWeakSkills(skillGap);
    recommendations = mapSkillsToResources(weakSkills, 'Frontend');
  });

  test('computeSkillGapMatrix returns 5 dimensions', () => {
    expect(skillGap.dimensions).toHaveLength(5);
  });

  test('identifyWeakSkills returns an array', () => {
    expect(Array.isArray(weakSkills)).toBe(true);
  });

  test('mapSkillsToResources returns non-empty recommendations', () => {
    // Even with no weak skills, domain-focus recs are always added
    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('each recommendation has required shape', () => {
    recommendations.forEach(r => {
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('priority');
      expect(r).toHaveProperty('impactScore');
      expect(r).toHaveProperty('category');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Cross-step invariants
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interview Flow — Cross-Step Invariants', () => {
  test('score → report → radar pipeline produces consistent data', () => {
    const score = computeSessionScore(RAW_ANSWERS, 'Frontend');
    const report = buildSessionReport(MOCK_SESSION, RAW_ANSWERS, score);
    const radar = buildSkillRadarData(score);

    // The report's totalScore should match the rounded composite
    expect(Math.abs(report.totalScore - score.compositeScore)).toBeLessThan(5);
    // Radar should have the same dimensions
    expect(radar).toHaveLength(5);
  });

  test('stronger answers produce higher composite score', () => {
    const weakAnswers = RAW_ANSWERS.map(a => ({ ...a, rating: '3' }));
    const strongAnswers = RAW_ANSWERS.map(a => ({ ...a, rating: '10' }));
    const weakScore = computeSessionScore(weakAnswers, 'Frontend');
    const strongScore = computeSessionScore(strongAnswers, 'Frontend');
    expect(strongScore.compositeScore).toBeGreaterThan(weakScore.compositeScore);
  });

  test('weaker performance generates more weak skills', () => {
    const weakScore = computeSessionScore(RAW_ANSWERS.map(a => ({ ...a, rating: '2' })), 'Frontend');
    const strongScore = computeSessionScore(RAW_ANSWERS.map(a => ({ ...a, rating: '10' })), 'Frontend');

    const weakGap = computeSkillGapMatrix([weakScore], 'Frontend');
    const strongGap = computeSkillGapMatrix([strongScore], 'Frontend');

    const weakWeakness = identifyWeakSkills(weakGap).length;
    const strongWeakness = identifyWeakSkills(strongGap).length;

    expect(weakWeakness).toBeGreaterThanOrEqual(strongWeakness);
  });
});

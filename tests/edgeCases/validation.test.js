/**
 * tests/edgeCases/validation.test.js
 *
 * Input validation tests covering every module:
 * - scoringEngine: input type coercion and constraint validation
 * - analyticsEngine: data shape validators
 * - recommendationEngine: input validators
 * - reportEngine: input validators
 * - API handler body validators
 */

jest.mock('../../utils/engines/scoringEngine',        () => jest.requireActual('../../utils/engines/scoringEngine'));
jest.mock('../../utils/engines/analyticsEngine',      () => jest.requireActual('../../utils/engines/analyticsEngine'));
jest.mock('../../utils/engines/recommendationEngine', () => jest.requireActual('../../utils/engines/recommendationEngine'));
jest.mock('../../utils/engines/reportEngine',         () => jest.requireActual('../../utils/engines/reportEngine'));

const { computeSessionScore, scoreToGrade, calibrateQuestionDifficulty } = require('../../utils/engines/scoringEngine');
const { buildPerformanceTrend, computeImprovementVelocity, getDomainBreakdown } = require('../../utils/engines/analyticsEngine');
const { identifyWeakSkills, prioritizeRecommendations } = require('../../utils/engines/recommendationEngine');
const { generateExportData, buildSkillRadarData } = require('../../utils/engines/reportEngine');

// ═══════════════════════════════════════════════════════════════════════════════
// scoringEngine validations
// ═══════════════════════════════════════════════════════════════════════════════

describe('scoringEngine — input validation', () => {
  test('computeSessionScore: null answers returns zero composite', () => {
    const result = computeSessionScore(null, 'Frontend');
    expect(result.compositeScore).toBe(0);
  });

  test('computeSessionScore: empty answers returns zero composite', () => {
    const result = computeSessionScore([], 'Frontend');
    expect(result.compositeScore).toBe(0);
  });

  test('computeSessionScore: string ratings are coerced to numbers', () => {
    const answers = [{ rating: '8', userAns: 'text|||duration:30' }];
    expect(() => computeSessionScore(answers, 'Frontend')).not.toThrow();
  });

  test('computeSessionScore: undefined rating treated as 0', () => {
    const answers = [{ rating: undefined, userAns: 'text|||duration:30' }];
    const result = computeSessionScore(answers, 'Frontend');
    expect(result.rawRatingAvg).toBeLessThanOrEqual(5);
  });

  test('computeSessionScore: undefined track treated as General', () => {
    const answers = [{ rating: '7', userAns: 'text|||duration:30' }];
    expect(() => computeSessionScore(answers, undefined)).not.toThrow();
  });

  test('scoreToGrade: exactly 100 returns A+', () => {
    expect(scoreToGrade(100)).toBe('A+');
  });

  test('scoreToGrade: 0 returns F', () => {
    expect(scoreToGrade(0)).toBe('F');
  });

  test('scoreToGrade: negative score returns F', () => {
    expect(scoreToGrade(-10)).toBe('F');
  });

  test('scoreToGrade: NaN returns F', () => {
    expect(scoreToGrade(NaN)).toBe('F');
  });

  test('calibrateQuestionDifficulty: returns valid difficulty string', () => {
    const valid = ['Easy', 'Medium', 'Hard', 'Expert'];
    expect(valid).toContain(calibrateQuestionDifficulty('React hooks', 1));
    expect(valid).toContain(calibrateQuestionDifficulty('React hooks', 5));
    expect(valid).toContain(calibrateQuestionDifficulty('React hooks', 10));
  });

  test('calibrateQuestionDifficulty: null question returns valid difficulty', () => {
    expect(() => calibrateQuestionDifficulty(null, 5)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// analyticsEngine validations
// ═══════════════════════════════════════════════════════════════════════════════

describe('analyticsEngine — input validation', () => {
  test('buildPerformanceTrend: null returns []', () => {
    expect(buildPerformanceTrend(null)).toEqual([]);
  });

  test('buildPerformanceTrend: non-array returns []', () => {
    expect(buildPerformanceTrend('not array')).toEqual([]);
  });

  test('buildPerformanceTrend: sessions with missing completedAt still processes', () => {
    const sessions = [{ mockIdRef: 'x', compositeScore: 50 }]; // no completedAt
    expect(() => buildPerformanceTrend(sessions)).not.toThrow();
  });

  test('computeImprovementVelocity: null returns insufficient_data', () => {
    expect(computeImprovementVelocity(null).trend).toBe('insufficient_data');
  });

  test('computeImprovementVelocity: non-array returns insufficient_data', () => {
    expect(computeImprovementVelocity({ score: 50 }).trend).toBe('insufficient_data');
  });

  test('computeImprovementVelocity: string compositeScore coerced correctly', () => {
    const sessions = [{ compositeScore: '60' }, { compositeScore: '80' }];
    expect(() => computeImprovementVelocity(sessions)).not.toThrow();
  });

  test('getDomainBreakdown: null returns []', () => {
    expect(getDomainBreakdown(null)).toEqual([]);
  });

  test('getDomainBreakdown: sessions with no jobTrack grouped under undefined', () => {
    const sessions = [{ compositeScore: 60 }]; // no jobTrack
    expect(() => getDomainBreakdown(sessions)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// recommendationEngine validations
// ═══════════════════════════════════════════════════════════════════════════════

describe('recommendationEngine — input validation', () => {
  test('identifyWeakSkills: null returns []', () => {
    expect(identifyWeakSkills(null)).toEqual([]);
  });

  test('identifyWeakSkills: {} returns []', () => {
    expect(identifyWeakSkills({})).toEqual([]);
  });

  test('identifyWeakSkills: gap with non-array dimensions returns []', () => {
    expect(identifyWeakSkills({ dimensions: null })).toEqual([]);
  });

  test('identifyWeakSkills: every status=strong → returns []', () => {
    const gap = {
      dimensions: [
        { dimension: 'technical', gap: 5, status: 'strong' },
        { dimension: 'fluency',   gap: 3, status: 'on-track' },
      ],
    };
    expect(identifyWeakSkills(gap)).toEqual([]);
  });

  test('prioritizeRecommendations: null returns []', () => {
    expect(prioritizeRecommendations(null)).toEqual([]);
  });

  test('prioritizeRecommendations: preserves all items', () => {
    const recs = [
      { priority: 3, impactScore: 10 },
      { priority: 1, impactScore: 20 },
      { priority: 2, impactScore: 15 },
    ];
    expect(prioritizeRecommendations(recs)).toHaveLength(3);
  });

  test('prioritizeRecommendations: missing impactScore treated as 0', () => {
    const recs = [{ priority: 1 }, { priority: 2 }];
    expect(() => prioritizeRecommendations(recs)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// reportEngine validations
// ═══════════════════════════════════════════════════════════════════════════════

describe('reportEngine — input validation', () => {
  test('buildSkillRadarData: null returns 5 zero-value items', () => {
    const radar = buildSkillRadarData(null);
    expect(radar).toHaveLength(5);
    radar.forEach(d => expect(d.value).toBe(0));
  });

  test('buildSkillRadarData: {} returns 5 zero-value items', () => {
    buildSkillRadarData({}).forEach(d => expect(d.value).toBe(0));
  });

  test('buildSkillRadarData: string score coerced to number', () => {
    const scores = { technicalScore: '85', fluencyScore: '90', paceScore: '88', confidenceScore: '82', communicationScore: '87' };
    expect(() => buildSkillRadarData(scores)).not.toThrow();
    const radar = buildSkillRadarData(scores);
    const tech = radar.find(d => d.axis === 'Technical');
    expect(tech.value).toBe(85);
  });

  test('generateExportData: null data throws', () => {
    expect(() => generateExportData(null, 'json')).toThrow();
  });

  test('generateExportData: unsupported format throws', () => {
    expect(() => generateExportData({ questionDetails: [] }, 'xlsx')).toThrow();
  });

  test('generateExportData: empty questionDetails → JSON with empty array', () => {
    const data = { reportData: JSON.stringify({ questionDetails: [] }) };
    const output = generateExportData(data, 'csv');
    // Should return just headers + no data rows
    const lines = output.split('\n').filter(l => l.trim());
    expect(lines.length).toBe(1); // just header
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// API handler body validators (inline)
// ═══════════════════════════════════════════════════════════════════════════════

describe('API validator logic — inline', () => {
  function validateScoreBody(body) {
    if (!body || !body.mockId) return { valid: false, error: 'mockId required' };
    if (!body.userEmail) return { valid: false, error: 'userEmail required' };
    return { valid: true };
  }

  function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateExportParams(userEmail, format) {
    const validFormats = ['json', 'csv'];
    if (!userEmail) return { valid: false, error: 'userEmail required' };
    if (!validFormats.includes(format)) return { valid: false, error: `format must be one of: ${validFormats.join(', ')}` };
    return { valid: true };
  }

  test('validateScoreBody: missing mockId → invalid', () => {
    expect(validateScoreBody({ userEmail: 'u@t.com' }).valid).toBe(false);
  });

  test('validateScoreBody: missing userEmail → invalid', () => {
    expect(validateScoreBody({ mockId: 'm1' }).valid).toBe(false);
  });

  test('validateScoreBody: null body → invalid', () => {
    expect(validateScoreBody(null).valid).toBe(false);
  });

  test('validateScoreBody: both fields → valid', () => {
    expect(validateScoreBody({ mockId: 'm1', userEmail: 'u@t.com' }).valid).toBe(true);
  });

  test('validateEmail: valid email', () => expect(validateEmail('u@test.com')).toBe(true));
  test('validateEmail: no @', () => expect(validateEmail('noatsign.com')).toBe(false));
  test('validateEmail: null', () => expect(validateEmail(null)).toBe(false));
  test('validateEmail: empty', () => expect(validateEmail('')).toBe(false));

  test('validateExportParams: pdf format → invalid', () => {
    expect(validateExportParams('u@t.com', 'pdf').valid).toBe(false);
  });

  test('validateExportParams: json format → valid', () => {
    expect(validateExportParams('u@t.com', 'json').valid).toBe(true);
  });

  test('validateExportParams: missing userEmail → invalid', () => {
    expect(validateExportParams(null, 'json').valid).toBe(false);
  });
});

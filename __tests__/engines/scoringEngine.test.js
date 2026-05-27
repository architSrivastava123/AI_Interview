/**
 * scoringEngine.test.js
 * Comprehensive unit tests for the scoring engine.
 * Tests all exported functions with boundary values, edge cases, and realistic data.
 */

const {
  calculateTechnicalScore,
  calculateFluencyScore,
  calculatePaceScore,
  calculateConfidenceScore,
  calculateCommunicationScore,
  computeSessionScore,
  scoreToGrade,
  getBenchmarkPercentile,
  calibrateQuestionDifficulty,
  SCORE_WEIGHTS,
  IDEAL_WPM_MIN,
  IDEAL_WPM_MAX,
} = require('../../utils/engines/scoringEngine');

// ─── calculateTechnicalScore ──────────────────────────────────────────────────

describe('calculateTechnicalScore', () => {
  test('returns 0 for rating of 0', () => {
    expect(calculateTechnicalScore(0)).toBe(0);
  });

  test('returns correct score for rating 5 (midpoint)', () => {
    const score = calculateTechnicalScore(5);
    expect(score).toBeGreaterThan(30);
    expect(score).toBeLessThan(70);
  });

  test('returns 100 or near for rating 10', () => {
    const score = calculateTechnicalScore(10);
    expect(score).toBe(100);
  });

  test('applies quadratic bonus for high ratings (>= 7)', () => {
    const score7 = calculateTechnicalScore(7);
    const score8 = calculateTechnicalScore(8);
    const linearDiff = (8 - 7) * 8; // base linear
    const actualDiff = score8 - score7;
    expect(actualDiff).toBeGreaterThan(linearDiff); // bonus kicks in
  });

  test('clamps negative input to 0', () => {
    expect(calculateTechnicalScore(-5)).toBe(0);
  });

  test('clamps input above 10', () => {
    expect(calculateTechnicalScore(15)).toBe(100);
  });

  test('handles non-numeric input gracefully', () => {
    expect(calculateTechnicalScore(null)).toBe(0);
    expect(calculateTechnicalScore(undefined)).toBe(0);
    expect(calculateTechnicalScore('abc')).toBe(0);
  });

  test('returns numeric type', () => {
    expect(typeof calculateTechnicalScore(7)).toBe('number');
  });
});

// ─── calculateFluencyScore ────────────────────────────────────────────────────

describe('calculateFluencyScore', () => {
  test('returns 100 for zero fillers', () => {
    expect(calculateFluencyScore(0, 100)).toBe(100);
  });

  test('penalizes filler words proportionally', () => {
    const highFillers = calculateFluencyScore(20, 100);
    const lowFillers = calculateFluencyScore(2, 100);
    expect(lowFillers).toBeGreaterThan(highFillers);
  });

  test('never returns below 0', () => {
    expect(calculateFluencyScore(1000, 100)).toBeGreaterThanOrEqual(0);
  });

  test('handles zero word count safely (returns 100)', () => {
    expect(calculateFluencyScore(0, 0)).toBe(100);
  });

  test('returns 100 when fillerCount is 0 regardless of wordCount', () => {
    expect(calculateFluencyScore(0, 500)).toBe(100);
  });

  test('returns value in 0–100 range', () => {
    const score = calculateFluencyScore(5, 50);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── calculatePaceScore ───────────────────────────────────────────────────────

describe('calculatePaceScore', () => {
  test('returns 75 for 0 WPM (typed response — neutral)', () => {
    expect(calculatePaceScore(0)).toBe(75);
  });

  test('returns 100 for WPM in ideal range (110–150)', () => {
    expect(calculatePaceScore(110)).toBe(100);
    expect(calculatePaceScore(130)).toBe(100);
    expect(calculatePaceScore(150)).toBe(100);
  });

  test('penalizes too-slow speech', () => {
    const slow = calculatePaceScore(60);
    expect(slow).toBeLessThan(100);
    expect(slow).toBeGreaterThanOrEqual(0);
  });

  test('penalizes too-fast speech', () => {
    const fast = calculatePaceScore(200);
    expect(fast).toBeLessThan(100);
    expect(fast).toBeGreaterThanOrEqual(0);
  });

  test('very fast speech approaches 0', () => {
    expect(calculatePaceScore(300)).toBeLessThan(30);
  });

  test('returns value in 0–100 range for any input', () => {
    [0, 50, 110, 150, 200, 300].forEach(wpm => {
      const score = calculatePaceScore(wpm);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});

// ─── calculateConfidenceScore ─────────────────────────────────────────────────

describe('calculateConfidenceScore', () => {
  test('returns high score for all-high inputs', () => {
    expect(calculateConfidenceScore(90, 90, 90)).toBeGreaterThan(85);
  });

  test('returns low score for all-low inputs', () => {
    expect(calculateConfidenceScore(20, 20, 20)).toBeLessThan(35);
  });

  test('weighted average formula is correct', () => {
    const f = 80, p = 70, t = 60;
    const expected = Math.round(f * 0.40 + p * 0.35 + t * 0.25);
    expect(calculateConfidenceScore(f, p, t)).toBe(expected);
  });

  test('clamps inputs to 0–100', () => {
    const score = calculateConfidenceScore(150, -10, 50);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── computeSessionScore ─────────────────────────────────────────────────────

describe('computeSessionScore', () => {
  const mockAnswers = [
    { rating: '8', userAns: 'I built a React app with hooks|||duration:45' },
    { rating: '7', userAns: 'Used Redux for state management, like, basically|||duration:38' },
    { rating: '9', userAns: 'REST API design with JWT auth|||duration:52' },
    { rating: '6', userAns: 'Docker containers basically|||duration:30' },
    { rating: '8', userAns: 'PostgreSQL normalization, you know|||duration:48' },
  ];

  test('returns valid score shape for 5 answers', () => {
    const result = computeSessionScore(mockAnswers);
    expect(result).toHaveProperty('technicalScore');
    expect(result).toHaveProperty('fluencyScore');
    expect(result).toHaveProperty('paceScore');
    expect(result).toHaveProperty('confidenceScore');
    expect(result).toHaveProperty('communicationScore');
    expect(result).toHaveProperty('compositeScore');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('rawRatingAvg');
    expect(result).toHaveProperty('totalFillerWords');
    expect(result).toHaveProperty('avgWpm');
  });

  test('all score values are in 0–100 range', () => {
    const result = computeSessionScore(mockAnswers);
    ['technicalScore', 'fluencyScore', 'paceScore', 'confidenceScore', 'communicationScore', 'compositeScore'].forEach(k => {
      expect(result[k]).toBeGreaterThanOrEqual(0);
      expect(result[k]).toBeLessThanOrEqual(100);
    });
  });

  test('detects filler words in answers', () => {
    const result = computeSessionScore(mockAnswers);
    expect(result.totalFillerWords).toBeGreaterThan(0);
  });

  test('computes rawRatingAvg correctly', () => {
    const result = computeSessionScore(mockAnswers);
    const expectedAvg = (8 + 7 + 9 + 6 + 8) / 5;
    expect(result.rawRatingAvg).toBeCloseTo(expectedAvg, 1);
  });

  test('returns zeroed object for empty answers', () => {
    const result = computeSessionScore([]);
    expect(result.compositeScore).toBe(0);
    expect(result.grade).toBe('F');
  });

  test('returns zeroed object for null input', () => {
    const result = computeSessionScore(null);
    expect(result.compositeScore).toBe(0);
  });

  test('handles answers with no duration (typed response)', () => {
    const typed = [{ rating: '7', userAns: 'Some typed answer here' }];
    const result = computeSessionScore(typed);
    expect(result.avgWpm).toBe(0); // no duration → typed
    expect(result.compositeScore).toBeGreaterThan(0);
  });

  test('composite score is weighted average of dimensions', () => {
    const result = computeSessionScore(mockAnswers);
    const expected = Math.round(
      result.technicalScore * SCORE_WEIGHTS.technical +
      result.fluencyScore * SCORE_WEIGHTS.fluency +
      result.paceScore * SCORE_WEIGHTS.pace +
      result.confidenceScore * SCORE_WEIGHTS.confidence +
      result.communicationScore * SCORE_WEIGHTS.communication
    );
    expect(result.compositeScore).toBe(expected);
  });
});

// ─── scoreToGrade ─────────────────────────────────────────────────────────────

describe('scoreToGrade', () => {
  const cases = [
    [100, 'A+'], [95, 'A+'], [90, 'A'], [85, 'A-'], [78, 'B+'],
    [72, 'B'], [66, 'B-'], [60, 'C+'], [54, 'C'], [48, 'C-'],
    [42, 'D'], [30, 'F'], [0, 'F'],
  ];

  test.each(cases)('score %i → grade %s', (score, expectedGrade) => {
    expect(scoreToGrade(score)).toBe(expectedGrade);
  });

  test('handles out-of-range inputs', () => {
    expect(scoreToGrade(-10)).toBe('F');
    expect(scoreToGrade(110)).toBe('A+');
  });

  test('handles non-numeric input', () => {
    expect(scoreToGrade(null)).toBe('F');
    expect(scoreToGrade(undefined)).toBe('F');
  });
});

// ─── getBenchmarkPercentile ───────────────────────────────────────────────────

describe('getBenchmarkPercentile', () => {
  test('returns 50th percentile for score at domain mean', () => {
    const pct = getBenchmarkPercentile(68, 'Frontend'); // mean=68
    expect(pct).toBeGreaterThanOrEqual(45);
    expect(pct).toBeLessThanOrEqual(55);
  });

  test('returns high percentile for score above mean', () => {
    const pct = getBenchmarkPercentile(90, 'Frontend');
    expect(pct).toBeGreaterThan(80);
  });

  test('returns low percentile for score below mean', () => {
    const pct = getBenchmarkPercentile(30, 'Frontend');
    expect(pct).toBeLessThan(20);
  });

  test('always returns value in 1–99 range', () => {
    [0, 50, 68, 90, 100].forEach(score => {
      const pct = getBenchmarkPercentile(score, 'Backend');
      expect(pct).toBeGreaterThanOrEqual(1);
      expect(pct).toBeLessThanOrEqual(99);
    });
  });

  test('falls back to General domain for unknown domain', () => {
    expect(() => getBenchmarkPercentile(65, 'NonExistentDomain')).not.toThrow();
  });
});

// ─── calibrateQuestionDifficulty ─────────────────────────────────────────────

describe('calibrateQuestionDifficulty', () => {
  test('classifies distributed systems as Expert', () => {
    expect(calibrateQuestionDifficulty('Explain distributed systems consistency models')).toBe('Expert');
  });

  test('classifies system design as Hard', () => {
    expect(calibrateQuestionDifficulty('How would you design a microservices architecture?')).toBe('Hard');
  });

  test('classifies REST API as Medium', () => {
    expect(calibrateQuestionDifficulty('What is a REST API?')).toBe('Medium');
  });

  test('classifies simple questions as Easy', () => {
    expect(calibrateQuestionDifficulty('Tell me about yourself')).toBe('Easy');
  });

  test('handles empty string gracefully', () => {
    expect(calibrateQuestionDifficulty('')).toBe('Easy');
  });

  test('handles null gracefully', () => {
    expect(calibrateQuestionDifficulty(null)).toBe('Easy');
  });

  test('is case-insensitive', () => {
    expect(calibrateQuestionDifficulty('DISTRIBUTED SYSTEMS architecture')).toBe('Expert');
  });
});

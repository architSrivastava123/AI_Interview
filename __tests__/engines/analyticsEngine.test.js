/**
 * analyticsEngine.test.js
 * Comprehensive unit tests for the analytics engine.
 */

const {
  buildPerformanceTrend,
  computeSkillGapMatrix,
  computeImprovementVelocity,
  getDomainBreakdown,
  computeStreakData,
  generateAnalyticsSnapshot,
  rankSessionsByPerformance,
} = require('../../utils/engines/analyticsEngine');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockSessions = [
  { mockIdRef: 'abc1', userEmail: 'a@b.com', compositeScore: 55, grade: 'C', jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 'abc2', userEmail: 'a@b.com', compositeScore: 68, grade: 'B', jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 'abc3', userEmail: 'a@b.com', compositeScore: 74, grade: 'B+', jobTrack: 'Backend', completedAt: '03-05-2025' },
  { mockIdRef: 'abc4', userEmail: 'a@b.com', compositeScore: 82, grade: 'A-', jobTrack: 'Backend', completedAt: '04-05-2025' },
  { mockIdRef: 'abc5', userEmail: 'a@b.com', compositeScore: 78, grade: 'B+', jobTrack: 'Frontend', completedAt: '06-05-2025' },
];

const mockScores = [
  { technicalScore: 60, fluencyScore: 70, paceScore: 75, confidenceScore: 65, communicationScore: 70, compositeScore: 55, mockIdRef: 'abc1' },
  { technicalScore: 70, fluencyScore: 75, paceScore: 80, confidenceScore: 72, communicationScore: 73, compositeScore: 68, mockIdRef: 'abc2' },
  { technicalScore: 78, fluencyScore: 80, paceScore: 82, confidenceScore: 78, communicationScore: 76, compositeScore: 74, mockIdRef: 'abc3' },
  { technicalScore: 85, fluencyScore: 82, paceScore: 84, confidenceScore: 83, communicationScore: 80, compositeScore: 82, mockIdRef: 'abc4' },
];

// ─── buildPerformanceTrend ────────────────────────────────────────────────────

describe('buildPerformanceTrend', () => {
  test('returns empty array for empty input', () => {
    expect(buildPerformanceTrend([])).toEqual([]);
  });

  test('returns empty array for null input', () => {
    expect(buildPerformanceTrend(null)).toEqual([]);
  });

  test('returns correct number of items', () => {
    const trend = buildPerformanceTrend(mockSessions);
    expect(trend.length).toBe(mockSessions.length);
  });

  test('sorts sessions by date ascending', () => {
    const shuffled = [...mockSessions].reverse();
    const trend = buildPerformanceTrend(shuffled);
    for (let i = 1; i < trend.length; i++) {
      expect(trend[i].score).toBeGreaterThanOrEqual(0); // all valid
    }
    // First item should be earliest date
    expect(trend[0].date).toBe('01-05-2025');
  });

  test('each item has required shape', () => {
    const trend = buildPerformanceTrend(mockSessions);
    trend.forEach(item => {
      expect(item).toHaveProperty('date');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('grade');
      expect(item).toHaveProperty('mockId');
    });
  });

  test('handles single session', () => {
    const trend = buildPerformanceTrend([mockSessions[0]]);
    expect(trend.length).toBe(1);
    expect(trend[0].score).toBe(55);
  });
});

// ─── computeSkillGapMatrix ────────────────────────────────────────────────────

describe('computeSkillGapMatrix', () => {
  test('returns correct structure for valid input', () => {
    const result = computeSkillGapMatrix(mockScores, 'Frontend');
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('overallGap');
    expect(result).toHaveProperty('targetRole');
    expect(Array.isArray(result.dimensions)).toBe(true);
  });

  test('returns 5 dimensions', () => {
    const result = computeSkillGapMatrix(mockScores, 'Frontend');
    expect(result.dimensions.length).toBe(5);
  });

  test('each dimension has required fields', () => {
    const result = computeSkillGapMatrix(mockScores, 'Frontend');
    result.dimensions.forEach(d => {
      expect(d).toHaveProperty('dimension');
      expect(d).toHaveProperty('candidateAvg');
      expect(d).toHaveProperty('target');
      expect(d).toHaveProperty('gap');
      expect(d).toHaveProperty('status');
    });
  });

  test('gap = candidateAvg - target', () => {
    const result = computeSkillGapMatrix(mockScores, 'Frontend');
    result.dimensions.forEach(d => {
      expect(d.gap).toBe(Math.round(d.candidateAvg - d.target));
    });
  });

  test('handles empty scores array', () => {
    const result = computeSkillGapMatrix([], 'Frontend');
    result.dimensions.forEach(d => {
      expect(d.candidateAvg).toBe(0);
      expect(d.status).toBe('critical');
    });
  });

  test('correct status classification', () => {
    const highScores = [
      { technicalScore: 90, fluencyScore: 90, paceScore: 90, confidenceScore: 90, communicationScore: 90 }
    ];
    const result = computeSkillGapMatrix(highScores, 'General');
    result.dimensions.forEach(d => {
      expect(['strong', 'on-track']).toContain(d.status);
    });
  });

  test('uses General benchmarks for unknown role', () => {
    const result = computeSkillGapMatrix(mockScores, 'UnknownRole');
    expect(result.targetRole).toBe('UnknownRole');
    expect(result.dimensions.length).toBe(5);
  });
});

// ─── computeImprovementVelocity ───────────────────────────────────────────────

describe('computeImprovementVelocity', () => {
  test('returns insufficient_data for single session', () => {
    const result = computeImprovementVelocity([mockSessions[0]]);
    expect(result.trend).toBe('insufficient_data');
    expect(result.velocity).toBe(0);
  });

  test('returns insufficient_data for empty array', () => {
    const result = computeImprovementVelocity([]);
    expect(result.trend).toBe('insufficient_data');
  });

  test('identifies improving trend for ascending scores', () => {
    const improving = [
      { compositeScore: 40 },
      { compositeScore: 55 },
      { compositeScore: 70 },
      { compositeScore: 85 },
    ];
    const result = computeImprovementVelocity(improving);
    expect(result.trend).toBe('improving');
    expect(result.velocity).toBeGreaterThan(0);
  });

  test('identifies declining trend for descending scores', () => {
    const declining = [
      { compositeScore: 85 },
      { compositeScore: 70 },
      { compositeScore: 55 },
      { compositeScore: 40 },
    ];
    const result = computeImprovementVelocity(declining);
    expect(result.trend).toBe('declining');
    expect(result.velocity).toBeLessThan(0);
  });

  test('identifies stable trend for flat scores', () => {
    const flat = [
      { compositeScore: 65 },
      { compositeScore: 65 },
      { compositeScore: 65 },
    ];
    const result = computeImprovementVelocity(flat);
    expect(result.trend).toBe('stable');
  });

  test('returns changePercent correctly', () => {
    const sessions = [{ compositeScore: 50 }, { compositeScore: 75 }];
    const result = computeImprovementVelocity(sessions);
    expect(result.changePercent).toBe(50); // 50% increase
  });

  test('returns shape { velocity, trend, changePercent }', () => {
    const result = computeImprovementVelocity(mockSessions);
    expect(result).toHaveProperty('velocity');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('changePercent');
  });
});

// ─── getDomainBreakdown ───────────────────────────────────────────────────────

describe('getDomainBreakdown', () => {
  test('returns empty array for empty input', () => {
    expect(getDomainBreakdown([])).toEqual([]);
  });

  test('groups sessions by domain', () => {
    const result = getDomainBreakdown(mockSessions);
    const domains = result.map(d => d.domain);
    expect(domains).toContain('Frontend');
    expect(domains).toContain('Backend');
  });

  test('counts sessions per domain correctly', () => {
    const result = getDomainBreakdown(mockSessions);
    const frontend = result.find(d => d.domain === 'Frontend');
    expect(frontend.count).toBe(3); // 3 Frontend sessions in mockSessions
  });

  test('computes avgScore correctly', () => {
    const result = getDomainBreakdown(mockSessions);
    const backend = result.find(d => d.domain === 'Backend');
    const expectedAvg = Math.round((74 + 82) / 2);
    expect(backend.avgScore).toBe(expectedAvg);
  });

  test('each item has required shape', () => {
    const result = getDomainBreakdown(mockSessions);
    result.forEach(d => {
      expect(d).toHaveProperty('domain');
      expect(d).toHaveProperty('count');
      expect(d).toHaveProperty('avgScore');
      expect(d).toHaveProperty('bestScore');
    });
  });
});

// ─── computeStreakData ────────────────────────────────────────────────────────

describe('computeStreakData', () => {
  test('returns zeros for empty input', () => {
    const result = computeStreakData([]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  test('handles single session', () => {
    const result = computeStreakData([{ completedAt: '01-05-2025' }]);
    expect(result.totalActiveDays).toBe(1);
    expect(result.longestStreak).toBeGreaterThanOrEqual(1);
  });

  test('consecutive sessions increase longest streak', () => {
    const consecutive = [
      { completedAt: '01-05-2025' },
      { completedAt: '02-05-2025' },
      { completedAt: '03-05-2025' },
    ];
    const result = computeStreakData(consecutive);
    expect(result.longestStreak).toBeGreaterThanOrEqual(3);
  });

  test('gap in dates resets streak', () => {
    const gapped = [
      { completedAt: '01-05-2025' },
      { completedAt: '02-05-2025' },
      { completedAt: '10-05-2025' }, // gap
    ];
    const result = computeStreakData(gapped);
    expect(result.longestStreak).toBeLessThan(3);
  });

  test('returns shape { currentStreak, longestStreak, totalActiveDays }', () => {
    const result = computeStreakData(mockSessions);
    expect(result).toHaveProperty('currentStreak');
    expect(result).toHaveProperty('longestStreak');
    expect(result).toHaveProperty('totalActiveDays');
  });
});

// ─── generateAnalyticsSnapshot ────────────────────────────────────────────────

describe('generateAnalyticsSnapshot', () => {
  test('returns correct shape', () => {
    const snapshot = generateAnalyticsSnapshot('a@b.com', mockSessions, mockScores);
    expect(snapshot).toHaveProperty('userEmail', 'a@b.com');
    expect(snapshot).toHaveProperty('totalSessions', mockSessions.length);
    expect(snapshot).toHaveProperty('avgCompositeScore');
    expect(snapshot).toHaveProperty('trendData');
    expect(snapshot).toHaveProperty('domainBreakdown');
  });

  test('computes avgCompositeScore correctly', () => {
    const snapshot = generateAnalyticsSnapshot('a@b.com', mockSessions, mockScores);
    const expected = Math.round((55 + 68 + 74 + 82 + 78) / 5);
    expect(snapshot.avgCompositeScore).toBe(expected);
  });

  test('trendData is valid JSON string', () => {
    const snapshot = generateAnalyticsSnapshot('a@b.com', mockSessions, mockScores);
    expect(() => JSON.parse(snapshot.trendData)).not.toThrow();
  });

  test('handles empty sessions', () => {
    const snapshot = generateAnalyticsSnapshot('a@b.com', [], []);
    expect(snapshot.totalSessions).toBe(0);
    expect(snapshot.avgCompositeScore).toBe(0);
  });
});

// ─── rankSessionsByPerformance ────────────────────────────────────────────────

describe('rankSessionsByPerformance', () => {
  test('returns sessions sorted by score descending', () => {
    const ranked = rankSessionsByPerformance(mockSessions);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(Number(ranked[i].compositeScore)).toBeGreaterThanOrEqual(Number(ranked[i + 1].compositeScore));
    }
  });

  test('first session is best performer', () => {
    const ranked = rankSessionsByPerformance(mockSessions);
    expect(ranked[0].compositeScore).toBe(82);
  });

  test('returns empty array for null input', () => {
    expect(rankSessionsByPerformance(null)).toEqual([]);
  });

  test('does not mutate original array', () => {
    const original = [...mockSessions];
    rankSessionsByPerformance(mockSessions);
    expect(mockSessions[0].compositeScore).toBe(original[0].compositeScore);
  });
});

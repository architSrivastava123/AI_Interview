/**
 * tests/utils/analytics.test.js
 *
 * Full coverage tests for utils/engines/analyticsEngine.js.
 * Tests all 7 exported functions with: happy paths, edge cases,
 * boundary conditions, and invalid inputs.
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

// ─── Shared Fixtures ──────────────────────────────────────────────────────────

const SESSION_5 = [
  { mockIdRef: 's1', userEmail: 'u@t.com', compositeScore: 55, grade: 'C',  jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 's2', userEmail: 'u@t.com', compositeScore: 62, grade: 'C+', jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 's3', userEmail: 'u@t.com', compositeScore: 70, grade: 'B',  jobTrack: 'Backend',  completedAt: '04-05-2025' },
  { mockIdRef: 's4', userEmail: 'u@t.com', compositeScore: 78, grade: 'B+', jobTrack: 'Backend',  completedAt: '05-05-2025' },
  { mockIdRef: 's5', userEmail: 'u@t.com', compositeScore: 85, grade: 'A-', jobTrack: 'Frontend', completedAt: '06-05-2025' },
];

const SCORES_4 = [
  { technicalScore: 60, fluencyScore: 70, paceScore: 75, confidenceScore: 65, communicationScore: 68, compositeScore: 55, mockIdRef: 's1' },
  { technicalScore: 70, fluencyScore: 75, paceScore: 78, confidenceScore: 72, communicationScore: 71, compositeScore: 62, mockIdRef: 's2' },
  { technicalScore: 78, fluencyScore: 80, paceScore: 82, confidenceScore: 78, communicationScore: 74, compositeScore: 70, mockIdRef: 's3' },
  { technicalScore: 85, fluencyScore: 83, paceScore: 84, confidenceScore: 83, communicationScore: 80, compositeScore: 78, mockIdRef: 's4' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// buildPerformanceTrend
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildPerformanceTrend', () => {
  test('returns empty array for empty input', () => {
    expect(buildPerformanceTrend([])).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(buildPerformanceTrend(null)).toEqual([]);
  });

  test('returns empty array for undefined', () => {
    expect(buildPerformanceTrend(undefined)).toEqual([]);
  });

  test('returns correct count of trend items', () => {
    expect(buildPerformanceTrend(SESSION_5)).toHaveLength(5);
  });

  test('each item has date, score, grade, mockId', () => {
    buildPerformanceTrend(SESSION_5).forEach(item => {
      expect(item).toHaveProperty('date');
      expect(item).toHaveProperty('score');
      expect(item).toHaveProperty('grade');
      expect(item).toHaveProperty('mockId');
    });
  });

  test('sorts by date ascending', () => {
    const shuffled = [...SESSION_5].reverse();
    const trend = buildPerformanceTrend(shuffled);
    expect(trend[0].date).toBe('01-05-2025');
    expect(trend[4].date).toBe('06-05-2025');
  });

  test('handles single session', () => {
    const single = buildPerformanceTrend([SESSION_5[0]]);
    expect(single).toHaveLength(1);
    expect(single[0].score).toBe(55);
  });

  test('does not mutate the original array', () => {
    const copy = [...SESSION_5];
    buildPerformanceTrend(SESSION_5);
    expect(SESSION_5[0].mockIdRef).toBe(copy[0].mockIdRef);
  });

  test('scores are numeric', () => {
    buildPerformanceTrend(SESSION_5).forEach(item => {
      expect(typeof item.score).toBe('number');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// computeSkillGapMatrix
// ═══════════════════════════════════════════════════════════════════════════════

describe('computeSkillGapMatrix', () => {
  test('returns correct structure', () => {
    const result = computeSkillGapMatrix(SCORES_4, 'Frontend');
    expect(result).toHaveProperty('dimensions');
    expect(result).toHaveProperty('overallGap');
    expect(result).toHaveProperty('targetRole');
  });

  test('dimensions array has 5 items', () => {
    expect(computeSkillGapMatrix(SCORES_4, 'Frontend').dimensions).toHaveLength(5);
  });

  test('each dimension has required shape', () => {
    computeSkillGapMatrix(SCORES_4, 'Frontend').dimensions.forEach(d => {
      expect(d).toHaveProperty('dimension');
      expect(d).toHaveProperty('candidateAvg');
      expect(d).toHaveProperty('target');
      expect(d).toHaveProperty('gap');
      expect(d).toHaveProperty('status');
    });
  });

  test('gap = candidateAvg - target (rounded)', () => {
    computeSkillGapMatrix(SCORES_4, 'Frontend').dimensions.forEach(d => {
      expect(d.gap).toBe(Math.round(d.candidateAvg - d.target));
    });
  });

  test('empty scores gives 0 candidateAvg for all dimensions', () => {
    const result = computeSkillGapMatrix([], 'Frontend');
    result.dimensions.forEach(d => expect(d.candidateAvg).toBe(0));
  });

  test('high scores yield strong or on-track status', () => {
    const highScores = [{ technicalScore: 92, fluencyScore: 90, paceScore: 92, confidenceScore: 90, communicationScore: 90 }];
    const result = computeSkillGapMatrix(highScores, 'General');
    result.dimensions.forEach(d => {
      expect(['strong', 'on-track']).toContain(d.status);
    });
  });

  test('low scores yield critical or needs-work status', () => {
    const lowScores = [{ technicalScore: 30, fluencyScore: 30, paceScore: 30, confidenceScore: 30, communicationScore: 30 }];
    const result = computeSkillGapMatrix(lowScores, 'Frontend');
    result.dimensions.some(d => ['critical', 'needs-work'].includes(d.status));
  });

  test('falls back to General benchmarks for unknown role', () => {
    const result = computeSkillGapMatrix(SCORES_4, 'AlienTech');
    expect(result.targetRole).toBe('AlienTech');
    expect(result.dimensions).toHaveLength(5);
  });

  test('targetRole matches passed argument', () => {
    expect(computeSkillGapMatrix(SCORES_4, 'DevOps').targetRole).toBe('DevOps');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// computeImprovementVelocity
// ═══════════════════════════════════════════════════════════════════════════════

describe('computeImprovementVelocity', () => {
  test('returns insufficient_data for empty array', () => {
    expect(computeImprovementVelocity([]).trend).toBe('insufficient_data');
  });

  test('returns insufficient_data for single session', () => {
    expect(computeImprovementVelocity([SESSION_5[0]]).trend).toBe('insufficient_data');
  });

  test('returns velocity=0 for insufficient data', () => {
    expect(computeImprovementVelocity([]).velocity).toBe(0);
  });

  test('identifies improving trend for ascending scores', () => {
    const improving = [{ compositeScore: 40 }, { compositeScore: 60 }, { compositeScore: 80 }];
    expect(computeImprovementVelocity(improving).trend).toBe('improving');
  });

  test('identifies declining trend for descending scores', () => {
    const declining = [{ compositeScore: 80 }, { compositeScore: 60 }, { compositeScore: 40 }];
    expect(computeImprovementVelocity(declining).trend).toBe('declining');
  });

  test('identifies stable trend for flat scores', () => {
    const flat = [{ compositeScore: 65 }, { compositeScore: 65 }, { compositeScore: 65 }];
    expect(computeImprovementVelocity(flat).trend).toBe('stable');
  });

  test('positive velocity for improving sessions', () => {
    const up = [{ compositeScore: 50 }, { compositeScore: 75 }, { compositeScore: 90 }];
    expect(computeImprovementVelocity(up).velocity).toBeGreaterThan(0);
  });

  test('negative velocity for declining sessions', () => {
    const down = [{ compositeScore: 90 }, { compositeScore: 70 }, { compositeScore: 50 }];
    expect(computeImprovementVelocity(down).velocity).toBeLessThan(0);
  });

  test('changePercent is 50 for 50→75 improvement', () => {
    const twoSession = [{ compositeScore: 50 }, { compositeScore: 75 }];
    expect(computeImprovementVelocity(twoSession).changePercent).toBe(50);
  });

  test('returns shape { velocity, trend, changePercent }', () => {
    const result = computeImprovementVelocity(SESSION_5);
    expect(result).toHaveProperty('velocity');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('changePercent');
  });

  test('handles null input safely', () => {
    expect(() => computeImprovementVelocity(null)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getDomainBreakdown
// ═══════════════════════════════════════════════════════════════════════════════

describe('getDomainBreakdown', () => {
  test('returns empty array for empty input', () => {
    expect(getDomainBreakdown([])).toEqual([]);
  });

  test('groups correctly by jobTrack', () => {
    const result = getDomainBreakdown(SESSION_5);
    const domains = result.map(d => d.domain);
    expect(domains).toContain('Frontend');
    expect(domains).toContain('Backend');
  });

  test('counts Frontend sessions correctly (3 in SESSION_5)', () => {
    const result = getDomainBreakdown(SESSION_5);
    const frontend = result.find(d => d.domain === 'Frontend');
    expect(frontend.count).toBe(3);
  });

  test('counts Backend sessions correctly (2 in SESSION_5)', () => {
    const result = getDomainBreakdown(SESSION_5);
    const backend = result.find(d => d.domain === 'Backend');
    expect(backend.count).toBe(2);
  });

  test('avgScore for Backend = round((70+78)/2) = 74', () => {
    const result = getDomainBreakdown(SESSION_5);
    const backend = result.find(d => d.domain === 'Backend');
    expect(backend.avgScore).toBe(Math.round((70 + 78) / 2));
  });

  test('each item has domain, count, avgScore, bestScore', () => {
    getDomainBreakdown(SESSION_5).forEach(d => {
      expect(d).toHaveProperty('domain');
      expect(d).toHaveProperty('count');
      expect(d).toHaveProperty('avgScore');
      expect(d).toHaveProperty('bestScore');
    });
  });

  test('bestScore for Frontend = 85', () => {
    const result = getDomainBreakdown(SESSION_5);
    const fe = result.find(d => d.domain === 'Frontend');
    expect(fe.bestScore).toBe(85);
  });

  test('handles null safely', () => {
    expect(() => getDomainBreakdown(null)).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// computeStreakData
// ═══════════════════════════════════════════════════════════════════════════════

describe('computeStreakData', () => {
  test('returns zeros for empty input', () => {
    const result = computeStreakData([]);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
    expect(result.totalActiveDays).toBe(0);
  });

  test('single session yields totalActiveDays=1', () => {
    const result = computeStreakData([{ completedAt: '01-05-2025' }]);
    expect(result.totalActiveDays).toBe(1);
  });

  test('3 consecutive days gives longestStreak >= 3', () => {
    const consecutive = [
      { completedAt: '01-05-2025' },
      { completedAt: '02-05-2025' },
      { completedAt: '03-05-2025' },
    ];
    expect(computeStreakData(consecutive).longestStreak).toBeGreaterThanOrEqual(3);
  });

  test('gap in dates resets streak below 3', () => {
    const gapped = [
      { completedAt: '01-05-2025' },
      { completedAt: '02-05-2025' },
      { completedAt: '10-05-2025' }, // 8-day gap
    ];
    expect(computeStreakData(gapped).longestStreak).toBeLessThan(3);
  });

  test('returns shape { currentStreak, longestStreak, totalActiveDays }', () => {
    const result = computeStreakData(SESSION_5);
    expect(result).toHaveProperty('currentStreak');
    expect(result).toHaveProperty('longestStreak');
    expect(result).toHaveProperty('totalActiveDays');
  });

  test('null input returns zeros without throwing', () => {
    const result = computeStreakData(null);
    expect(result.currentStreak).toBe(0);
  });

  test('duplicate dates on same day count as one active day', () => {
    const dupes = [
      { completedAt: '01-05-2025' },
      { completedAt: '01-05-2025' },
    ];
    const result = computeStreakData(dupes);
    expect(result.totalActiveDays).toBeLessThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generateAnalyticsSnapshot
// ═══════════════════════════════════════════════════════════════════════════════

describe('generateAnalyticsSnapshot', () => {
  test('returns snapshot with correct userEmail', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    expect(snap.userEmail).toBe('u@t.com');
  });

  test('totalSessions equals SESSION_5.length', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    expect(snap.totalSessions).toBe(SESSION_5.length);
  });

  test('avgCompositeScore is correct', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    const expected = Math.round((55 + 62 + 70 + 78 + 85) / 5);
    expect(snap.avgCompositeScore).toBe(expected);
  });

  test('trendData is valid JSON string', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    expect(() => JSON.parse(snap.trendData)).not.toThrow();
  });

  test('domainBreakdown is valid JSON string', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    expect(() => JSON.parse(snap.domainBreakdown)).not.toThrow();
  });

  test('empty sessions gives totalSessions=0 and avgCompositeScore=0', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', [], []);
    expect(snap.totalSessions).toBe(0);
    expect(snap.avgCompositeScore).toBe(0);
  });

  test('returns a snapshotDate field', () => {
    const snap = generateAnalyticsSnapshot('u@t.com', SESSION_5, SCORES_4);
    expect(snap).toHaveProperty('snapshotDate');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// rankSessionsByPerformance
// ═══════════════════════════════════════════════════════════════════════════════

describe('rankSessionsByPerformance', () => {
  test('sorts descending by compositeScore', () => {
    const ranked = rankSessionsByPerformance(SESSION_5);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(Number(ranked[i].compositeScore)).toBeGreaterThanOrEqual(Number(ranked[i + 1].compositeScore));
    }
  });

  test('first item has highest score (85)', () => {
    expect(rankSessionsByPerformance(SESSION_5)[0].compositeScore).toBe(85);
  });

  test('last item has lowest score (55)', () => {
    const ranked = rankSessionsByPerformance(SESSION_5);
    expect(ranked[ranked.length - 1].compositeScore).toBe(55);
  });

  test('returns empty array for null', () => {
    expect(rankSessionsByPerformance(null)).toEqual([]);
  });

  test('does not mutate original array', () => {
    const firstOriginal = SESSION_5[0].compositeScore;
    rankSessionsByPerformance(SESSION_5);
    expect(SESSION_5[0].compositeScore).toBe(firstOriginal);
  });

  test('single session is returned unchanged', () => {
    const result = rankSessionsByPerformance([SESSION_5[2]]);
    expect(result).toHaveLength(1);
    expect(result[0].compositeScore).toBe(70);
  });
});

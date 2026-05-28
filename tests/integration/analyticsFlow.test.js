/**
 * tests/integration/analyticsFlow.test.js
 *
 * Integration tests for the analytics pipeline:
 *   sessions → trend → skill gap → velocity → streak → snapshot
 *
 * All 7 analyticsEngine functions are exercised as a connected pipeline.
 */

jest.mock('../../utils/engines/analyticsEngine', () => jest.requireActual('../../utils/engines/analyticsEngine'));
jest.mock('../../utils/engines/scoringEngine', () => jest.requireActual('../../utils/engines/scoringEngine'));

const {
  buildPerformanceTrend,
  computeSkillGapMatrix,
  computeImprovementVelocity,
  getDomainBreakdown,
  computeStreakData,
  generateAnalyticsSnapshot,
  rankSessionsByPerformance,
} = require('../../utils/engines/analyticsEngine');

const { computeSessionScore } = require('../../utils/engines/scoringEngine');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const SESSIONS_8 = [
  { mockIdRef: 's1', userEmail: 'u@t.com', compositeScore: 45, grade: 'F',  jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 's2', userEmail: 'u@t.com', compositeScore: 52, grade: 'C',  jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 's3', userEmail: 'u@t.com', compositeScore: 60, grade: 'C+', jobTrack: 'Backend',  completedAt: '03-05-2025' },
  { mockIdRef: 's4', userEmail: 'u@t.com', compositeScore: 65, grade: 'C+', jobTrack: 'Backend',  completedAt: '04-05-2025' },
  { mockIdRef: 's5', userEmail: 'u@t.com', compositeScore: 72, grade: 'B',  jobTrack: 'Frontend', completedAt: '05-05-2025' },
  { mockIdRef: 's6', userEmail: 'u@t.com', compositeScore: 78, grade: 'B+', jobTrack: 'Full Stack', completedAt: '06-05-2025' },
  { mockIdRef: 's7', userEmail: 'u@t.com', compositeScore: 84, grade: 'A-', jobTrack: 'Full Stack', completedAt: '07-05-2025' },
  { mockIdRef: 's8', userEmail: 'u@t.com', compositeScore: 90, grade: 'A+', jobTrack: 'Backend',  completedAt: '08-05-2025' },
];

const SCORES_8 = SESSIONS_8.map((s, i) => ({
  mockIdRef: s.mockIdRef,
  technicalScore: 40 + i * 6,
  fluencyScore: 45 + i * 5,
  paceScore: 50 + i * 4,
  confidenceScore: 42 + i * 6,
  communicationScore: 43 + i * 6,
  compositeScore: s.compositeScore,
}));

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 1: Trend
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 1: Performance Trend', () => {
  let trend;
  beforeAll(() => { trend = buildPerformanceTrend(SESSIONS_8); });

  test('returns 8 trend data points for 8 sessions', () => {
    expect(trend).toHaveLength(8);
  });

  test('trend is sorted by date ascending', () => {
    expect(trend[0].date).toBe('01-05-2025');
    expect(trend[7].date).toBe('08-05-2025');
  });

  test('trend scores are monotonically increasing (matching sessions)', () => {
    for (let i = 0; i < trend.length - 1; i++) {
      expect(trend[i + 1].score).toBeGreaterThan(trend[i].score);
    }
  });

  test('first trend score = 45 (s1)', () => {
    expect(trend[0].score).toBe(45);
  });

  test('last trend score = 90 (s8)', () => {
    expect(trend[7].score).toBe(90);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 2: Skill Gap Matrix
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 2: Skill Gap Matrix', () => {
  let skillGap;
  beforeAll(() => { skillGap = computeSkillGapMatrix(SCORES_8, 'Frontend'); });

  test('targetRole is Frontend', () => {
    expect(skillGap.targetRole).toBe('Frontend');
  });

  test('all 5 dimensions present', () => {
    const dims = skillGap.dimensions.map(d => d.dimension);
    expect(dims).toContain('technical');
    expect(dims).toContain('fluency');
    expect(dims).toContain('pace');
    expect(dims).toContain('confidence');
    expect(dims).toContain('communication');
  });

  test('overallGap is a number', () => {
    expect(typeof skillGap.overallGap).toBe('number');
  });

  test('improving sessions should yield positive or small negative avg gap', () => {
    // With sessions improving from 45→90, avg technical ≈ 64, target ≈ 80 for Frontend
    const techDim = skillGap.dimensions.find(d => d.dimension === 'technical');
    expect(techDim.gap).toBeLessThanOrEqual(0); // still catching up
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 3: Improvement Velocity
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 3: Improvement Velocity', () => {
  let velocity;
  beforeAll(() => { velocity = computeImprovementVelocity(SESSIONS_8); });

  test('trend is improving for ascending scores', () => {
    expect(velocity.trend).toBe('improving');
  });

  test('velocity > 0 for improving sessions', () => {
    expect(velocity.velocity).toBeGreaterThan(0);
  });

  test('changePercent = 100 * (90-45)/45 = 100', () => {
    // changePercent = round((last - first) / first * 100)
    expect(velocity.changePercent).toBeCloseTo(100, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 4: Domain Breakdown
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 4: Domain Breakdown', () => {
  let domains;
  beforeAll(() => { domains = getDomainBreakdown(SESSIONS_8); });

  test('returns 3 unique domains: Frontend, Backend, Full Stack', () => {
    expect(domains).toHaveLength(3);
    const domainNames = domains.map(d => d.domain);
    expect(domainNames).toContain('Frontend');
    expect(domainNames).toContain('Backend');
    expect(domainNames).toContain('Full Stack');
  });

  test('Frontend count = 3 (s1, s2, s5)', () => {
    expect(domains.find(d => d.domain === 'Frontend').count).toBe(3);
  });

  test('Backend count = 3 (s3, s4, s8)', () => {
    expect(domains.find(d => d.domain === 'Backend').count).toBe(3);
  });

  test('Full Stack count = 2 (s6, s7)', () => {
    expect(domains.find(d => d.domain === 'Full Stack').count).toBe(2);
  });

  test('Backend bestScore = 90', () => {
    expect(domains.find(d => d.domain === 'Backend').bestScore).toBe(90);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 5: Streak Data
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 5: Streak Data', () => {
  let streaks;
  beforeAll(() => { streaks = computeStreakData(SESSIONS_8); });

  test('longestStreak ≥ 8 for 8 consecutive days', () => {
    expect(streaks.longestStreak).toBeGreaterThanOrEqual(8);
  });

  test('totalActiveDays ≥ 8', () => {
    expect(streaks.totalActiveDays).toBeGreaterThanOrEqual(8);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 6: Analytics Snapshot
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 6: Analytics Snapshot', () => {
  let snapshot;
  beforeAll(() => {
    snapshot = generateAnalyticsSnapshot('u@t.com', SESSIONS_8, SCORES_8);
  });

  test('totalSessions = 8', () => {
    expect(snapshot.totalSessions).toBe(8);
  });

  test('avgCompositeScore = round((45+52+60+65+72+78+84+90)/8) = 68', () => {
    const expected = Math.round((45 + 52 + 60 + 65 + 72 + 78 + 84 + 90) / 8);
    expect(snapshot.avgCompositeScore).toBe(expected);
  });

  test('trendData is valid JSON containing 8 entries', () => {
    const trend = JSON.parse(snapshot.trendData);
    expect(trend).toHaveLength(8);
  });

  test('domainBreakdown contains Frontend', () => {
    const breakdown = JSON.parse(snapshot.domainBreakdown);
    expect(breakdown.some(d => d.domain === 'Frontend')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Pipeline Step 7: Rank Sessions
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Step 7: Rank Sessions', () => {
  let ranked;
  beforeAll(() => { ranked = rankSessionsByPerformance(SESSIONS_8); });

  test('first ranked session has highest score (90)', () => {
    expect(ranked[0].compositeScore).toBe(90);
  });

  test('last ranked session has lowest score (45)', () => {
    expect(ranked[ranked.length - 1].compositeScore).toBe(45);
  });

  test('all 8 sessions are ranked', () => {
    expect(ranked).toHaveLength(8);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Snapshot ↔ Raw scores consistency
// ═══════════════════════════════════════════════════════════════════════════════

describe('Analytics Flow — Cross-module consistency', () => {
  test('snapshot avgCompositeScore matches trend first→last range', () => {
    const snapshot = generateAnalyticsSnapshot('u@t.com', SESSIONS_8, SCORES_8);
    const trend = buildPerformanceTrend(SESSIONS_8);
    const trendAvg = Math.round(trend.reduce((s, d) => s + d.score, 0) / trend.length);
    expect(snapshot.avgCompositeScore).toBe(trendAvg);
  });

  test('domain breakdown totals = session count', () => {
    const breakdown = getDomainBreakdown(SESSIONS_8);
    const total = breakdown.reduce((s, d) => s + d.count, 0);
    expect(total).toBe(SESSIONS_8.length);
  });
});

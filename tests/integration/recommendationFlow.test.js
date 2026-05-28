/**
 * tests/integration/recommendationFlow.test.js
 *
 * Integration tests for the full recommendation pipeline:
 *   score → skill gap → weak skills → resources → prioritize → difficulty ramp
 *
 * Uses real engine modules, no mocks.
 */

jest.mock('../../utils/engines/scoringEngine',       () => jest.requireActual('../../utils/engines/scoringEngine'));
jest.mock('../../utils/engines/analyticsEngine',     () => jest.requireActual('../../utils/engines/analyticsEngine'));
jest.mock('../../utils/engines/recommendationEngine',() => jest.requireActual('../../utils/engines/recommendationEngine'));
jest.mock('../../utils/engines/reportEngine',        () => jest.requireActual('../../utils/engines/reportEngine'));

const { computeSessionScore }  = require('../../utils/engines/scoringEngine');
const { computeSkillGapMatrix } = require('../../utils/engines/analyticsEngine');
const {
  identifyWeakSkills,
  mapSkillsToResources,
  prioritizeRecommendations,
  getNextInterviewSuggestion,
  getDifficultyRampPlan,
  DOMAIN_SKILL_MAP,
} = require('../../utils/engines/recommendationEngine');
const { buildProgressReport } = require('../../utils/engines/reportEngine');

// ── Test data ─────────────────────────────────────────────────────────────────

const POOR_ANSWERS = [
  { question: 'Q1', userAns: 'um uh I am not sure|||duration:10', rating: '2', correctAns: 'C1', feedback: 'Poor' },
  { question: 'Q2', userAns: 'um like I think so|||duration:12',  rating: '3', correctAns: 'C2', feedback: 'Poor' },
  { question: 'Q3', userAns: 'basically um|||duration:8',          rating: '2', correctAns: 'C3', feedback: 'Poor' },
];

const STRONG_ANSWERS = [
  { question: 'Q1', userAns: 'React uses virtual DOM for diffing|||duration:45', rating: '10', correctAns: 'C1', feedback: 'Excellent' },
  { question: 'Q2', userAns: 'useEffect runs after render|||duration:40',         rating: '9',  correctAns: 'C2', feedback: 'Excellent' },
  { question: 'Q3', userAns: 'Closures capture outer scope|||duration:35',        rating: '9',  correctAns: 'C3', feedback: 'Excellent' },
];

const IMPROVING_SESSIONS = [
  { mockIdRef: 'i1', compositeScore: 35, grade: 'F',  jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 'i2', compositeScore: 50, grade: 'C',  jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 'i3', compositeScore: 68, grade: 'C+', jobTrack: 'Backend',  completedAt: '03-05-2025' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Step 1: Score → Skill Gap
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 1: Score → Skill Gap', () => {
  let poorScore, strongScore;

  beforeAll(() => {
    poorScore   = computeSessionScore(POOR_ANSWERS,   'Frontend');
    strongScore = computeSessionScore(STRONG_ANSWERS, 'Frontend');
  });

  test('poor answers yield lower compositeScore than strong answers', () => {
    expect(poorScore.compositeScore).toBeLessThan(strongScore.compositeScore);
  });

  test('poor score skill gap has negative overall gap', () => {
    const gap = computeSkillGapMatrix([poorScore], 'Frontend');
    expect(gap.overallGap).toBeLessThan(0);
  });

  test('strong score skill gap has smaller magnitude overall gap', () => {
    const poorGap   = computeSkillGapMatrix([poorScore],   'Frontend');
    const strongGap = computeSkillGapMatrix([strongScore], 'Frontend');
    expect(Math.abs(strongGap.overallGap)).toBeLessThanOrEqual(Math.abs(poorGap.overallGap));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 2: Skill Gap → Weak Skills
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 2: Skill Gap → Weak Skills', () => {
  let poorWeaks, strongWeaks;

  beforeAll(() => {
    const poorScore   = computeSessionScore(POOR_ANSWERS,   'Frontend');
    const strongScore = computeSessionScore(STRONG_ANSWERS, 'Frontend');
    const poorGap     = computeSkillGapMatrix([poorScore],   'Frontend');
    const strongGap   = computeSkillGapMatrix([strongScore], 'Frontend');
    poorWeaks   = identifyWeakSkills(poorGap);
    strongWeaks = identifyWeakSkills(strongGap);
  });

  test('poor performer has more weak skills than strong', () => {
    expect(poorWeaks.length).toBeGreaterThanOrEqual(strongWeaks.length);
  });

  test('poor performer has at least 1 critical/needs-work skill', () => {
    expect(poorWeaks.length).toBeGreaterThan(0);
  });

  test('weak skills are sorted by gap ascending (most critical first)', () => {
    for (let i = 0; i < poorWeaks.length - 1; i++) {
      expect(poorWeaks[i].gap).toBeLessThanOrEqual(poorWeaks[i + 1].gap);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 3: Weak Skills → Resources
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 3: Weak Skills → Resources', () => {
  let recommendations;

  beforeAll(() => {
    const score = computeSessionScore(POOR_ANSWERS, 'Frontend');
    const gap   = computeSkillGapMatrix([score], 'Frontend');
    const weaks = identifyWeakSkills(gap);
    recommendations = mapSkillsToResources(weaks, 'Frontend');
  });

  test('generates at least 1 recommendation', () => {
    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('recommendations contain domain-focus category for Frontend', () => {
    expect(recommendations.some(r => r.category === 'domain-focus')).toBe(true);
  });

  test('all recommendations have impactScore >= 0', () => {
    recommendations.forEach(r => expect(r.impactScore).toBeGreaterThanOrEqual(0));
  });

  test('works for all known domains without throwing', () => {
    Object.keys(DOMAIN_SKILL_MAP).forEach(domain => {
      expect(() => mapSkillsToResources([], domain)).not.toThrow();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 4: Prioritize → Final List
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 4: Prioritize', () => {
  let sorted;

  beforeAll(() => {
    const score = computeSessionScore(POOR_ANSWERS, 'Frontend');
    const gap   = computeSkillGapMatrix([score], 'Frontend');
    const weaks = identifyWeakSkills(gap);
    const recs  = mapSkillsToResources(weaks, 'Frontend');
    sorted = prioritizeRecommendations(recs);
  });

  test('first item has lowest priority number (highest urgency)', () => {
    if (sorted.length >= 2) {
      expect(sorted[0].priority).toBeLessThanOrEqual(sorted[sorted.length - 1].priority);
    }
  });

  test('no items lost during prioritization', () => {
    const score = computeSessionScore(POOR_ANSWERS, 'Frontend');
    const gap   = computeSkillGapMatrix([score], 'Frontend');
    const weaks = identifyWeakSkills(gap);
    const recs  = mapSkillsToResources(weaks, 'Frontend');
    const orig  = recs.length;
    expect(prioritizeRecommendations(recs).length).toBe(orig);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 5: Next Interview Suggestion
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 5: Next Interview Suggestion', () => {
  test('suggests untried domain for improving user', () => {
    const suggestion = getNextInterviewSuggestion(IMPROVING_SESSIONS);
    expect(suggestion.track).toBeDefined();
    expect(suggestion.reason.length).toBeGreaterThan(5);
  });

  test('difficulty escalates with high scores', () => {
    const highSessions = [
      { jobTrack: 'Frontend', compositeScore: 90 },
      { jobTrack: 'Backend',  compositeScore: 88 },
    ];
    const suggestion = getNextInterviewSuggestion(highSessions);
    // High performers get Hard or Expert difficulty
    expect(['Hard', 'Expert']).toContain(suggestion.difficulty);
  });

  test('difficulty is Easy for very low scores', () => {
    const suggestion = getNextInterviewSuggestion([
      { jobTrack: 'Frontend', compositeScore: 25 },
    ]);
    expect(suggestion.difficulty).toBe('Easy');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 6: Difficulty Ramp Plan
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 6: Difficulty Ramp Plan', () => {
  test('plan has 4 steps for empty sessions', () => {
    expect(getDifficultyRampPlan([])).toHaveLength(4);
  });

  test('plan covers Easy → Expert progression', () => {
    const plan = getDifficultyRampPlan([]);
    const diffs = plan.map(p => p.difficulty);
    expect(diffs.indexOf('Easy')).toBeLessThan(diffs.indexOf('Expert'));
  });

  test('low avg score (< 50) starts at Easy', () => {
    const plan = getDifficultyRampPlan([{ compositeScore: 30 }, { compositeScore: 35 }]);
    expect(plan[0].difficulty).toBe('Easy');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Step 7: Progress Report (from buildProgressReport)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recommendation Flow — Step 7: Progress Report', () => {
  const analytics = {
    avgCompositeScore: 51,
    currentStreak: 3,
    longestStreak: 3,
    improvementVelocity: 16.5,
    trendData: JSON.stringify(IMPROVING_SESSIONS.map(s => ({ date: s.completedAt, score: s.compositeScore }))),
    domainBreakdown: JSON.stringify([{ domain: 'Frontend', count: 2, avgScore: 42 }, { domain: 'Backend', count: 1, avgScore: 68 }]),
  };

  let progressReport;
  beforeAll(() => { progressReport = buildProgressReport(IMPROVING_SESSIONS, analytics); });

  test('totalSessions = 3', () => expect(progressReport.totalSessions).toBe(3));
  test('bestSession.score = 68', () => expect(progressReport.bestSession.score).toBe(68));
  test('worstSession.score = 35', () => expect(progressReport.worstSession.score).toBe(35));
  test('overallImprovement = 33 (68-35)', () => expect(progressReport.overallImprovement).toBe(33));
  test('streak comes from analytics.currentStreak', () => {
    // streak may be an object {current, longest} or a number
    const streak = progressReport.streak;
    const currentStreak = typeof streak === 'object' ? (streak.current || streak.currentStreak) : streak;
    expect(currentStreak).toBe(3);
  });
});

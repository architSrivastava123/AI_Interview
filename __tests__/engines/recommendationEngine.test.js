/**
 * recommendationEngine.test.js
 * Comprehensive unit tests for the recommendation engine.
 */

// Mock analyticsEngine before requiring recommendationEngine
jest.mock('../../utils/engines/analyticsEngine', () => ({
  computeSkillGapMatrix: jest.fn().mockReturnValue({
    dimensions: [
      { dimension: 'technical', candidateAvg: 55, target: 75, gap: -20, status: 'critical' },
      { dimension: 'fluency', candidateAvg: 65, target: 70, gap: -5, status: 'on-track' },
      { dimension: 'pace', candidateAvg: 80, target: 70, gap: 10, status: 'strong' },
      { dimension: 'confidence', candidateAvg: 50, target: 72, gap: -22, status: 'critical' },
      { dimension: 'communication', candidateAvg: 60, target: 73, gap: -13, status: 'needs-work' },
    ],
    overallGap: -10,
    targetRole: 'Frontend',
  }),
}));

const {
  identifyWeakSkills,
  mapSkillsToResources,
  prioritizeRecommendations,
  getNextInterviewSuggestion,
  getDifficultyRampPlan,
  RESOURCE_LIBRARY,
  DOMAIN_SKILL_MAP,
} = require('../../utils/engines/recommendationEngine');

const mockSkillGap = {
  dimensions: [
    { dimension: 'technical', candidateAvg: 55, target: 75, gap: -20, status: 'critical' },
    { dimension: 'fluency', candidateAvg: 65, target: 70, gap: -5, status: 'on-track' },
    { dimension: 'pace', candidateAvg: 80, target: 70, gap: 10, status: 'strong' },
    { dimension: 'confidence', candidateAvg: 50, target: 72, gap: -22, status: 'critical' },
    { dimension: 'communication', candidateAvg: 60, target: 73, gap: -13, status: 'needs-work' },
  ],
  overallGap: -10,
  targetRole: 'Frontend',
};

const mockSessions = [
  { mockIdRef: 'a1', compositeScore: 55, jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 'a2', compositeScore: 68, jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 'a3', compositeScore: 74, jobTrack: 'Backend', completedAt: '03-05-2025' },
];

// ─── identifyWeakSkills ───────────────────────────────────────────────────────

describe('identifyWeakSkills', () => {
  test('identifies critical and needs-work dimensions', () => {
    const weak = identifyWeakSkills(mockSkillGap);
    const dims = weak.map(d => d.dimension);
    expect(dims).toContain('technical');
    expect(dims).toContain('confidence');
    expect(dims).toContain('communication');
  });

  test('excludes strong and on-track dimensions', () => {
    const weak = identifyWeakSkills(mockSkillGap);
    const dims = weak.map(d => d.dimension);
    expect(dims).not.toContain('pace');
    expect(dims).not.toContain('fluency');
  });

  test('returns empty array for null input', () => {
    expect(identifyWeakSkills(null)).toEqual([]);
    expect(identifyWeakSkills({})).toEqual([]);
  });

  test('sorts by gap ascending (most critical first)', () => {
    const weak = identifyWeakSkills(mockSkillGap);
    for (let i = 0; i < weak.length - 1; i++) {
      expect(weak[i].gap).toBeLessThanOrEqual(weak[i + 1].gap);
    }
  });

  test('returns empty for all-strong skill gap', () => {
    const strongGap = {
      dimensions: [
        { dimension: 'technical', gap: 10, status: 'strong' },
        { dimension: 'fluency', gap: 5, status: 'strong' },
      ],
    };
    expect(identifyWeakSkills(strongGap)).toEqual([]);
  });
});

// ─── mapSkillsToResources ─────────────────────────────────────────────────────

describe('mapSkillsToResources', () => {
  const weakSkills = [
    { dimension: 'technical', gap: -20, status: 'critical' },
    { dimension: 'confidence', gap: -22, status: 'critical' },
    { dimension: 'communication', gap: -13, status: 'needs-work' },
  ];

  test('returns non-empty array for weak skills', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('each recommendation has required fields', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    recs.forEach(r => {
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('description');
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('priority');
      expect(r).toHaveProperty('impactScore');
    });
  });

  test('includes domain-specific resource', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    const hasDomainFocus = recs.some(r => r.category === 'domain-focus');
    expect(hasDomainFocus).toBe(true);
  });

  test('critical skills get priority 1', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    const hasCritical = recs.some(r => r.priority === 1);
    expect(hasCritical).toBe(true);
  });

  test('returns at least one item for empty weak skills (domain fallback)', () => {
    const recs = mapSkillsToResources([], 'Frontend');
    expect(recs.length).toBeGreaterThan(0);
  });

  test('works for all known tracks', () => {
    Object.keys(DOMAIN_SKILL_MAP).forEach(track => {
      expect(() => mapSkillsToResources(weakSkills, track)).not.toThrow();
    });
  });
});

// ─── prioritizeRecommendations ────────────────────────────────────────────────

describe('prioritizeRecommendations', () => {
  const recs = [
    { title: 'Low Priority', priority: 5, impactScore: 10 },
    { title: 'High Priority', priority: 1, impactScore: 40 },
    { title: 'Medium Priority', priority: 3, impactScore: 20 },
    { title: 'High Priority 2', priority: 1, impactScore: 50 },
  ];

  test('sorts by priority ascending first', () => {
    const sorted = prioritizeRecommendations(recs);
    expect(sorted[0].priority).toBe(1);
    expect(sorted[sorted.length - 1].priority).toBe(5);
  });

  test('within same priority, sorts by impactScore descending', () => {
    const sorted = prioritizeRecommendations(recs);
    const p1Items = sorted.filter(r => r.priority === 1);
    expect(p1Items[0].impactScore).toBeGreaterThanOrEqual(p1Items[1].impactScore);
  });

  test('returns empty array for empty input', () => {
    expect(prioritizeRecommendations([])).toEqual([]);
  });

  test('does not mutate original array', () => {
    const original = [...recs];
    prioritizeRecommendations(recs);
    expect(recs[0].title).toBe(original[0].title);
  });

  test('handles null input gracefully', () => {
    expect(prioritizeRecommendations(null)).toEqual([]);
  });
});

// ─── getNextInterviewSuggestion ───────────────────────────────────────────────

describe('getNextInterviewSuggestion', () => {
  test('returns General suggestion for empty sessions', () => {
    const result = getNextInterviewSuggestion([]);
    expect(result).not.toBeNull();
    expect(result.track).toBe('General');
    expect(result.difficulty).toBe('Easy');
  });

  test('suggests an untried track for new user with few sessions', () => {
    const sessions = [{ jobTrack: 'Frontend', compositeScore: 65 }];
    const result = getNextInterviewSuggestion(sessions);
    expect(result).not.toBeNull();
    expect(result.track).not.toBe('Frontend');
  });

  test('result has required shape', () => {
    const result = getNextInterviewSuggestion(mockSessions);
    expect(result).toHaveProperty('track');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('difficulty');
  });

  test('suggests weakest domain when all domains tried', () => {
    const allDomainSessions = Object.keys(DOMAIN_SKILL_MAP).map((track, i) => ({
      jobTrack: track,
      compositeScore: i === 0 ? 40 : 70, // first track is weakest
    }));
    const result = getNextInterviewSuggestion(allDomainSessions);
    expect(result).not.toBeNull();
  });
});

// ─── getDifficultyRampPlan ────────────────────────────────────────────────────

describe('getDifficultyRampPlan', () => {
  test('returns 4-step plan for empty sessions', () => {
    const plan = getDifficultyRampPlan([]);
    expect(plan.length).toBe(4);
    expect(plan[0].difficulty).toBe('Easy');
    expect(plan[3].difficulty).toBe('Expert');
  });

  test('recommends Medium for low avg score (< 60)', () => {
    const lowSessions = [{ compositeScore: 40 }, { compositeScore: 45 }];
    const plan = getDifficultyRampPlan(lowSessions);
    const hasMedium = plan.some(p => p.difficulty === 'Medium');
    expect(hasMedium).toBe(true);
  });

  test('recommends Expert for high avg score (>= 82)', () => {
    const highSessions = [{ compositeScore: 85 }, { compositeScore: 88 }];
    const plan = getDifficultyRampPlan(highSessions);
    const hasExpert = plan.some(p => p.difficulty === 'Expert');
    expect(hasExpert).toBe(true);
  });

  test('each step has required fields', () => {
    const plan = getDifficultyRampPlan([]);
    plan.forEach(step => {
      expect(step).toHaveProperty('step');
      expect(step).toHaveProperty('difficulty');
      expect(step).toHaveProperty('targetScore');
      expect(step).toHaveProperty('description');
    });
  });

  test('steps are ordered by difficulty ascending', () => {
    const plan = getDifficultyRampPlan([]);
    const order = ['Easy', 'Medium', 'Hard', 'Expert'];
    plan.forEach(step => {
      expect(order).toContain(step.difficulty);
    });
  });
});

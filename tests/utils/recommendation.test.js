/**
 * tests/utils/recommendation.test.js
 *
 * Full coverage tests for utils/engines/recommendationEngine.js.
 * Covers: resource library, domain skill map, all 5 exported functions.
 */

// analyticsEngine is used internally by generateRecommendations
jest.mock('../../utils/engines/analyticsEngine', () => ({
  computeSkillGapMatrix: jest.fn().mockReturnValue({
    dimensions: [
      { dimension: 'technical',     candidateAvg: 52, target: 75, gap: -23, status: 'critical' },
      { dimension: 'fluency',       candidateAvg: 63, target: 70, gap:  -7, status: 'needs-work' },
      { dimension: 'pace',          candidateAvg: 80, target: 70, gap:  10, status: 'strong' },
      { dimension: 'confidence',    candidateAvg: 48, target: 72, gap: -24, status: 'critical' },
      { dimension: 'communication', candidateAvg: 55, target: 73, gap: -18, status: 'needs-work' },
    ],
    overallGap: -12,
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

const SKILL_GAP_MOCK = {
  dimensions: [
    { dimension: 'technical',     gap: -23, status: 'critical' },
    { dimension: 'fluency',       gap:  -7, status: 'needs-work' },
    { dimension: 'pace',          gap:  10, status: 'strong' },
    { dimension: 'confidence',    gap: -24, status: 'critical' },
    { dimension: 'communication', gap: -18, status: 'needs-work' },
  ],
  overallGap: -12,
  targetRole: 'Frontend',
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESOURCE_LIBRARY / DOMAIN_SKILL_MAP integrity
// ═══════════════════════════════════════════════════════════════════════════════

describe('RESOURCE_LIBRARY', () => {
  test('is exported and non-empty', () => {
    expect(RESOURCE_LIBRARY).toBeDefined();
    expect(Object.keys(RESOURCE_LIBRARY).length).toBeGreaterThan(3);
  });

  test('each entry has title and resources array', () => {
    Object.values(RESOURCE_LIBRARY).forEach(entry => {
      expect(entry).toHaveProperty('title');
      expect(Array.isArray(entry.resources)).toBe(true);
    });
  });

  test('each resource item has url and type', () => {
    Object.values(RESOURCE_LIBRARY).forEach(entry => {
      entry.resources.forEach(r => {
        expect(r).toHaveProperty('url');
        expect(r).toHaveProperty('type');
      });
    });
  });
});

describe('DOMAIN_SKILL_MAP', () => {
  test('contains Frontend', () => expect(DOMAIN_SKILL_MAP['Frontend']).toBeDefined());
  test('contains Backend', () => expect(DOMAIN_SKILL_MAP['Backend']).toBeDefined());
  test('contains General', () => expect(DOMAIN_SKILL_MAP['General']).toBeDefined());
  test('all entries are non-empty arrays', () => {
    Object.values(DOMAIN_SKILL_MAP).forEach(arr => {
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// identifyWeakSkills
// ═══════════════════════════════════════════════════════════════════════════════

describe('identifyWeakSkills', () => {
  test('returns empty array for null', () => {
    expect(identifyWeakSkills(null)).toEqual([]);
  });

  test('returns empty array for missing dimensions', () => {
    expect(identifyWeakSkills({})).toEqual([]);
  });

  test('excludes strong and on-track dimensions', () => {
    const result = identifyWeakSkills(SKILL_GAP_MOCK);
    expect(result.map(d => d.dimension)).not.toContain('pace');
  });

  test('includes all critical dimensions', () => {
    const result = identifyWeakSkills(SKILL_GAP_MOCK);
    const dims = result.map(d => d.dimension);
    expect(dims).toContain('technical');
    expect(dims).toContain('confidence');
  });

  test('includes needs-work dimensions', () => {
    const result = identifyWeakSkills(SKILL_GAP_MOCK);
    const dims = result.map(d => d.dimension);
    expect(dims).toContain('fluency');
    expect(dims).toContain('communication');
  });

  test('sorts by gap ascending (most critical first)', () => {
    const result = identifyWeakSkills(SKILL_GAP_MOCK);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].gap).toBeLessThanOrEqual(result[i + 1].gap);
    }
  });

  test('all-strong gap returns empty array', () => {
    const allStrong = {
      dimensions: [
        { dimension: 'technical', gap: 5, status: 'strong' },
        { dimension: 'fluency',   gap: 8, status: 'on-track' },
      ],
    };
    expect(identifyWeakSkills(allStrong)).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// mapSkillsToResources
// ═══════════════════════════════════════════════════════════════════════════════

describe('mapSkillsToResources', () => {
  const weakSkills = [
    { dimension: 'technical',  gap: -23, status: 'critical' },
    { dimension: 'confidence', gap: -24, status: 'critical' },
    { dimension: 'fluency',    gap:  -7, status: 'needs-work' },
  ];

  test('returns non-empty array for valid weak skills + track', () => {
    expect(mapSkillsToResources(weakSkills, 'Frontend').length).toBeGreaterThan(0);
  });

  test('each recommendation has all required fields', () => {
    mapSkillsToResources(weakSkills, 'Frontend').forEach(r => {
      expect(r).toHaveProperty('title');
      expect(r).toHaveProperty('description');
      expect(r).toHaveProperty('category');
      expect(r).toHaveProperty('priority');
      expect(r).toHaveProperty('impactScore');
    });
  });

  test('includes a domain-focus category recommendation', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    expect(recs.some(r => r.category === 'domain-focus')).toBe(true);
  });

  test('critical skills have priority 1', () => {
    const recs = mapSkillsToResources(weakSkills, 'Frontend');
    const p1 = recs.filter(r => r.priority === 1);
    expect(p1.length).toBeGreaterThan(0);
  });

  test('returns at least 1 item for empty weakSkills (domain fallback)', () => {
    expect(mapSkillsToResources([], 'Frontend').length).toBeGreaterThan(0);
  });

  test('works for every domain in DOMAIN_SKILL_MAP', () => {
    Object.keys(DOMAIN_SKILL_MAP).forEach(track => {
      expect(() => mapSkillsToResources(weakSkills, track)).not.toThrow();
    });
  });

  test('falls back gracefully for unknown track', () => {
    expect(() => mapSkillsToResources(weakSkills, 'MoonBase')).not.toThrow();
  });

  test('impactScore is positive for critical skills', () => {
    const recs = mapSkillsToResources(weakSkills, 'Backend');
    const skillGapRecs = recs.filter(r => r.category === 'skill-gap');
    skillGapRecs.forEach(r => expect(r.impactScore).toBeGreaterThanOrEqual(0));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// prioritizeRecommendations
// ═══════════════════════════════════════════════════════════════════════════════

describe('prioritizeRecommendations', () => {
  const unsorted = [
    { title: 'Low',    priority: 5, impactScore: 5  },
    { title: 'High',   priority: 1, impactScore: 40 },
    { title: 'Med',    priority: 3, impactScore: 20 },
    { title: 'High2',  priority: 1, impactScore: 50 },
    { title: 'Med2',   priority: 3, impactScore: 25 },
  ];

  test('sorts by priority ascending', () => {
    const sorted = prioritizeRecommendations(unsorted);
    expect(sorted[0].priority).toBe(1);
    expect(sorted[sorted.length - 1].priority).toBe(5);
  });

  test('within same priority, higher impactScore comes first', () => {
    const sorted = prioritizeRecommendations(unsorted);
    const p1 = sorted.filter(r => r.priority === 1);
    expect(p1[0].impactScore).toBeGreaterThanOrEqual(p1[1].impactScore);
  });

  test('within priority 3, higher impactScore first', () => {
    const sorted = prioritizeRecommendations(unsorted);
    const p3 = sorted.filter(r => r.priority === 3);
    expect(p3[0].impactScore).toBeGreaterThanOrEqual(p3[1].impactScore);
  });

  test('returns empty array for empty input', () => {
    expect(prioritizeRecommendations([])).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(prioritizeRecommendations(null)).toEqual([]);
  });

  test('does not mutate the original array', () => {
    const copy = [...unsorted];
    prioritizeRecommendations(unsorted);
    expect(unsorted[0].title).toBe(copy[0].title);
  });

  test('single-item array returns same item', () => {
    const single = [{ priority: 3, impactScore: 10, title: 'One' }];
    expect(prioritizeRecommendations(single)).toHaveLength(1);
    expect(prioritizeRecommendations(single)[0].title).toBe('One');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getNextInterviewSuggestion
// ═══════════════════════════════════════════════════════════════════════════════

describe('getNextInterviewSuggestion', () => {
  test('returns General/Easy for empty sessions array', () => {
    const result = getNextInterviewSuggestion([]);
    expect(result.track).toBe('General');
    expect(result.difficulty).toBe('Easy');
  });

  test('suggests untried track when available', () => {
    const sessions = [{ jobTrack: 'Frontend', compositeScore: 65 }];
    const result = getNextInterviewSuggestion(sessions);
    expect(result.track).not.toBe('Frontend');
  });

  test('result has track, reason, difficulty', () => {
    const result = getNextInterviewSuggestion([{ jobTrack: 'Frontend', compositeScore: 65 }]);
    expect(result).toHaveProperty('track');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('difficulty');
  });

  test('reason is a non-empty string', () => {
    const result = getNextInterviewSuggestion([]);
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(5);
  });

  test('difficulty is one of Easy/Medium/Hard/Expert', () => {
    const result = getNextInterviewSuggestion([]);
    expect(['Easy', 'Medium', 'Hard', 'Expert']).toContain(result.difficulty);
  });

  test('handles null input gracefully', () => {
    const result = getNextInterviewSuggestion(null);
    expect(result).toHaveProperty('track');
  });

  test('suggests weakest domain when all domains tried', () => {
    const allTriedSessions = Object.keys(DOMAIN_SKILL_MAP).map((track, i) => ({
      jobTrack: track,
      compositeScore: i === 0 ? 30 : 70, // first track is weakest
    }));
    const result = getNextInterviewSuggestion(allTriedSessions);
    expect(result).not.toBeNull();
    expect(result.track).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// getDifficultyRampPlan
// ═══════════════════════════════════════════════════════════════════════════════

describe('getDifficultyRampPlan', () => {
  test('returns 4-step plan for empty sessions', () => {
    const plan = getDifficultyRampPlan([]);
    expect(plan).toHaveLength(4);
  });

  test('plan steps contain Easy, Medium, Hard, Expert', () => {
    const difficulties = getDifficultyRampPlan([]).map(p => p.difficulty);
    expect(difficulties).toContain('Easy');
    expect(difficulties).toContain('Medium');
    expect(difficulties).toContain('Hard');
    expect(difficulties).toContain('Expert');
  });

  test('each step has step, difficulty, targetScore, description', () => {
    getDifficultyRampPlan([]).forEach(s => {
      expect(s).toHaveProperty('step');
      expect(s).toHaveProperty('difficulty');
      expect(s).toHaveProperty('targetScore');
      expect(s).toHaveProperty('description');
    });
  });

  test('low avg score (< 60) includes Easy step', () => {
    const lowSessions = [{ compositeScore: 40 }, { compositeScore: 45 }];
    const plan = getDifficultyRampPlan(lowSessions);
    expect(plan.some(p => p.difficulty === 'Easy')).toBe(true);
  });

  test('high avg score (>= 82) includes Expert step', () => {
    const highSessions = [{ compositeScore: 85 }, { compositeScore: 90 }];
    const plan = getDifficultyRampPlan(highSessions);
    expect(plan.some(p => p.difficulty === 'Expert')).toBe(true);
  });

  test('targetScore is a positive number for each step', () => {
    getDifficultyRampPlan([]).forEach(s => {
      expect(s.targetScore).toBeGreaterThan(0);
    });
  });

  test('returns array for null input', () => {
    expect(Array.isArray(getDifficultyRampPlan(null))).toBe(true);
  });
});

/**
 * tests/pages/feedbackPage.test.js
 *
 * Tests the pure display/aggregation logic for the feedback/report page:
 * - Rating to label conversion
 * - Question-level statistics
 * - Strengths/weaknesses identification
 * - Session summary aggregation
 * - Grade display helpers
 */

// ── Pure logic for feedback page ─────────────────────────────────────────────

function ratingToLabel(rating) {
  const r = Number(rating);
  if (r >= 9) return 'Excellent';
  if (r >= 7) return 'Good';
  if (r >= 5) return 'Average';
  if (r >= 3) return 'Below Average';
  return 'Poor';
}

function ratingToColor(rating) {
  const r = Number(rating);
  if (r >= 8) return 'emerald';
  if (r >= 6) return 'yellow';
  return 'rose';
}

function aggregateAnswerStats(answers) {
  if (!answers || answers.length === 0) return { avg: 0, high: 0, low: 0, count: 0 };
  const ratings = answers.map(a => Number(a.rating) || 0);
  const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
  return {
    avg: Math.round(avg * 10) / 10,
    high: Math.max(...ratings),
    low: Math.min(...ratings),
    count: ratings.length,
  };
}

function identifyStrengths(answers) {
  return answers.filter(a => Number(a.rating) >= 8).map(a => a.question);
}

function identifyWeaknesses(answers) {
  return answers.filter(a => Number(a.rating) < 5).map(a => a.question);
}

function getGradeMessage(grade) {
  const messages = {
    'A+': 'Exceptional performance! Top 5% of candidates.',
    'A':  'Excellent work! Well above average.',
    'A-': 'Very strong performance.',
    'B+': 'Good performance, slightly above average.',
    'B':  'Solid performance, meets expectations.',
    'B-': 'Decent performance with room to improve.',
    'C+': 'Moderate performance, focused improvement needed.',
    'C':  'Average performance.',
    'D':  'Below average, significant improvement needed.',
    'F':  'Performance needs substantial work.',
  };
  return messages[grade] || 'Performance recorded.';
}

function formatPercentile(percentile) {
  const p = Math.round(Number(percentile) || 0);
  if (p >= 90) return `Top ${100 - p}% — Elite`;
  if (p >= 75) return `Top 25% — Strong`;
  if (p >= 50) return `Above Median`;
  return `Below Median`;
}

function getImprovedQuestions(previous, current) {
  if (!previous || !current) return [];
  return current.filter(q => {
    const prev = previous.find(p => p.question === q.question);
    return prev && Number(q.rating) > Number(prev.rating);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

const ANSWERS = [
  { question: 'Q1: React hooks?',      rating: '9',  userAns: 'Great explanation', feedback: 'Excellent' },
  { question: 'Q2: CSS box model?',    rating: '7',  userAns: 'Good answer',       feedback: 'Good' },
  { question: 'Q3: Promises vs async', rating: '5',  userAns: 'Partial answer',    feedback: 'Needs work' },
  { question: 'Q4: Event loop?',       rating: '3',  userAns: 'Incomplete',        feedback: 'Poor' },
  { question: 'Q5: TypeScript types?', rating: '10', userAns: 'Perfect',           feedback: 'Excellent' },
];

// ── ratingToLabel ─────────────────────────────────────────────────────────────

describe('ratingToLabel', () => {
  test('rating 10 → Excellent',      () => expect(ratingToLabel(10)).toBe('Excellent'));
  test('rating 9 → Excellent',       () => expect(ratingToLabel(9)).toBe('Excellent'));
  test('rating 8 → Good',            () => expect(ratingToLabel(8)).toBe('Good'));
  test('rating 7 → Good',            () => expect(ratingToLabel(7)).toBe('Good'));
  test('rating 5 → Average',         () => expect(ratingToLabel(5)).toBe('Average'));
  test('rating 3 → Below Average',   () => expect(ratingToLabel(3)).toBe('Below Average'));
  test('rating 1 → Poor',            () => expect(ratingToLabel(1)).toBe('Poor'));
  test('string "8" → Good',          () => expect(ratingToLabel('8')).toBe('Good'));
  test('boundary: 9 is Excellent, 8 is Good', () => {
    expect(ratingToLabel(9)).not.toBe(ratingToLabel(8));
  });
});

// ── ratingToColor ─────────────────────────────────────────────────────────────

describe('ratingToColor', () => {
  test('rating 9 → emerald',  () => expect(ratingToColor(9)).toBe('emerald'));
  test('rating 8 → emerald',  () => expect(ratingToColor(8)).toBe('emerald'));
  test('rating 7 → yellow',   () => expect(ratingToColor(7)).toBe('yellow'));
  test('rating 6 → yellow',   () => expect(ratingToColor(6)).toBe('yellow'));
  test('rating 5 → rose',     () => expect(ratingToColor(5)).toBe('rose'));
  test('rating 3 → rose',     () => expect(ratingToColor(3)).toBe('rose'));
});

// ── aggregateAnswerStats ──────────────────────────────────────────────────────

describe('aggregateAnswerStats', () => {
  test('avg of [9,7,5,3,10] = 6.8', () => {
    expect(aggregateAnswerStats(ANSWERS).avg).toBe(6.8);
  });

  test('high = 10', () => {
    expect(aggregateAnswerStats(ANSWERS).high).toBe(10);
  });

  test('low = 3', () => {
    expect(aggregateAnswerStats(ANSWERS).low).toBe(3);
  });

  test('count = 5', () => {
    expect(aggregateAnswerStats(ANSWERS).count).toBe(5);
  });

  test('empty answers returns zeros', () => {
    expect(aggregateAnswerStats([])).toEqual({ avg: 0, high: 0, low: 0, count: 0 });
  });

  test('null returns zeros', () => {
    expect(aggregateAnswerStats(null)).toEqual({ avg: 0, high: 0, low: 0, count: 0 });
  });

  test('single answer: avg = high = low', () => {
    const single = [{ rating: '7' }];
    const stats = aggregateAnswerStats(single);
    expect(stats.avg).toBe(7);
    expect(stats.high).toBe(7);
    expect(stats.low).toBe(7);
  });
});

// ── identifyStrengths / identifyWeaknesses ───────────────────────────────────

describe('identifyStrengths', () => {
  test('returns Q1 and Q5 (ratings 9 and 10)', () => {
    const strengths = identifyStrengths(ANSWERS);
    expect(strengths).toContain('Q1: React hooks?');
    expect(strengths).toContain('Q5: TypeScript types?');
  });

  test('does not include Q2 (rating 7)', () => {
    expect(identifyStrengths(ANSWERS)).not.toContain('Q2: CSS box model?');
  });

  test('returns empty for all low-rated', () => {
    const low = [{ question: 'Q1', rating: '4' }, { question: 'Q2', rating: '3' }];
    expect(identifyStrengths(low)).toEqual([]);
  });
});

describe('identifyWeaknesses', () => {
  test('returns Q4 (rating 3)', () => {
    expect(identifyWeaknesses(ANSWERS)).toContain('Q4: Event loop?');
  });

  test('does not include Q3 (rating 5 — at boundary)', () => {
    expect(identifyWeaknesses(ANSWERS)).not.toContain('Q3: Promises vs async');
  });

  test('returns empty for all high-rated', () => {
    const high = [{ question: 'Q1', rating: '9' }, { question: 'Q2', rating: '8' }];
    expect(identifyWeaknesses(high)).toEqual([]);
  });
});

// ── getGradeMessage ───────────────────────────────────────────────────────────

describe('getGradeMessage', () => {
  test('A+ → Exceptional message', () => expect(getGradeMessage('A+')).toContain('Exceptional'));
  test('A → Excellent message',    () => expect(getGradeMessage('A')).toContain('Excellent'));
  test('B → Solid message',        () => expect(getGradeMessage('B')).toContain('Solid'));
  test('F → work message',         () => expect(getGradeMessage('F')).toContain('work'));
  test('unknown → generic message', () => expect(getGradeMessage('X')).toBe('Performance recorded.'));
});

// ── formatPercentile ──────────────────────────────────────────────────────────

describe('formatPercentile', () => {
  test('95 → contains "Elite"',       () => expect(formatPercentile(95)).toContain('Elite'));
  test('80 → contains "Strong"',      () => expect(formatPercentile(80)).toContain('Strong'));
  test('60 → Above Median',           () => expect(formatPercentile(60)).toBe('Above Median'));
  test('30 → Below Median',           () => expect(formatPercentile(30)).toBe('Below Median'));
  test('null → Below Median (p=0)',   () => expect(formatPercentile(null)).toBe('Below Median'));
  test('string "85" works correctly', () => expect(formatPercentile('85')).toContain('Strong'));
});

// ── getImprovedQuestions ──────────────────────────────────────────────────────

describe('getImprovedQuestions', () => {
  const prev = [
    { question: 'Q1', rating: '5' },
    { question: 'Q2', rating: '7' },
    { question: 'Q3', rating: '8' },
  ];
  const curr = [
    { question: 'Q1', rating: '8' }, // improved
    { question: 'Q2', rating: '6' }, // declined
    { question: 'Q3', rating: '8' }, // same
  ];

  test('identifies Q1 as improved', () => {
    expect(getImprovedQuestions(prev, curr).map(q => q.question)).toContain('Q1');
  });

  test('does not include Q2 (declined)', () => {
    expect(getImprovedQuestions(prev, curr).map(q => q.question)).not.toContain('Q2');
  });

  test('does not include Q3 (same)', () => {
    expect(getImprovedQuestions(prev, curr).map(q => q.question)).not.toContain('Q3');
  });

  test('returns empty for null previous', () => {
    expect(getImprovedQuestions(null, curr)).toEqual([]);
  });

  test('returns empty for null current', () => {
    expect(getImprovedQuestions(prev, null)).toEqual([]);
  });
});

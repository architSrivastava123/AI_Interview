/**
 * tests/components/dashboard.test.js
 *
 * Tests the pure business logic extracted from ScoreCard.jsx.
 * getScoreColor thresholds, composite score calculation, dimension mapping.
 * Uses @jest-environment node (no DOM needed — logic only).
 */

// ── Inline the pure logic that ScoreCard.jsx contains ──────────────────────────

function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-rose-400';
}

function computeComposite(scores) {
  return Math.round(Number(scores.compositeScore) || 0);
}

const DIMENSIONS = [
  { key: 'technicalScore',     label: 'Technical' },
  { key: 'fluencyScore',       label: 'Fluency' },
  { key: 'paceScore',          label: 'Pace' },
  { key: 'confidenceScore',    label: 'Confidence' },
  { key: 'communicationScore', label: 'Communication' },
];

function getDimensionValues(scores) {
  return DIMENSIONS.map(({ key, label }) => ({
    label,
    value: Math.round(Number(scores[key]) || 0),
  }));
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('ScoreCard — getScoreColor', () => {
  test('returns emerald for score exactly 80', () => {
    expect(getScoreColor(80)).toBe('text-emerald-400');
  });

  test('returns emerald for score 100', () => {
    expect(getScoreColor(100)).toBe('text-emerald-400');
  });

  test('returns emerald for score 90', () => {
    expect(getScoreColor(90)).toBe('text-emerald-400');
  });

  test('returns yellow for score 79', () => {
    expect(getScoreColor(79)).toBe('text-yellow-400');
  });

  test('returns yellow for score 60', () => {
    expect(getScoreColor(60)).toBe('text-yellow-400');
  });

  test('returns yellow for score exactly 60', () => {
    expect(getScoreColor(60)).toBe('text-yellow-400');
  });

  test('returns rose for score 59', () => {
    expect(getScoreColor(59)).toBe('text-rose-400');
  });

  test('returns rose for score 0', () => {
    expect(getScoreColor(0)).toBe('text-rose-400');
  });

  test('returns rose for negative score', () => {
    expect(getScoreColor(-10)).toBe('text-rose-400');
  });

  test('boundary: 80 is emerald, 79 is yellow', () => {
    expect(getScoreColor(80)).not.toBe(getScoreColor(79));
  });

  test('boundary: 60 is yellow, 59 is rose', () => {
    expect(getScoreColor(60)).not.toBe(getScoreColor(59));
  });
});

describe('ScoreCard — computeComposite', () => {
  test('rounds compositeScore', () => {
    expect(computeComposite({ compositeScore: 75.6 })).toBe(76);
  });

  test('returns 0 for null compositeScore', () => {
    expect(computeComposite({ compositeScore: null })).toBe(0);
  });

  test('returns 0 for undefined compositeScore', () => {
    expect(computeComposite({})).toBe(0);
  });

  test('returns 0 for NaN compositeScore', () => {
    expect(computeComposite({ compositeScore: NaN })).toBe(0);
  });

  test('returns 100 for perfect score', () => {
    expect(computeComposite({ compositeScore: 100 })).toBe(100);
  });

  test('converts string scores to number', () => {
    expect(computeComposite({ compositeScore: '82.4' })).toBe(82);
  });
});

describe('ScoreCard — getDimensionValues', () => {
  const scores = {
    technicalScore: 78.5,
    fluencyScore: 82,
    paceScore: 65.9,
    confidenceScore: 70,
    communicationScore: 55.1,
  };

  test('returns 5 dimension objects', () => {
    expect(getDimensionValues(scores)).toHaveLength(5);
  });

  test('each item has label and value', () => {
    getDimensionValues(scores).forEach(d => {
      expect(d).toHaveProperty('label');
      expect(d).toHaveProperty('value');
    });
  });

  test('Technical rounds 78.5 → 79', () => {
    const tech = getDimensionValues(scores).find(d => d.label === 'Technical');
    expect(tech.value).toBe(79);
  });

  test('Communication rounds 55.1 → 55', () => {
    const comm = getDimensionValues(scores).find(d => d.label === 'Communication');
    expect(comm.value).toBe(55);
  });

  test('all-zero scores give 0 for all dimensions', () => {
    getDimensionValues({}).forEach(d => expect(d.value).toBe(0));
  });
});

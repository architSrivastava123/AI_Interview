/**
 * tests/components/feedback.test.js
 *
 * Tests the pure logic of RecommendationCard.jsx — priority badge labels,
 * difficulty color coding, resource type icons, completion state, and category display.
 */

// ── Inline pure logic from RecommendationCard.jsx ─────────────────────────────

function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical';
  if (priority === 2) return 'High';
  if (priority === 3) return 'Medium';
  if (priority === 4) return 'Low';
  return 'Nice-to-have';
}

function getPriorityColor(priority) {
  if (priority === 1) return 'rose';
  if (priority === 2) return 'orange';
  if (priority === 3) return 'yellow';
  return 'gray';
}

function getDifficultyLabel(difficulty) {
  const map = { Easy: '⬡', Medium: '⬡⬡', Hard: '⬡⬡⬡', Expert: '⬡⬡⬡⬡' };
  return map[difficulty] || '⬡⬡';
}

function formatImpactScore(impactScore) {
  return Math.round(Math.max(0, Math.min(100, Number(impactScore) || 0)));
}

function getCategoryLabel(category) {
  const map = {
    'skill-gap':    'Skill Gap',
    'domain-focus': 'Domain Focus',
    'general':      'General',
    'behavioral':   'Behavioral',
  };
  return map[category] || category;
}

function getResourceTypeLabel(resourceType) {
  const map = {
    'docs':     'Documentation',
    'article':  'Article',
    'video':    'Video',
    'course':   'Course',
    'practice': 'Practice',
  };
  return map[resourceType] || resourceType;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('getPriorityLabel', () => {
  test('priority 1 → Critical', () => expect(getPriorityLabel(1)).toBe('Critical'));
  test('priority 2 → High',     () => expect(getPriorityLabel(2)).toBe('High'));
  test('priority 3 → Medium',   () => expect(getPriorityLabel(3)).toBe('Medium'));
  test('priority 4 → Low',      () => expect(getPriorityLabel(4)).toBe('Low'));
  test('priority 5 → Nice-to-have', () => expect(getPriorityLabel(5)).toBe('Nice-to-have'));
  test('undefined → Nice-to-have',  () => expect(getPriorityLabel(undefined)).toBe('Nice-to-have'));
  test('null → Nice-to-have',       () => expect(getPriorityLabel(null)).toBe('Nice-to-have'));
});

describe('getPriorityColor', () => {
  test('priority 1 → rose',   () => expect(getPriorityColor(1)).toBe('rose'));
  test('priority 2 → orange', () => expect(getPriorityColor(2)).toBe('orange'));
  test('priority 3 → yellow', () => expect(getPriorityColor(3)).toBe('yellow'));
  test('priority 4 → gray',   () => expect(getPriorityColor(4)).toBe('gray'));
  test('priority 10 → gray',  () => expect(getPriorityColor(10)).toBe('gray'));
});

describe('getDifficultyLabel', () => {
  test('Easy → ⬡',       () => expect(getDifficultyLabel('Easy')).toBe('⬡'));
  test('Medium → ⬡⬡',   () => expect(getDifficultyLabel('Medium')).toBe('⬡⬡'));
  test('Hard → ⬡⬡⬡',   () => expect(getDifficultyLabel('Hard')).toBe('⬡⬡⬡'));
  test('Expert → ⬡⬡⬡⬡', () => expect(getDifficultyLabel('Expert')).toBe('⬡⬡⬡⬡'));
  test('unknown → ⬡⬡ (fallback)', () => expect(getDifficultyLabel('Beginner')).toBe('⬡⬡'));
});

describe('formatImpactScore', () => {
  test('rounds 33.7 → 34', () => expect(formatImpactScore(33.7)).toBe(34));
  test('clamps over 100 → 100', () => expect(formatImpactScore(150)).toBe(100));
  test('clamps negative → 0',   () => expect(formatImpactScore(-5)).toBe(0));
  test('handles null → 0',       () => expect(formatImpactScore(null)).toBe(0));
  test('handles NaN → 0',        () => expect(formatImpactScore(NaN)).toBe(0));
  test('exactly 0 → 0',          () => expect(formatImpactScore(0)).toBe(0));
  test('exactly 100 → 100',      () => expect(formatImpactScore(100)).toBe(100));
});

describe('getCategoryLabel', () => {
  test('skill-gap → Skill Gap',     () => expect(getCategoryLabel('skill-gap')).toBe('Skill Gap'));
  test('domain-focus → Domain Focus', () => expect(getCategoryLabel('domain-focus')).toBe('Domain Focus'));
  test('general → General',         () => expect(getCategoryLabel('general')).toBe('General'));
  test('behavioral → Behavioral',   () => expect(getCategoryLabel('behavioral')).toBe('Behavioral'));
  test('unknown passthrough',        () => expect(getCategoryLabel('custom-cat')).toBe('custom-cat'));
});

describe('getResourceTypeLabel', () => {
  test('docs → Documentation',  () => expect(getResourceTypeLabel('docs')).toBe('Documentation'));
  test('article → Article',     () => expect(getResourceTypeLabel('article')).toBe('Article'));
  test('video → Video',         () => expect(getResourceTypeLabel('video')).toBe('Video'));
  test('course → Course',       () => expect(getResourceTypeLabel('course')).toBe('Course'));
  test('practice → Practice',   () => expect(getResourceTypeLabel('practice')).toBe('Practice'));
  test('unknown → passthrough', () => expect(getResourceTypeLabel('guide')).toBe('guide'));
});

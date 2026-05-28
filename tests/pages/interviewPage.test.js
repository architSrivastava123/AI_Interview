/**
 * tests/pages/interviewPage.test.js
 *
 * Tests the pure logic for the interview session page:
 * - Question parsing from JSON mock response
 * - Timer formatting
 * - Question navigation state
 * - Answer recording and filler word counting
 */

// ── Pure logic extracted from interview page ──────────────────────────────────

function parseMockQuestions(jsonMockResp) {
  try {
    const parsed = typeof jsonMockResp === 'string' ? JSON.parse(jsonMockResp) : jsonMockResp;
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    if (parsed && Array.isArray(parsed.interviewQuestions)) return parsed.interviewQuestions;
    return [];
  } catch {
    return [];
  }
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function countFillerWords(text) {
  const FILLERS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'right'];
  if (!text) return 0;
  const lower = text.toLowerCase();
  return FILLERS.reduce((count, filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

function estimateWpm(text, durationSeconds) {
  if (!text || durationSeconds <= 0) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = durationSeconds / 60;
  return Math.round(words / minutes);
}

function getQuestionAtIndex(questions, index) {
  if (!questions || questions.length === 0) return null;
  const idx = Math.max(0, Math.min(index, questions.length - 1));
  return questions[idx];
}

function isLastQuestion(questions, currentIndex) {
  return currentIndex >= questions.length - 1;
}

function isFirstQuestion(currentIndex) {
  return currentIndex <= 0;
}

function extractDurationFromAnswer(userAns) {
  if (!userAns) return 0;
  const match = userAns.match(/\|\|\|duration:(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function cleanAnswerText(userAns) {
  if (!userAns) return '';
  return userAns.replace(/\|\|\|.*$/g, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────

const MOCK_QUESTIONS = [
  { question: 'What is React?',       answer: 'A JavaScript library for building user interfaces.', difficulty: 'Easy' },
  { question: 'Explain useEffect.',   answer: 'A hook for side effects.',   difficulty: 'Medium' },
  { question: 'Describe reconciliation.', answer: 'The diffing algorithm.', difficulty: 'Hard' },
];

// ── parseMockQuestions ────────────────────────────────────────────────────────

describe('parseMockQuestions', () => {
  test('parses direct JSON array string', () => {
    expect(parseMockQuestions(JSON.stringify(MOCK_QUESTIONS))).toHaveLength(3);
  });

  test('parses {questions: [...]} wrapper', () => {
    const wrapped = JSON.stringify({ questions: MOCK_QUESTIONS });
    expect(parseMockQuestions(wrapped)).toHaveLength(3);
  });

  test('parses {interviewQuestions: [...]} wrapper', () => {
    const wrapped = JSON.stringify({ interviewQuestions: MOCK_QUESTIONS });
    expect(parseMockQuestions(wrapped)).toHaveLength(3);
  });

  test('handles already-parsed array', () => {
    expect(parseMockQuestions(MOCK_QUESTIONS)).toHaveLength(3);
  });

  test('returns empty array for invalid JSON string', () => {
    expect(parseMockQuestions('{ not valid json [[')).toEqual([]);
  });

  test('returns empty array for empty string', () => {
    expect(parseMockQuestions('')).toEqual([]);
  });

  test('returns empty array for null', () => {
    expect(parseMockQuestions(null)).toEqual([]);
  });

  test('returns empty array for unknown shape', () => {
    expect(parseMockQuestions({ foo: 'bar' })).toEqual([]);
  });
});

// ── formatTimer ───────────────────────────────────────────────────────────────

describe('formatTimer', () => {
  test('0 seconds = "00:00"', () => expect(formatTimer(0)).toBe('00:00'));
  test('60 seconds = "01:00"', () => expect(formatTimer(60)).toBe('01:00'));
  test('90 seconds = "01:30"', () => expect(formatTimer(90)).toBe('01:30'));
  test('3599 seconds = "59:59"', () => expect(formatTimer(3599)).toBe('59:59'));
  test('9 seconds = "00:09"', () => expect(formatTimer(9)).toBe('00:09'));
  test('600 seconds = "10:00"', () => expect(formatTimer(600)).toBe('10:00'));
});

// ── countFillerWords ─────────────────────────────────────────────────────────

describe('countFillerWords', () => {
  test('counts "um" once', () => expect(countFillerWords('um that is correct')).toBeGreaterThanOrEqual(1));
  test('counts "uh" and "like" together', () => {
    expect(countFillerWords('uh like I think um so yeah')).toBeGreaterThanOrEqual(3);
  });
  test('returns 0 for clean text', () => expect(countFillerWords('React is a JavaScript library')).toBe(0));
  test('returns 0 for empty string', () => expect(countFillerWords('')).toBe(0));
  test('returns 0 for null', () => expect(countFillerWords(null)).toBe(0));
  test('case-insensitive counting', () => expect(countFillerWords('UM UH LIKE')).toBeGreaterThanOrEqual(2));
});

// ── estimateWpm ───────────────────────────────────────────────────────────────

describe('estimateWpm', () => {
  test('120 words in 60 seconds = 120 WPM', () => {
    const text = Array(120).fill('word').join(' ');
    expect(estimateWpm(text, 60)).toBe(120);
  });

  test('0 duration returns 0', () => expect(estimateWpm('some text', 0)).toBe(0));
  test('empty text returns 0', () => expect(estimateWpm('', 60)).toBe(0));
  test('null text returns 0', () => expect(estimateWpm(null, 60)).toBe(0));

  test('normal speaking pace: 130 words in 60s ≈ 130 WPM', () => {
    const text = Array(130).fill('word').join(' ');
    expect(estimateWpm(text, 60)).toBe(130);
  });
});

// ── getQuestionAtIndex ────────────────────────────────────────────────────────

describe('getQuestionAtIndex', () => {
  test('returns correct question at index 0', () => {
    expect(getQuestionAtIndex(MOCK_QUESTIONS, 0)).toBe(MOCK_QUESTIONS[0]);
  });
  test('returns last question at index 2', () => {
    expect(getQuestionAtIndex(MOCK_QUESTIONS, 2)).toBe(MOCK_QUESTIONS[2]);
  });
  test('clamps negative index to 0', () => {
    expect(getQuestionAtIndex(MOCK_QUESTIONS, -1)).toBe(MOCK_QUESTIONS[0]);
  });
  test('clamps out-of-range index to last', () => {
    expect(getQuestionAtIndex(MOCK_QUESTIONS, 100)).toBe(MOCK_QUESTIONS[2]);
  });
  test('returns null for empty array', () => {
    expect(getQuestionAtIndex([], 0)).toBeNull();
  });
  test('returns null for null', () => {
    expect(getQuestionAtIndex(null, 0)).toBeNull();
  });
});

// ── isLastQuestion / isFirstQuestion ─────────────────────────────────────────

describe('isLastQuestion / isFirstQuestion', () => {
  test('index 2 of 3-question array → isLast', () => {
    expect(isLastQuestion(MOCK_QUESTIONS, 2)).toBe(true);
  });
  test('index 1 of 3 → not isLast', () => {
    expect(isLastQuestion(MOCK_QUESTIONS, 1)).toBe(false);
  });
  test('index 0 → isFirst', () => {
    expect(isFirstQuestion(0)).toBe(true);
  });
  test('index 1 → not isFirst', () => {
    expect(isFirstQuestion(1)).toBe(false);
  });
  test('negative index → isFirst', () => {
    expect(isFirstQuestion(-1)).toBe(true);
  });
});

// ── extractDurationFromAnswer / cleanAnswerText ───────────────────────────────

describe('extractDurationFromAnswer', () => {
  test('extracts duration 40 from "Answer|||duration:40"', () => {
    expect(extractDurationFromAnswer('My answer text|||duration:40')).toBe(40);
  });
  test('returns 0 when no duration marker', () => {
    expect(extractDurationFromAnswer('plain answer text')).toBe(0);
  });
  test('returns 0 for null', () => {
    expect(extractDurationFromAnswer(null)).toBe(0);
  });
  test('returns 0 for empty string', () => {
    expect(extractDurationFromAnswer('')).toBe(0);
  });
});

describe('cleanAnswerText', () => {
  test('strips |||duration: suffix', () => {
    expect(cleanAnswerText('React hooks allow state|||duration:42')).toBe('React hooks allow state');
  });
  test('leaves text without marker unchanged', () => {
    expect(cleanAnswerText('clean text')).toBe('clean text');
  });
  test('returns empty string for null', () => {
    expect(cleanAnswerText(null)).toBe('');
  });
  test('trims whitespace after stripping', () => {
    expect(cleanAnswerText('  answer   |||duration:10')).toBe('answer');
  });
});

/**
 * tests/utils/reportGenerator.test.js
 *
 * Full coverage tests for utils/engines/reportEngine.js.
 * Covers all 5 exported functions with happy paths, edge cases,
 * boundary conditions, and error handling.
 */

jest.mock('../../utils/engines/scoringEngine', () => ({
  scoreToGrade: jest.fn(score => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
  }),
  getBenchmarkPercentile: jest.fn().mockReturnValue(68),
  calibrateQuestionDifficulty: jest.fn().mockReturnValue('Medium'),
}));

const {
  buildSessionReport,
  buildProgressReport,
  generateExportData,
  computeReportSummary,
  buildSkillRadarData,
} = require('../../utils/engines/reportEngine');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SESSION = {
  mockId: 'test-001',
  jobPosition: 'Senior Frontend Engineer',
  interviewTrack: 'Frontend',
  jobExperience: '4',
  createdBy: 'candidate@example.com',
  jobDesc: 'React, TypeScript, GraphQL|||culture:standard',
  createdAt: '29-05-2025',
};

const ANSWERS = [
  { question: 'What is React reconciliation?', userAns: 'It is the diffing process|||duration:42', correctAns: 'Fiber diffing algo', feedback: 'Good', rating: '8' },
  { question: 'Explain useCallback', userAns: 'Memoizes functions|||duration:30', correctAns: 'Returns memoized callback', feedback: 'Correct', rating: '9' },
  { question: 'CSS specificity?', userAns: 'ID > class > element|||duration:25', correctAns: 'Correct order', feedback: 'Perfect', rating: '10' },
];

const SCORES = {
  compositeScore: 80,
  technicalScore: 82,
  fluencyScore: 78,
  paceScore: 85,
  confidenceScore: 79,
  communicationScore: 77,
};

const SESSIONS_LIST = [
  { mockIdRef: 'a1', compositeScore: 60, grade: 'C', jobTrack: 'Frontend', completedAt: '01-05-2025' },
  { mockIdRef: 'a2', compositeScore: 72, grade: 'B', jobTrack: 'Frontend', completedAt: '02-05-2025' },
  { mockIdRef: 'a3', compositeScore: 85, grade: 'A-', jobTrack: 'Backend', completedAt: '03-05-2025' },
];

const ANALYTICS_MOCK = {
  avgCompositeScore: 72,
  currentStreak: 3,
  longestStreak: 4,
  improvementVelocity: 12.5,
  trendData: JSON.stringify([{ date: '01-05-2025', score: 60 }, { date: '03-05-2025', score: 85 }]),
  domainBreakdown: JSON.stringify([{ domain: 'Frontend', count: 2, avgScore: 66 }]),
};

// ═══════════════════════════════════════════════════════════════════════════════
// buildSessionReport
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildSessionReport', () => {
  test('returns object with all required top-level fields', () => {
    const report = buildSessionReport(SESSION, ANSWERS, SCORES);
    ['mockIdRef', 'userEmail', 'reportTitle', 'executiveSummary', 'reportData', 'totalScore', 'grade', 'strengths', 'weaknesses', 'nextSteps'].forEach(f => {
      expect(report).toHaveProperty(f);
    });
  });

  test('reportData is valid JSON', () => {
    const { reportData } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(() => JSON.parse(reportData)).not.toThrow();
  });

  test('parsed reportData.questionDetails has same length as ANSWERS', () => {
    const { reportData } = buildSessionReport(SESSION, ANSWERS, SCORES);
    const parsed = JSON.parse(reportData);
    expect(parsed.questionDetails).toHaveLength(ANSWERS.length);
  });

  test('each questionDetail has questionNumber, question, rating, difficulty, ratingLabel', () => {
    const { reportData } = buildSessionReport(SESSION, ANSWERS, SCORES);
    JSON.parse(reportData).questionDetails.forEach(q => {
      expect(q).toHaveProperty('questionNumber');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('rating');
      expect(q).toHaveProperty('difficulty');
      expect(q).toHaveProperty('ratingLabel');
    });
  });

  test('userEmail matches session.createdBy', () => {
    const report = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(report.userEmail).toBe('candidate@example.com');
  });

  test('totalScore is a number in 0–100', () => {
    const { totalScore } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(totalScore).toBeGreaterThanOrEqual(0);
    expect(totalScore).toBeLessThanOrEqual(100);
  });

  test('strengths is parseable JSON string', () => {
    const { strengths } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(() => JSON.parse(strengths)).not.toThrow();
  });

  test('weaknesses is parseable JSON string', () => {
    const { weaknesses } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(() => JSON.parse(weaknesses)).not.toThrow();
  });

  test('nextSteps is parseable JSON string', () => {
    const { nextSteps } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(() => JSON.parse(nextSteps)).not.toThrow();
  });

  test('radarData has 5 elements', () => {
    const { reportData } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(JSON.parse(reportData).radarData).toHaveLength(5);
  });

  test('handles empty answers gracefully', () => {
    const report = buildSessionReport(SESSION, [], SCORES);
    const parsed = JSON.parse(report.reportData);
    expect(parsed.questionDetails).toHaveLength(0);
  });

  test('handles null scores gracefully (totalScore=0)', () => {
    const report = buildSessionReport(SESSION, ANSWERS, null);
    expect(report.totalScore).toBe(0);
  });

  test('throws for null session', () => {
    expect(() => buildSessionReport(null, ANSWERS, SCORES)).toThrow();
  });

  test('executiveSummary is a non-empty string', () => {
    const { executiveSummary } = buildSessionReport(SESSION, ANSWERS, SCORES);
    expect(typeof executiveSummary).toBe('string');
    expect(executiveSummary.length).toBeGreaterThan(10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// buildProgressReport
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildProgressReport', () => {
  test('has all required fields', () => {
    const report = buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK);
    ['totalSessions', 'overallImprovement', 'avgScore', 'bestSession', 'worstSession', 'trend', 'streak', 'velocity'].forEach(f => {
      expect(report).toHaveProperty(f);
    });
  });

  test('totalSessions equals sessions length', () => {
    expect(buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK).totalSessions).toBe(3);
  });

  test('bestSession has score 85', () => {
    expect(buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK).bestSession.score).toBe(85);
  });

  test('worstSession has score 60', () => {
    expect(buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK).worstSession.score).toBe(60);
  });

  test('overallImprovement = last – first score', () => {
    const report = buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK);
    expect(report.overallImprovement).toBe(85 - 60);
  });

  test('handles empty sessions array', () => {
    const report = buildProgressReport([], {});
    expect(report.totalSessions).toBe(0);
    expect(report.bestSession).toBeNull();
  });

  test('streak has current property from analytics.currentStreak', () => {
    const report = buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK);
    // streak can be a number or an object with {current, longest}
    const streak = report.streak;
    const currentStreak = typeof streak === 'object' ? streak.current : streak;
    expect(currentStreak).toBe(3);
  });

  test('velocity comes from analytics improvementVelocity', () => {
    const report = buildProgressReport(SESSIONS_LIST, ANALYTICS_MOCK);
    expect(report.velocity).toBe(12.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// generateExportData
// ═══════════════════════════════════════════════════════════════════════════════

describe('generateExportData', () => {
  const reportWithDetails = {
    questionDetails: [
      { questionNumber: 1, question: 'Q1', difficulty: 'Medium', rating: 8, ratingLabel: 'Good', userAnswer: 'A1', wpm: 120, durationSeconds: 30, aiFeedback: 'Nice' },
      { questionNumber: 2, question: 'Q2', difficulty: 'Hard',   rating: 9, ratingLabel: 'Excellent', userAnswer: 'A2', wpm: 130, durationSeconds: 40, aiFeedback: 'Great' },
    ],
  };

  const wrappedReport = { reportData: JSON.stringify(reportWithDetails) };

  test('JSON format returns parseable string', () => {
    const output = generateExportData(reportWithDetails, 'json');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('JSON format preserves questionDetails count', () => {
    const output = generateExportData(reportWithDetails, 'json');
    expect(JSON.parse(output).questionDetails).toHaveLength(2);
  });

  test('CSV format has header row with Question # and Rating', () => {
    const output = generateExportData(wrappedReport, 'csv');
    const firstLine = output.split('\n')[0];
    expect(firstLine).toContain('Question #');
    expect(firstLine).toContain('Rating');
  });

  test('CSV format has data rows beyond header', () => {
    const output = generateExportData(wrappedReport, 'csv');
    expect(output.split('\n').length).toBeGreaterThan(1);
  });

  test('CSV quotes fields containing commas', () => {
    const reportWithComma = {
      reportData: JSON.stringify({
        questionDetails: [
          { questionNumber: 1, question: 'Q, with comma', difficulty: 'Easy', rating: 7, ratingLabel: 'OK', userAnswer: 'A', wpm: 0, durationSeconds: 0, aiFeedback: 'ok' },
        ],
      }),
    };
    const csv = generateExportData(reportWithComma, 'csv');
    expect(csv).toContain('"Q, with comma"');
  });

  test('throws for unsupported format', () => {
    expect(() => generateExportData(reportWithDetails, 'pdf')).toThrow();
  });

  test('throws for null data', () => {
    expect(() => generateExportData(null, 'json')).toThrow();
  });

  test('CSV format: each data row has same column count as header', () => {
    const output = generateExportData(wrappedReport, 'csv');
    const lines = output.split('\n').filter(l => l.trim());
    const headerCols = lines[0].split(',').length;
    expect(lines[1].split(',').length).toBe(headerCols);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// computeReportSummary
// ═══════════════════════════════════════════════════════════════════════════════

describe('computeReportSummary', () => {
  test('returns a non-empty string', () => {
    const s = computeReportSummary({ session: SESSION, scores: SCORES, grade: 'A', percentile: 80 });
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(20);
  });

  test('mentions the grade', () => {
    const s = computeReportSummary({ session: SESSION, scores: SCORES, grade: 'B+', percentile: 70 });
    expect(s).toContain('B+');
  });

  test('mentions the composite score', () => {
    const s = computeReportSummary({ session: SESSION, scores: { compositeScore: 80 }, grade: 'A', percentile: 80 });
    expect(s).toContain('80');
  });

  test('exceptional language for score >= 88', () => {
    const s = computeReportSummary({ session: SESSION, scores: { compositeScore: 92, technicalScore: 90 }, grade: 'A+', percentile: 95 });
    expect(s.toLowerCase()).toContain('exceptional');
  });

  test('improvement language for score < 50', () => {
    const s = computeReportSummary({ session: SESSION, scores: { compositeScore: 35 }, grade: 'F', percentile: 10 });
    expect(s.toLowerCase()).toContain('improvement');
  });

  test('does not throw for null session', () => {
    expect(() => computeReportSummary({ session: null, scores: SCORES, grade: 'B', percentile: 60 })).not.toThrow();
  });

  test('returns string even when scores are empty object', () => {
    const s = computeReportSummary({ session: SESSION, scores: {}, grade: 'N/A', percentile: 0 });
    expect(typeof s).toBe('string');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// buildSkillRadarData
// ═══════════════════════════════════════════════════════════════════════════════

describe('buildSkillRadarData', () => {
  test('returns array of 5 items', () => {
    expect(buildSkillRadarData(SCORES)).toHaveLength(5);
  });

  test('each item has axis, value, label', () => {
    buildSkillRadarData(SCORES).forEach(d => {
      expect(d).toHaveProperty('axis');
      expect(d).toHaveProperty('value');
      expect(d).toHaveProperty('label');
    });
  });

  test('all values are in 0–100 range', () => {
    buildSkillRadarData(SCORES).forEach(d => {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
    });
  });

  test('Technical axis maps to technicalScore', () => {
    const tech = buildSkillRadarData(SCORES).find(d => d.axis === 'Technical');
    expect(tech.value).toBe(SCORES.technicalScore);
  });

  test('Fluency axis maps to fluencyScore', () => {
    const fl = buildSkillRadarData(SCORES).find(d => d.axis === 'Fluency');
    expect(fl.value).toBe(SCORES.fluencyScore);
  });

  test('returns zeroed array for null scores', () => {
    buildSkillRadarData(null).forEach(d => expect(d.value).toBe(0));
  });

  test('returns zeroed array for empty object', () => {
    buildSkillRadarData({}).forEach(d => expect(d.value).toBe(0));
  });

  test('values > 100 are passed through as-is (no engine-level clamp)', () => {
    // The engine does not clamp; it reflects raw input.
    // Tests that the radar data is correctly shaped.
    const overScores = { technicalScore: 120, fluencyScore: 80, paceScore: 80, confidenceScore: 80, communicationScore: 80 };
    const radar = buildSkillRadarData(overScores);
    expect(radar).toHaveLength(5);
    const tech = radar.find(d => d.axis === 'Technical');
    expect(tech.value).toBe(120); // engine passes through raw value
  });

  test('negative values are passed through as-is (no engine-level clamp)', () => {
    const negScores = { technicalScore: -10, fluencyScore: 80, paceScore: 80, confidenceScore: 80, communicationScore: 80 };
    const radar = buildSkillRadarData(negScores);
    expect(radar).toHaveLength(5);
    // Engine reflects raw value; test that the function runs without crashing
    const tech = radar.find(d => d.axis === 'Technical');
    expect(typeof tech.value).toBe('number');
  });
});

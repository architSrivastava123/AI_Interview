/**
 * reportEngine.test.js
 * Comprehensive unit tests for the report engine.
 */

// Mock scoringEngine to isolate reportEngine logic
jest.mock('../../utils/engines/scoringEngine', () => ({
  scoreToGrade: jest.fn((score) => {
    if (score >= 88) return 'A';
    if (score >= 70) return 'B';
    if (score >= 52) return 'C';
    return 'F';
  }),
  getBenchmarkPercentile: jest.fn().mockReturnValue(65),
  calibrateQuestionDifficulty: jest.fn().mockReturnValue('Medium'),
}));

const {
  buildSessionReport,
  buildProgressReport,
  generateExportData,
  computeReportSummary,
  buildSkillRadarData,
} = require('../../utils/engines/reportEngine');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockSession = {
  mockId: 'test-123',
  jobPosition: 'Senior Frontend Engineer',
  interviewTrack: 'Frontend',
  jobExperience: '3',
  createdBy: 'test@example.com',
  jobDesc: 'React, TypeScript, GraphQL|||culture:standard',
  createdAt: '29-05-2025',
};

const mockAnswers = [
  {
    question: 'What is React reconciliation?',
    userAns: 'React reconciliation is the process of updating the DOM|||duration:42',
    correctAns: 'Reconciliation is the algorithm React uses to diff the tree.',
    feedback: 'Good answer but missing fiber details.',
    rating: '7',
  },
  {
    question: 'Explain useEffect cleanup',
    userAns: 'You return a function from useEffect to clean up|||duration:35',
    correctAns: 'Return a cleanup function to clear subscriptions/timers.',
    feedback: 'Correct and concise.',
    rating: '9',
  },
];

const mockScores = {
  compositeScore: 75,
  technicalScore: 70,
  fluencyScore: 80,
  paceScore: 85,
  confidenceScore: 72,
  communicationScore: 74,
};

const mockSessions = [
  { mockIdRef: 'a1', compositeScore: 60, jobTrack: 'Frontend', grade: 'C', completedAt: '01-05-2025' },
  { mockIdRef: 'a2', compositeScore: 72, jobTrack: 'Frontend', grade: 'B', completedAt: '02-05-2025' },
  { mockIdRef: 'a3', compositeScore: 85, jobTrack: 'Backend', grade: 'A', completedAt: '03-05-2025' },
];

const mockAnalytics = {
  avgCompositeScore: 72,
  currentStreak: 2,
  longestStreak: 3,
  improvementVelocity: 12.5,
  trendData: JSON.stringify([{ date: '01-05-2025', score: 60 }, { date: '03-05-2025', score: 85 }]),
  domainBreakdown: JSON.stringify([{ domain: 'Frontend', count: 2, avgScore: 66 }]),
};

// ─── buildSessionReport ───────────────────────────────────────────────────────

describe('buildSessionReport', () => {
  test('returns object with all required fields', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    expect(report).toHaveProperty('mockIdRef');
    expect(report).toHaveProperty('userEmail');
    expect(report).toHaveProperty('reportTitle');
    expect(report).toHaveProperty('executiveSummary');
    expect(report).toHaveProperty('reportData');
    expect(report).toHaveProperty('totalScore');
    expect(report).toHaveProperty('grade');
    expect(report).toHaveProperty('strengths');
    expect(report).toHaveProperty('weaknesses');
    expect(report).toHaveProperty('nextSteps');
  });

  test('reportData is valid JSON string', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    expect(() => JSON.parse(report.reportData)).not.toThrow();
  });

  test('parsed reportData contains questionDetails', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    const parsed = JSON.parse(report.reportData);
    expect(parsed.questionDetails).toHaveLength(mockAnswers.length);
  });

  test('each questionDetail has required fields', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    const parsed = JSON.parse(report.reportData);
    parsed.questionDetails.forEach(q => {
      expect(q).toHaveProperty('questionNumber');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('rating');
      expect(q).toHaveProperty('difficulty');
      expect(q).toHaveProperty('ratingLabel');
    });
  });

  test('sets userEmail from session.createdBy', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    expect(report.userEmail).toBe(mockSession.createdBy);
  });

  test('handles empty answers gracefully', () => {
    const report = buildSessionReport(mockSession, [], mockScores);
    expect(report).toHaveProperty('reportData');
    const parsed = JSON.parse(report.reportData);
    expect(parsed.questionDetails).toHaveLength(0);
  });

  test('handles null scores gracefully', () => {
    const report = buildSessionReport(mockSession, mockAnswers, null);
    expect(report.totalScore).toBe(0);
  });

  test('throws for null session', () => {
    expect(() => buildSessionReport(null, mockAnswers, mockScores)).toThrow();
  });

  test('strengths is valid JSON string', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    expect(() => JSON.parse(report.strengths)).not.toThrow();
  });

  test('radarData present in parsed reportData', () => {
    const report = buildSessionReport(mockSession, mockAnswers, mockScores);
    const parsed = JSON.parse(report.reportData);
    expect(parsed.radarData).toBeInstanceOf(Array);
    expect(parsed.radarData.length).toBe(5);
  });
});

// ─── buildProgressReport ──────────────────────────────────────────────────────

describe('buildProgressReport', () => {
  test('returns object with required fields', () => {
    const report = buildProgressReport(mockSessions, mockAnalytics);
    expect(report).toHaveProperty('totalSessions');
    expect(report).toHaveProperty('overallImprovement');
    expect(report).toHaveProperty('avgScore');
    expect(report).toHaveProperty('bestSession');
    expect(report).toHaveProperty('worstSession');
    expect(report).toHaveProperty('trend');
    expect(report).toHaveProperty('streak');
    expect(report).toHaveProperty('velocity');
  });

  test('totalSessions matches sessions array length', () => {
    const report = buildProgressReport(mockSessions, mockAnalytics);
    expect(report.totalSessions).toBe(mockSessions.length);
  });

  test('bestSession has highest score', () => {
    const report = buildProgressReport(mockSessions, mockAnalytics);
    expect(report.bestSession.score).toBe(85);
  });

  test('worstSession has lowest score', () => {
    const report = buildProgressReport(mockSessions, mockAnalytics);
    expect(report.worstSession.score).toBe(60);
  });

  test('overallImprovement is last - first score', () => {
    const report = buildProgressReport(mockSessions, mockAnalytics);
    expect(report.overallImprovement).toBe(85 - 60); // sorted ascending: 60 first, 85 last
  });

  test('handles empty sessions', () => {
    const report = buildProgressReport([], {});
    expect(report.totalSessions).toBe(0);
    expect(report.bestSession).toBeNull();
  });
});

// ─── generateExportData ───────────────────────────────────────────────────────

describe('generateExportData', () => {
  const sampleReport = {
    questionDetails: [
      { questionNumber: 1, question: 'Q1', difficulty: 'Medium', rating: 7, ratingLabel: 'Good', userAnswer: 'A1', wpm: 120, durationSeconds: 30, aiFeedback: 'Nice' },
      { questionNumber: 2, question: 'Q2', difficulty: 'Hard', rating: 9, ratingLabel: 'Excellent', userAnswer: 'A2', wpm: 130, durationSeconds: 40, aiFeedback: 'Great' },
    ],
  };

  test('JSON format produces parseable string', () => {
    const output = generateExportData(sampleReport, 'json');
    expect(() => JSON.parse(output)).not.toThrow();
  });

  test('JSON format preserves data', () => {
    const output = generateExportData(sampleReport, 'json');
    const parsed = JSON.parse(output);
    expect(parsed.questionDetails).toHaveLength(2);
  });

  test('CSV format has header row', () => {
    const output = generateExportData({ reportData: JSON.stringify(sampleReport) }, 'csv');
    const lines = output.split('\n');
    expect(lines[0]).toContain('Question #');
    expect(lines[0]).toContain('Rating');
  });

  test('CSV format has correct data rows', () => {
    const output = generateExportData({ reportData: JSON.stringify(sampleReport) }, 'csv');
    const lines = output.split('\n');
    expect(lines.length).toBeGreaterThan(1); // header + at least 1 row
  });

  test('throws for unsupported format', () => {
    expect(() => generateExportData(sampleReport, 'pdf')).toThrow();
  });

  test('throws for null data', () => {
    expect(() => generateExportData(null, 'json')).toThrow();
  });

  test('CSV quotes contain commas safely', () => {
    const reportWithCommas = {
      reportData: JSON.stringify({
        questionDetails: [
          { questionNumber: 1, question: 'Q1, with comma', difficulty: 'Medium', rating: 7, ratingLabel: 'Good', userAnswer: 'A', wpm: 0, durationSeconds: 0, aiFeedback: 'ok' }
        ]
      })
    };
    const output = generateExportData(reportWithCommas, 'csv');
    expect(output).toContain('"Q1, with comma"');
  });
});

// ─── computeReportSummary ─────────────────────────────────────────────────────

describe('computeReportSummary', () => {
  test('returns non-empty string', () => {
    const summary = computeReportSummary({ session: mockSession, scores: mockScores, grade: 'B', percentile: 65 });
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(20);
  });

  test('mentions grade in summary', () => {
    const summary = computeReportSummary({ session: mockSession, scores: mockScores, grade: 'B+', percentile: 70 });
    expect(summary).toContain('B+');
  });

  test('mentions composite score', () => {
    const summary = computeReportSummary({ session: mockSession, scores: { compositeScore: 80 }, grade: 'A', percentile: 80 });
    expect(summary).toContain('80');
  });

  test('uses exceptional language for high scores', () => {
    const summary = computeReportSummary({ session: mockSession, scores: { compositeScore: 90, technicalScore: 85 }, grade: 'A+', percentile: 95 });
    expect(summary.toLowerCase()).toContain('exceptional');
  });

  test('uses improvement language for low scores', () => {
    const summary = computeReportSummary({ session: mockSession, scores: { compositeScore: 30 }, grade: 'F', percentile: 10 });
    expect(summary.toLowerCase()).toContain('improvement');
  });

  test('handles missing session gracefully', () => {
    expect(() => computeReportSummary({ session: null, scores: mockScores, grade: 'B', percentile: 60 })).not.toThrow();
  });
});

// ─── buildSkillRadarData ──────────────────────────────────────────────────────

describe('buildSkillRadarData', () => {
  test('returns 5 dimensions', () => {
    const data = buildSkillRadarData(mockScores);
    expect(data).toHaveLength(5);
  });

  test('each item has axis, value, label', () => {
    const data = buildSkillRadarData(mockScores);
    data.forEach(d => {
      expect(d).toHaveProperty('axis');
      expect(d).toHaveProperty('value');
      expect(d).toHaveProperty('label');
    });
  });

  test('all values are in 0–100 range', () => {
    const data = buildSkillRadarData(mockScores);
    data.forEach(d => {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
    });
  });

  test('maps technicalScore to Technical axis', () => {
    const data = buildSkillRadarData(mockScores);
    const technical = data.find(d => d.axis === 'Technical');
    expect(technical.value).toBe(mockScores.technicalScore);
  });

  test('returns zeroed data for null scores', () => {
    const data = buildSkillRadarData(null);
    data.forEach(d => expect(d.value).toBe(0));
  });

  test('returns zeroed data for empty object', () => {
    const data = buildSkillRadarData({});
    data.forEach(d => expect(d.value).toBe(0));
  });
});

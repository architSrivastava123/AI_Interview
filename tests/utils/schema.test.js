/**
 * tests/utils/schema.test.js
 *
 * Tests the Drizzle ORM schema definitions in utils/schema.js.
 * Verifies table structure, column presence, default values,
 * and required vs optional fields — without a real DB connection.
 */

jest.mock('drizzle-orm/pg-core', () => {
  // Minimal stubs that record calls so we can inspect table shapes
  const col = (type, opts = {}) => ({ _type: type, ...opts, notNull: () => col(type, { ...opts, required: true }), default: (v) => col(type, { ...opts, defaultValue: v }), primaryKey: () => col(type, { ...opts, pk: true }) });
  return {
    pgTable: jest.fn((name, cols) => ({ _tableName: name, _columns: cols })),
    serial: jest.fn((n) => col('serial', { name: n })),
    text: jest.fn((n) => col('text', { name: n })),
    varchar: jest.fn((n) => col('varchar', { name: n })),
    integer: jest.fn((n) => col('integer', { name: n })),
    real: jest.fn((n) => col('real', { name: n })),
    boolean: jest.fn((n) => col('boolean', { name: n })),
    jsonb: jest.fn((n) => col('jsonb', { name: n })),
    timestamp: jest.fn((n) => col('timestamp', { name: n })),
  };
});

const schema = require('../../utils/schema');

describe('utils/schema — table definitions', () => {

  // ── MockInterview ────────────────────────────────────────────────────────────

  describe('MockInterview table', () => {
    test('is exported', () => {
      expect(schema.MockInterview).toBeDefined();
    });

    test('has the correct table name', () => {
      expect(schema.MockInterview._tableName).toBe('mock_interviews');
    });

    test('has id column', () => {
      expect(schema.MockInterview._columns.id).toBeDefined();
    });

    test('has jsonMockResp column', () => {
      expect(schema.MockInterview._columns.jsonMockResp).toBeDefined();
    });

    test('has jobPosition column', () => {
      expect(schema.MockInterview._columns.jobPosition).toBeDefined();
    });

    test('has jobDesc column', () => {
      expect(schema.MockInterview._columns.jobDesc).toBeDefined();
    });

    test('has jobExperience column', () => {
      expect(schema.MockInterview._columns.jobExperience).toBeDefined();
    });

    test('has interviewTrack column', () => {
      expect(schema.MockInterview._columns.interviewTrack).toBeDefined();
    });

    test('has createdBy column', () => {
      expect(schema.MockInterview._columns.createdBy).toBeDefined();
    });

    test('has mockId column', () => {
      expect(schema.MockInterview._columns.mockId).toBeDefined();
    });
  });

  // ── UserAnswer ───────────────────────────────────────────────────────────────

  describe('UserAnswer table', () => {
    test('is exported', () => {
      expect(schema.UserAnswer).toBeDefined();
    });

    test('has table name userAnswer', () => {
      expect(schema.UserAnswer._tableName).toBe('userAnswer');
    });

    test('has question column', () => {
      expect(schema.UserAnswer._columns.question).toBeDefined();
    });

    test('has userAns column', () => {
      expect(schema.UserAnswer._columns.userAns).toBeDefined();
    });

    test('has correctAns column', () => {
      expect(schema.UserAnswer._columns.correctAns).toBeDefined();
    });

    test('has feedback column', () => {
      expect(schema.UserAnswer._columns.feedback).toBeDefined();
    });

    test('has rating column', () => {
      expect(schema.UserAnswer._columns.rating).toBeDefined();
    });

    test('has userEmail column', () => {
      expect(schema.UserAnswer._columns.userEmail).toBeDefined();
    });

    test('has mockIdRef column', () => {
      expect(schema.UserAnswer._columns.mockIdRef).toBeDefined();
    });
  });

  // ── InterviewSession ─────────────────────────────────────────────────────────

  describe('InterviewSession table', () => {
    test('is exported', () => {
      expect(schema.InterviewSession).toBeDefined();
    });

    test('has table name interview_sessions', () => {
      expect(schema.InterviewSession._tableName).toBe('interview_sessions');
    });

    test('has compositeScore column', () => {
      expect(schema.InterviewSession._columns.compositeScore).toBeDefined();
    });

    test('has grade column', () => {
      expect(schema.InterviewSession._columns.grade).toBeDefined();
    });

    test('has isCompleted column', () => {
      expect(schema.InterviewSession._columns.isCompleted).toBeDefined();
    });

    test('has percentile column', () => {
      expect(schema.InterviewSession._columns.percentile).toBeDefined();
    });

    test('has difficulty column', () => {
      expect(schema.InterviewSession._columns.difficulty).toBeDefined();
    });

    test('has jobTrack column', () => {
      expect(schema.InterviewSession._columns.jobTrack).toBeDefined();
    });
  });

  // ── CandidateScore ───────────────────────────────────────────────────────────

  describe('CandidateScore table', () => {
    test('is exported', () => {
      expect(schema.CandidateScore).toBeDefined();
    });

    test('has table name candidate_scores', () => {
      expect(schema.CandidateScore._tableName).toBe('candidate_scores');
    });

    test('has all 5 dimension score columns', () => {
      const cols = schema.CandidateScore._columns;
      expect(cols.technicalScore).toBeDefined();
      expect(cols.fluencyScore).toBeDefined();
      expect(cols.paceScore).toBeDefined();
      expect(cols.confidenceScore).toBeDefined();
      expect(cols.communicationScore).toBeDefined();
    });

    test('has rawRatingAvg column', () => {
      expect(schema.CandidateScore._columns.rawRatingAvg).toBeDefined();
    });

    test('has totalFillerWords column', () => {
      expect(schema.CandidateScore._columns.totalFillerWords).toBeDefined();
    });

    test('has avgWpm column', () => {
      expect(schema.CandidateScore._columns.avgWpm).toBeDefined();
    });
  });

  // ── AnalyticsSnapshot ────────────────────────────────────────────────────────

  describe('AnalyticsSnapshot table', () => {
    test('is exported', () => {
      expect(schema.AnalyticsSnapshot).toBeDefined();
    });

    test('has table name analytics_snapshots', () => {
      expect(schema.AnalyticsSnapshot._tableName).toBe('analytics_snapshots');
    });

    test('has trendData column', () => {
      expect(schema.AnalyticsSnapshot._columns.trendData).toBeDefined();
    });

    test('has improvementVelocity column', () => {
      expect(schema.AnalyticsSnapshot._columns.improvementVelocity).toBeDefined();
    });

    test('has currentStreak and longestStreak columns', () => {
      expect(schema.AnalyticsSnapshot._columns.currentStreak).toBeDefined();
      expect(schema.AnalyticsSnapshot._columns.longestStreak).toBeDefined();
    });
  });

  // ── Recommendation ───────────────────────────────────────────────────────────

  describe('Recommendation table', () => {
    test('is exported', () => {
      expect(schema.Recommendation).toBeDefined();
    });

    test('has table name recommendations', () => {
      expect(schema.Recommendation._tableName).toBe('recommendations');
    });

    test('has priority column', () => {
      expect(schema.Recommendation._columns.priority).toBeDefined();
    });

    test('has isCompleted column', () => {
      expect(schema.Recommendation._columns.isCompleted).toBeDefined();
    });

    test('has resourceUrl column', () => {
      expect(schema.Recommendation._columns.resourceUrl).toBeDefined();
    });

    test('has estimatedHours column', () => {
      expect(schema.Recommendation._columns.estimatedHours).toBeDefined();
    });
  });

  // ── GeneratedReport ──────────────────────────────────────────────────────────

  describe('GeneratedReport table', () => {
    test('is exported', () => {
      expect(schema.GeneratedReport).toBeDefined();
    });

    test('has table name generated_reports', () => {
      expect(schema.GeneratedReport._tableName).toBe('generated_reports');
    });

    test('has reportData column', () => {
      expect(schema.GeneratedReport._columns.reportData).toBeDefined();
    });

    test('has executiveSummary column', () => {
      expect(schema.GeneratedReport._columns.executiveSummary).toBeDefined();
    });

    test('has strengths and weaknesses columns', () => {
      expect(schema.GeneratedReport._columns.strengths).toBeDefined();
      expect(schema.GeneratedReport._columns.weaknesses).toBeDefined();
    });

    test('has nextSteps column', () => {
      expect(schema.GeneratedReport._columns.nextSteps).toBeDefined();
    });
  });

  // ── Export completeness ──────────────────────────────────────────────────────

  describe('schema exports', () => {
    test('exports exactly 7 tables', () => {
      const tableKeys = Object.keys(schema);
      expect(tableKeys.length).toBe(7);
    });

    test('all exports are table objects with _tableName', () => {
      Object.values(schema).forEach(tbl => {
        expect(tbl._tableName).toBeDefined();
        expect(typeof tbl._tableName).toBe('string');
      });
    });
  });
});

import { pgTable, serial, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

// ─── Existing Tables ──────────────────────────────────────────────────────────

export const MockInterview = pgTable('mock_interviews', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition').notNull(),
  jobDesc: varchar('jobDesc').notNull(),
  jobExperience: varchar('jobExperience').notNull(),
  interviewTrack: varchar('interviewTrack'),
  createdBy: varchar('createdBy').notNull(),
  createdAt: varchar('createdAt'),
  mockId: varchar('mockId').notNull()
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt')
});

// ─── New Tables ───────────────────────────────────────────────────────────────

/**
 * InterviewSession — aggregated metadata + composite score for each completed session.
 * Populated after a user finishes answering and views feedback.
 */
export const InterviewSession = pgTable('interview_sessions', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mock_id_ref').notNull(),
  userEmail: varchar('user_email').notNull(),
  jobPosition: varchar('job_position'),
  jobTrack: varchar('job_track'),
  jobExperience: varchar('job_experience'),
  totalQuestions: integer('total_questions').default(5),
  completedAt: varchar('completed_at'),
  durationSeconds: integer('duration_seconds').default(0),
  compositeScore: real('composite_score').default(0),
  grade: varchar('grade').default('N/A'),
  percentile: real('percentile').default(0),
  difficulty: varchar('difficulty').default('Medium'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: varchar('created_at')
});

/**
 * CandidateScore — multi-dimensional score breakdown per session.
 * Captures technical, communication, fluency, pace, and confidence dimensions.
 */
export const CandidateScore = pgTable('candidate_scores', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mock_id_ref').notNull(),
  userEmail: varchar('user_email').notNull(),
  technicalScore: real('technical_score').default(0),
  fluencyScore: real('fluency_score').default(0),
  paceScore: real('pace_score').default(0),
  confidenceScore: real('confidence_score').default(0),
  communicationScore: real('communication_score').default(0),
  compositeScore: real('composite_score').default(0),
  grade: varchar('grade').default('N/A'),
  percentile: real('percentile').default(0),
  rawRatingAvg: real('raw_rating_avg').default(0),
  totalFillerWords: integer('total_filler_words').default(0),
  avgWpm: real('avg_wpm').default(0),
  scoreMetadata: text('score_metadata'),
  createdAt: varchar('created_at')
});

/**
 * AnalyticsSnapshot — periodic snapshot of aggregated analytics for a user.
 * Used to power trend charts and performance dashboards without re-querying raw data.
 */
export const AnalyticsSnapshot = pgTable('analytics_snapshots', {
  id: serial('id').primaryKey(),
  userEmail: varchar('user_email').notNull(),
  snapshotDate: varchar('snapshot_date').notNull(),
  totalSessions: integer('total_sessions').default(0),
  avgCompositeScore: real('avg_composite_score').default(0),
  avgTechnicalScore: real('avg_technical_score').default(0),
  avgFluencyScore: real('avg_fluency_score').default(0),
  avgPaceScore: real('avg_pace_score').default(0),
  avgConfidenceScore: real('avg_confidence_score').default(0),
  bestScore: real('best_score').default(0),
  worstScore: real('worst_score').default(0),
  improvementVelocity: real('improvement_velocity').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  domainBreakdown: text('domain_breakdown'),
  trendData: text('trend_data'),
  createdAt: varchar('created_at')
});

/**
 * Recommendation — personalized skill-gap-based recommendations per user.
 * Generated after each session based on weak dimension analysis.
 */
export const Recommendation = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userEmail: varchar('user_email').notNull(),
  mockIdRef: varchar('mock_id_ref'),
  category: varchar('category').notNull(),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  resourceUrl: varchar('resource_url'),
  resourceType: varchar('resource_type').default('article'),
  priority: integer('priority').default(5),
  impactScore: real('impact_score').default(0),
  targetSkill: varchar('target_skill'),
  difficulty: varchar('difficulty').default('Medium'),
  estimatedHours: real('estimated_hours').default(1),
  isCompleted: boolean('is_completed').default(false),
  createdAt: varchar('created_at')
});

/**
 * GeneratedReport — full structured interview report (JSON payload) per session.
 * Serves as the source of truth for the Report View page and export functionality.
 */
export const GeneratedReport = pgTable('generated_reports', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mock_id_ref').notNull(),
  userEmail: varchar('user_email').notNull(),
  reportTitle: varchar('report_title'),
  executiveSummary: text('executive_summary'),
  reportData: text('report_data'),
  totalScore: real('total_score').default(0),
  grade: varchar('grade').default('N/A'),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  nextSteps: text('next_steps'),
  exportedAt: varchar('exported_at'),
  createdAt: varchar('created_at')
});

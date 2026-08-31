/**
 * Report.js
 * Mongoose model for final aggregated interview reports.
 */

import mongoose from 'mongoose';

const SkillGapSchema = new mongoose.Schema({
  dimension: {
    type: String,
    required: true,
  },
  candidateAvg: {
    type: Number,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  gap: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['strong', 'on-track', 'needs-work', 'critical'],
    required: true,
  },
});

const ReportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
      index: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    fluencyScore: {
      type: Number,
      default: 0,
    },
    paceScore: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: 'N/A',
    },
    executiveSummary: {
      type: String,
      default: '',
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    skillGaps: [SkillGapSchema],
    recommendedTopics: {
      type: [String],
      default: [],
    },
    nextRecommendedDifficulty: {
      type: String,
      default: 'Medium',
    },
    questionSummaries: [
      {
        questionText: String,
        topic: String,
        difficulty: String,
        score: Number,
        feedback: String,
        missingConcepts: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ clerkUserId: 1, createdAt: -1 });

export const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema);

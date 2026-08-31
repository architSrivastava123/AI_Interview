/**
 * Interview.js
 * Mongoose model for Interview sessions and state tracking.
 */

import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
      default: 'Frontend Engineer',
    },
    jobDescription: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '2-4 years',
    },
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed', 'system_design'],
      default: 'mixed',
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['setup', 'in_progress', 'completed', 'abandoned'],
      default: 'setup',
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    compositeScore: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: 'N/A',
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InterviewSchema.index({ clerkUserId: 1, createdAt: -1 });

export const Interview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);

/**
 * Question.js
 * Mongoose model for individual questions within an interview.
 */

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    order: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'system_design', 'situational'],
      default: 'technical',
    },
    topic: {
      type: String,
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium',
    },
    expectedConcepts: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ['resume_rag', 'knowledge_rag', 'adaptive_followup', 'standard'],
      default: 'standard',
    },
    contextSnippet: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

QuestionSchema.index({ interviewId: 1, order: 1 });

export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

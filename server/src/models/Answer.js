/**
 * Answer.js
 * Mongoose model for candidate answers, speech metrics, evaluations, and dimension scores.
 */

import mongoose from 'mongoose';

const SpeechMetricsSchema = new mongoose.Schema({
  durationSeconds: {
    type: Number,
    default: 0,
  },
  wordCount: {
    type: Number,
    default: 0,
  },
  wpm: {
    type: Number,
    default: 0,
  },
  fillerCount: {
    type: Number,
    default: 0,
  },
  fillerWords: {
    type: [String],
    default: [],
  },
  fillerDensity: {
    type: Number,
    default: 0,
  },
});

const DimensionScoresSchema = new mongoose.Schema({
  technical: {
    type: Number,
    default: 0,
  },
  fluency: {
    type: Number,
    default: 0,
  },
  pace: {
    type: Number,
    default: 0,
  },
  confidence: {
    type: Number,
    default: 0,
  },
  communication: {
    type: Number,
    default: 0,
  },
  overall: {
    type: Number,
    default: 0,
  },
});

const EvaluationDetailsSchema = new mongoose.Schema({
  correctness: {
    type: Number,
    default: 0,
  },
  technicalDepth: {
    type: Number,
    default: 0,
  },
  relevance: {
    type: Number,
    default: 0,
  },
  feedback: {
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
  missingConcepts: {
    type: [String],
    default: [],
  },
});

const AnswerSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    answerText: {
      type: String,
      default: '',
    },
    speechMetrics: {
      type: SpeechMetricsSchema,
      default: () => ({}),
    },
    evaluation: {
      type: EvaluationDetailsSchema,
      default: () => ({}),
    },
    scores: {
      type: DimensionScoresSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

AnswerSchema.index({ interviewId: 1, questionId: 1 });

export const Answer = mongoose.models.Answer || mongoose.model('Answer', AnswerSchema);

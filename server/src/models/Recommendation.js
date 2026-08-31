/**
 * Recommendation.js
 * Mongoose model for personalized skill-gap practice recommendations.
 */

import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      default: null,
    },
    category: {
      type: String,
      enum: ['skill-gap', 'domain-focus', 'next-session', 'difficulty-ramp'],
      default: 'skill-gap',
    },
    skill: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    reason: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resourceUrl: {
      type: String,
      default: '',
    },
    resourceType: {
      type: String,
      default: 'article',
    },
    estimatedHours: {
      type: Number,
      default: 2,
    },
    difficulty: {
      type: String,
      default: 'Medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

RecommendationSchema.index({ clerkUserId: 1, isCompleted: 1, createdAt: -1 });

export const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);

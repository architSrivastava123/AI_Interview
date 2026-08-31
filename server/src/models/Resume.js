/**
 * Resume.js
 * Mongoose model for storing parsed resumes and vector chunks.
 */

import mongoose from 'mongoose';

const ChunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  chunkIndex: {
    type: Number,
    required: true,
  },
  embedding: {
    type: [Number],
    default: [],
  },
  section: {
    type: String,
    default: 'general',
  },
});

const ResumeSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    parsedSkills: {
      type: [String],
      default: [],
    },
    targetRole: {
      type: String,
      default: 'General',
    },
    chunks: [ChunkSchema],
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ clerkUserId: 1, createdAt: -1 });

export const Resume = mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);

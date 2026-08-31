/**
 * KnowledgeDoc.js
 * Mongoose model for storing indexed RAG technical knowledge base chunks.
 */

import mongoose from 'mongoose';

const KnowledgeDocSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      default: 'medium',
    },
    role: {
      type: String,
      default: 'general',
      index: true,
    },
    technology: {
      type: String,
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

KnowledgeDocSchema.index({ topic: 1, technology: 1, difficulty: 1 });

export const KnowledgeDoc = mongoose.models.KnowledgeDoc || mongoose.model('KnowledgeDoc', KnowledgeDocSchema);

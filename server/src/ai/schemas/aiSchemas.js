/**
 * aiSchemas.js
 * Zod validation schemas for structured LLM outputs.
 */

import { z } from 'zod';

export const QuestionOutputSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters long'),
  category: z.enum(['technical', 'behavioral', 'system_design', 'situational']).default('technical'),
  topic: z.string().default('General'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).default('Medium'),
  expectedConcepts: z.array(z.string()).default([]),
  contextSnippet: z.string().optional().default(''),
});

export const EvaluationOutputSchema = z.object({
  correctness: z.number().min(0).max(10).default(5),
  technicalDepth: z.number().min(0).max(10).default(5),
  relevance: z.number().min(0).max(10).default(5),
  feedback: z.string().min(5, 'Feedback is required'),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingConcepts: z.array(z.string()).default([]),
});

export const ReportSynthesisSchema = z.object({
  executiveSummary: z.string().min(10),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendedTopics: z.array(z.string()).default([]),
  nextRecommendedDifficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).default('Medium'),
});

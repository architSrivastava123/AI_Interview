/**
 * evaluationChain.js
 * LangChain pipeline for evaluating candidate answers with Zod validation.
 */

import { invokeGeminiJson } from '../models/geminiClient.js';
import { EVALUATION_SYSTEM_PROMPT, buildEvaluationPrompt } from '../prompts/evaluationPrompts.js';
import { EvaluationOutputSchema } from '../schemas/aiSchemas.js';

/**
 * Evaluates candidate answer using Gemini and validates with Zod.
 * @param {Object} params
 * @returns {Promise<Object>} Validated evaluation object
 */
export async function evaluateAnswer(params) {
  // If answer is blank or very short
  if (!params.answerText || params.answerText.trim().length < 5) {
    return {
      correctness: 1,
      technicalDepth: 1,
      relevance: 1,
      feedback: 'No substantial answer was provided for this question.',
      strengths: [],
      weaknesses: ['Empty or insufficient response provided.'],
      missingConcepts: params.expectedConcepts || [],
    };
  }

  const prompt = buildEvaluationPrompt(params);

  try {
    const rawOutput = await invokeGeminiJson(prompt, EVALUATION_SYSTEM_PROMPT, 0.2);
    const parsed = JSON.parse(rawOutput);
    const validated = EvaluationOutputSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn(`[EvaluationChain] Gemini evaluation failed (${error.message}). Using heuristic evaluation.`);
    return getFallbackEvaluation(params);
  }
}

/**
 * Heuristic fallback evaluation.
 */
function getFallbackEvaluation(params) {
  const words = (params.answerText || '').trim().split(/\s+/).length;
  const isReasonableLength = words >= 25;
  const rating = isReasonableLength ? 7.0 : 4.5;

  return {
    correctness: rating,
    technicalDepth: Math.max(1, rating - 0.5),
    relevance: rating,
    feedback: isReasonableLength
      ? 'The candidate provided a relevant response addressing the question directly with appropriate terminology.'
      : 'The answer was brief and lacked technical depth or trade-off explanations.',
    strengths: ['Addressed the main question topic'],
    weaknesses: isReasonableLength ? ['Could expand further on trade-offs'] : ['Brief answer with minimal technical detail'],
    missingConcepts: params.expectedConcepts?.slice(0, 2) || [],
  };
}

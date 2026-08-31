/**
 * questionChain.js
 * LangChain pipeline for generating structured interview questions with Zod validation.
 */

import { invokeGeminiJson } from '../models/geminiClient.js';
import { QUESTION_GENERATION_SYSTEM_PROMPT, buildQuestionPrompt } from '../prompts/interviewPrompts.js';
import { QuestionOutputSchema } from '../schemas/aiSchemas.js';

/**
 * Generates an interview question using Gemini and validates with Zod.
 * @param {Object} params
 * @returns {Promise<Object>} Validated question object
 */
export async function generateQuestion(params) {
  const prompt = buildQuestionPrompt(params);

  try {
    const rawOutput = await invokeGeminiJson(prompt, QUESTION_GENERATION_SYSTEM_PROMPT, 0.4);
    const parsed = JSON.parse(rawOutput);
    const validated = QuestionOutputSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.warn(`[QuestionChain] Gemini generation failed (${error.message}). Using fallback question.`);
    return getFallbackQuestion(params);
  }
}

/**
 * Fallback questions for offline / API outage situations.
 */
function getFallbackQuestion(params) {
  const role = (params.targetRole || 'Frontend').toLowerCase();
  const diff = params.difficulty || 'Medium';

  if (role.includes('front') || role.includes('react')) {
    return {
      question: 'Explain how React state reconciliation works, and describe when you would use useMemo vs useCallback.',
      category: 'technical',
      topic: 'React',
      difficulty: diff,
      expectedConcepts: ['Virtual DOM', 'Reconciliation', 'useMemo', 'useCallback', 'Referential equality'],
    };
  }

  if (role.includes('back') || role.includes('node')) {
    return {
      question: 'How does the Node.js event loop handle asynchronous I/O operations, and how do microtasks differ from macrotasks?',
      category: 'technical',
      topic: 'Node.js',
      difficulty: diff,
      expectedConcepts: ['Event loop', 'Call stack', 'libuv', 'Microtasks vs Macrotasks', 'Non-blocking I/O'],
    };
  }

  return {
    question: 'Describe a challenging technical problem you solved recently. What trade-offs did you consider?',
    category: 'behavioral',
    topic: 'Problem Solving',
    difficulty: diff,
    expectedConcepts: ['STAR Method', 'Trade-offs', 'Technical depth', 'Quantified results'],
  };
}
